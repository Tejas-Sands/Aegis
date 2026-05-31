import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { generateSQLFromNL, askAIQuestion } from "./lib/ai";
import { executeCoralQuery, isCoralInstalled, listCoralSources } from "./lib/coral";
import { createActivityLog } from "./_queries/activity";

export const aiRouter = createRouter({
  generateQuery: publicQuery
    .input(
      z.object({
        naturalLanguage: z.string().min(1),
        sources: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateSQLFromNL(input);
      await createActivityLog({
        type: "query_executed",
        message: `Natural language query converted to SQL: "${input.naturalLanguage.substring(0, 50)}..."`,
        metadata: { sql: result.sql },
      });
      return result;
    }),

  executeSQL: publicQuery
    .input(
      z.object({
        sql: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return executeCoralQuery(input.sql);
    }),

  checkCoralStatus: publicQuery.query(async () => {
    return {
      installed: await isCoralInstalled(),
    };
  }),

  coralSources: publicQuery.query(async () => {
    return listCoralSources();
  }),

  ask: publicQuery
    .input(
      z.object({
        question: z.string().min(1),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return askAIQuestion(input);
    }),
});
