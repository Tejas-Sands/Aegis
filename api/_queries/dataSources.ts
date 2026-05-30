import { getDb } from "./connection";
import { dataSources } from "@db/schema";
import { eq } from "drizzle-orm";
import { memoryStore, isDbAvailable } from "./memoryStore";
import type { DataSource } from "@db/schema";

export async function findAllDataSources(): Promise<DataSource[]> {
  if (isDbAvailable()) {
    return getDb().select().from(dataSources).orderBy(dataSources.name);
  }
  return [...memoryStore.dataSources].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function updateDataSourceStatus(
  id: number,
  status: "connected" | "disconnected" | "error" | "syncing"
): Promise<DataSource | undefined> {
  if (isDbAvailable()) {
    await getDb()
      .update(dataSources)
      .set({
        status,
        lastSyncAt: status === "connected" ? new Date() : undefined,
      })
      .where(eq(dataSources.id, id));

    const [source] = await getDb()
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id))
      .limit(1);
    return source;
  }

  const source = memoryStore.dataSources.find((s) => s.id === id);
  if (source) {
    source.status = status;
    if (status === "connected") {
      source.lastSyncAt = new Date();
    }
  }
  return source;
}

export async function seedDataSources(): Promise<void> {
  if (isDbAvailable()) {
    const existing = await getDb().select().from(dataSources);
    if (existing.length > 0) return;

    await getDb().insert(dataSources).values([
      {
        name: "pagerduty",
        displayName: "PagerDuty",
        type: "api",
        status: "connected",
        lastSyncAt: new Date(),
        icon: "bell",
      },
      {
        name: "datadog",
        displayName: "Datadog",
        type: "api",
        status: "connected",
        lastSyncAt: new Date(),
        icon: "activity",
      },
      {
        name: "github",
        displayName: "GitHub",
        type: "api",
        status: "connected",
        lastSyncAt: new Date(),
        icon: "github",
      },
      {
        name: "sentry",
        displayName: "Sentry",
        type: "api",
        status: "connected",
        lastSyncAt: new Date(),
        icon: "bug",
      },
      {
        name: "slack",
        displayName: "Slack",
        type: "api",
        status: "connected",
        lastSyncAt: new Date(),
        icon: "message-square",
      },
    ]);
    return;
  }

  if (memoryStore.dataSources.length > 0) return;

  memoryStore.dataSources = [
    {
      id: 1,
      name: "pagerduty",
      displayName: "PagerDuty",
      type: "api",
      status: "connected",
      lastSyncAt: new Date(),
      config: null,
      errorMessage: null,
      icon: "bell",
    },
    {
      id: 2,
      name: "datadog",
      displayName: "Datadog",
      type: "api",
      status: "connected",
      lastSyncAt: new Date(),
      config: null,
      errorMessage: null,
      icon: "activity",
    },
    {
      id: 3,
      name: "github",
      displayName: "GitHub",
      type: "api",
      status: "connected",
      lastSyncAt: new Date(),
      config: null,
      errorMessage: null,
      icon: "github",
    },
    {
      id: 4,
      name: "sentry",
      displayName: "Sentry",
      type: "api",
      status: "connected",
      lastSyncAt: new Date(),
      config: null,
      errorMessage: null,
      icon: "bug",
    },
    {
      id: 5,
      name: "slack",
      displayName: "Slack",
      type: "api",
      status: "connected",
      lastSyncAt: new Date(),
      config: null,
      errorMessage: null,
      icon: "message-square",
    },
  ];
  memoryStore.idCounters.dataSources = 6;
}
