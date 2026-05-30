import { getDb } from "./connection";
import { activityLogs } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { memoryStore, isDbAvailable } from "./memoryStore";
import type { ActivityLog } from "@db/schema";

export async function findRecentActivities(limit: number = 20): Promise<ActivityLog[]> {
  if (isDbAvailable()) {
    return getDb()
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  return [...memoryStore.activityLogs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function createActivityLog(data: {
  type:
    | "incident_created"
    | "incident_updated"
    | "analysis_generated"
    | "query_executed"
    | "source_connected"
    | "alert_triggered";
  message: string;
  metadata?: unknown;
  userId?: string;
}): Promise<ActivityLog> {
  if (isDbAvailable()) {
    const db = getDb();
    const [inserted] = await db.insert(activityLogs).values(data).returning();
    const id = inserted.id;
    const [log] = await db
      .select()
      .from(activityLogs)
      .where(sql`${activityLogs.id} = ${id}`)
      .limit(1);
    return log;
  }

  const log: ActivityLog = {
    id: memoryStore.nextId("activityLogs"),
    type: data.type,
    message: data.message,
    metadata: data.metadata ?? null,
    createdAt: new Date(),
    userId: data.userId ?? null,
  };

  memoryStore.activityLogs.push(log);
  return log;
}
