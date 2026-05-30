import { relations } from "drizzle-orm";
import { incidents, incidentAnalyses } from "./schema";

export const incidentsRelations = relations(incidents, ({ many }) => ({
  analyses: many(incidentAnalyses),
}));

export const incidentAnalysesRelations = relations(incidentAnalyses, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentAnalyses.incidentId],
    references: [incidents.id],
  }),
}));
