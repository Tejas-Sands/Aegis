import { getDb } from "./connection";
import { incidents, incidentAnalyses } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { memoryStore, isDbAvailable } from "./memoryStore";
import type { Incident, IncidentAnalysis } from "@db/schema";

export async function findIncidents(filters?: {
  status?: string;
  urgency?: string;
  service?: string;
  limit?: number;
  offset?: number;
}): Promise<{ incidents: Incident[]; total: number }> {
  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;

  if (isDbAvailable()) {
    const db = getDb();
    const conditions = [];
    if (filters?.status) {
      conditions.push(
        eq(incidents.status, filters.status as "triggered" | "acknowledged" | "resolved")
      );
    }
    if (filters?.urgency) {
      conditions.push(eq(incidents.urgency, filters.urgency as "high" | "low"));
    }
    if (filters?.service) {
      conditions.push(eq(incidents.service, filters.service));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(incidents)
        .where(where)
        .orderBy(desc(incidents.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(incidents)
        .where(where),
    ]);

    return { incidents: items, total: countResult[0]?.count ?? 0 };
  }

  let filtered = memoryStore.incidents;
  if (filters?.status) {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  if (filters?.urgency) {
    filtered = filtered.filter((i) => i.urgency === filters.urgency);
  }
  if (filters?.service) {
    filtered = filtered.filter((i) => i.service === filters.service);
  }

  filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    incidents: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export async function findIncidentById(id: number): Promise<Incident | null> {
  if (isDbAvailable()) {
    const db = getDb();
    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);
    return incident ?? null;
  }
  return memoryStore.incidents.find((i) => i.id === id) ?? null;
}

export async function createIncident(data: {
  title: string;
  service: string;
  urgency: "high" | "low";
  description?: string;
  severity?: "critical" | "major" | "minor" | "warning";
  externalId?: string;
}): Promise<Incident> {
  const extId =
    data.externalId ??
    `AEG-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

  if (isDbAvailable()) {
    const db = getDb();
    const [inserted] = await db
      .insert(incidents)
      .values({
        ...data,
        externalId: extId,
      })
      .returning();
    const incident = await findIncidentById(inserted.id);
    return incident!;
  }

  const now = new Date();
  const incident: Incident = {
    id: memoryStore.nextId("incidents"),
    externalId: extId,
    title: data.title,
    service: data.service,
    urgency: data.urgency,
    status: "triggered",
    description: data.description ?? null,
    severity: data.severity ?? "warning",
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  };

  memoryStore.incidents.push(incident);
  return incident;
}

export async function updateIncidentStatus(
  id: number,
  status: "triggered" | "acknowledged" | "resolved"
): Promise<Incident | null> {
  if (isDbAvailable()) {
    const db = getDb();
    await db
      .update(incidents)
      .set({
        status,
        resolvedAt: status === "resolved" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, id));
    return findIncidentById(id);
  }

  const incident = memoryStore.incidents.find((i) => i.id === id);
  if (incident) {
    incident.status = status;
    incident.updatedAt = new Date();
    if (status === "resolved") {
      incident.resolvedAt = new Date();
    }
  }
  return incident ?? null;
}

export async function findAnalysisByIncidentId(
  incidentId: number
): Promise<IncidentAnalysis | null> {
  if (isDbAvailable()) {
    const db = getDb();
    const [analysis] = await db
      .select()
      .from(incidentAnalyses)
      .where(eq(incidentAnalyses.incidentId, incidentId))
      .orderBy(desc(incidentAnalyses.generatedAt))
      .limit(1);
    return analysis ?? null;
  }

  const analyses = memoryStore.analyses
    .filter((a) => a.incidentId === incidentId)
    .sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  return analyses[0] ?? null;
}

export async function createAnalysis(data: {
  incidentId: number;
  summary: string;
  rootCause: string;
  contributingFactors: unknown;
  recommendedActions: unknown;
  confidence: string;
  relatedCommits: unknown;
  errorPatterns: unknown;
  metricAnomalies: unknown;
  slackContext: string;
  modelUsed: string;
}): Promise<IncidentAnalysis> {
  if (isDbAvailable()) {
    const db = getDb();
    const [inserted] = await db
      .insert(incidentAnalyses)
      .values(data)
      .returning();
    const [analysis] = await db
      .select()
      .from(incidentAnalyses)
      .where(eq(incidentAnalyses.id, inserted.id))
      .limit(1);
    return analysis!;
  }

  const analysis: IncidentAnalysis = {
    id: memoryStore.nextId("analyses"),
    incidentId: data.incidentId,
    summary: data.summary,
    rootCause: data.rootCause,
    contributingFactors: data.contributingFactors,
    recommendedActions: data.recommendedActions,
    confidence: data.confidence,
    relatedCommits: data.relatedCommits,
    errorPatterns: data.errorPatterns,
    metricAnomalies: data.metricAnomalies,
    slackContext: data.slackContext,
    generatedAt: new Date(),
    modelUsed: data.modelUsed,
  };

  memoryStore.analyses.push(analysis);
  return analysis;
}

export async function getIncidentStats(): Promise<{
  totalIncidents: number;
  resolvedIncidents: number;
  activeAlerts: number;
}> {
  if (isDbAvailable()) {
    const db = getDb();
    const [totalResult, resolvedResult, criticalResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(incidents),
      db
        .select({ count: sql<number>`count(*)` })
        .from(incidents)
        .where(eq(incidents.status, "resolved")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(incidents)
        .where(eq(incidents.severity, "critical")),
    ]);

    return {
      totalIncidents: totalResult[0]?.count ?? 0,
      resolvedIncidents: resolvedResult[0]?.count ?? 0,
      activeAlerts: criticalResult[0]?.count ?? 0,
    };
  }

  const all = memoryStore.incidents;
  return {
    totalIncidents: all.length,
    resolvedIncidents: all.filter((i) => i.status === "resolved").length,
    activeAlerts: all.filter((i) => i.severity === "critical").length,
  };
}
