import { authRouter } from "./auth-router";
import { incidentRouter } from "./incidentRouter";
import { analysisRouter } from "./analysisRouter";
import { dataSourceRouter } from "./dataSourceRouter";
import { activityRouter } from "./activityRouter";
import { aiRouter } from "./aiRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  incident: incidentRouter,
  analysis: analysisRouter,
  dataSource: dataSourceRouter,
  activity: activityRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
