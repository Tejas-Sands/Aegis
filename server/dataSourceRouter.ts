import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllDataSources,
  updateDataSourceStatus,
  seedDataSources,
} from "./_queries/dataSources";

export const dataSourceRouter = createRouter({
  list: publicQuery.query(async () => {
    await seedDataSources();
    return findAllDataSources();
  }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["connected", "disconnected", "error", "syncing"]),
      })
    )
    .mutation(async ({ input }) => {
      return updateDataSourceStatus(input.id, input.status);
    }),
});
