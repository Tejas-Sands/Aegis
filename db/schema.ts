import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

// Define PG Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const urgencyEnum = pgEnum("urgency", ["high", "low"]);
export const statusEnum = pgEnum("status", ["triggered", "acknowledged", "resolved"]);
export const severityEnum = pgEnum("severity", ["critical", "major", "minor", "warning"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "incident_created",
  "incident_updated",
  "analysis_generated",
  "query_executed",
  "source_connected",
  "alert_triggered",
]);
export const dataSourceTypeEnum = pgEnum("data_source_type", ["api", "database", "file"]);
export const dataSourceStatusEnum = pgEnum("data_source_status", ["connected", "disconnected", "error", "syncing"]);
export const queryStatusEnum = pgEnum("query_status", ["success", "error", "timeout"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Incidents table
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  urgency: urgencyEnum("urgency").notNull().default("low"),
  status: statusEnum("status")
    .notNull()
    .default("triggered"),
  description: text("description"),
  severity: severityEnum("severity")
    .notNull()
    .default("warning"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// Incident Analyses table
export const incidentAnalyses = pgTable("incident_analyses", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id")
    .notNull(),
  summary: text("summary").notNull(),
  rootCause: text("root_cause").notNull(),
  contributingFactors: jsonb("contributing_factors"),
  recommendedActions: jsonb("recommended_actions"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  relatedCommits: jsonb("related_commits"),
  errorPatterns: jsonb("error_patterns"),
  metricAnomalies: jsonb("metric_anomalies"),
  slackContext: text("slack_context"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  modelUsed: varchar("model_used", { length: 100 }).notNull(),
});

export type IncidentAnalysis = typeof incidentAnalyses.$inferSelect;

// Data Sources table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  type: dataSourceTypeEnum("type").notNull(),
  status: dataSourceStatusEnum("status")
    .notNull()
    .default("disconnected"),
  lastSyncAt: timestamp("last_sync_at"),
  config: jsonb("config"),
  errorMessage: text("error_message"),
  icon: varchar("icon", { length: 50 }),
});

export type DataSource = typeof dataSources.$inferSelect;

// Queries table
export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  sql: text("sql").notNull(),
  sources: jsonb("sources").notNull(),
  executionTime: integer("execution_time").notNull(),
  rowCount: integer("row_count").notNull(),
  status: queryStatusEnum("status")
    .notNull()
    .default("success"),
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
});

export type Query = typeof queries.$inferSelect;

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
