import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findIncidents,
  findIncidentById,
  createIncident,
  updateIncidentStatus,
  getIncidentStats,
} from "./queries/incidents";
import { createActivityLog } from "./queries/activity";
import { seedDataSources } from "./queries/dataSources";
import { generateMockIncidents } from "./lib/mockData";

export const incidentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z
          .enum(["triggered", "acknowledged", "resolved"])
          .optional(),
        urgency: z.enum(["high", "low"]).optional(),
        service: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return findIncidents(input);
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findIncidentById(input.id);
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        service: z.string().min(1),
        urgency: z.enum(["high", "low"]),
        description: z.string().optional(),
        severity: z
          .enum(["critical", "major", "minor", "warning"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const incident = await createIncident(input);
      await createActivityLog({
        type: "incident_created",
        message: `New incident created: ${incident.title} [${incident.service}]`,
        metadata: { incidentId: incident.id, severity: incident.severity },
      });
      return incident;
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["triggered", "acknowledged", "resolved"]),
      })
    )
    .mutation(async ({ input }) => {
      const incident = await updateIncidentStatus(input.id, input.status);
      await createActivityLog({
        type: "incident_updated",
        message: `Incident ${incident?.externalId} marked as ${input.status}`,
        metadata: {
          incidentId: input.id,
          newStatus: input.status,
        },
      });
      return incident;
    }),

  stats: publicQuery.query(async () => {
    return getIncidentStats();
  }),

  seed: publicQuery.mutation(async () => {
    const mockData = generateMockIncidents(12);
    const created = [];
    for (const data of mockData) {
      const incident = await createIncident({
        title: data.title,
        service: data.service,
        urgency: data.urgency,
        description: data.description,
        severity: data.severity,
        externalId: data.externalId,
      });
      created.push(incident);
    }
    await seedDataSources();
    return { count: created.length };
  }),
});
