import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { findRecentActivities, createActivityLog } from "./queries/activity";

export const activityRouter = createRouter({
  recent: publicQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findRecentActivities(input?.limit ?? 20);
    }),

  create: publicQuery
    .input(
      z.object({
        type: z.enum([
          "incident_created",
          "incident_updated",
          "analysis_generated",
          "query_executed",
          "source_connected",
          "alert_triggered",
        ]),
        message: z.string(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createActivityLog(input);
    }),
});
