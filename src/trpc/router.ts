import { baseProcedure, createTRPCRouter } from "./init";

const homepageMetrics = {
  roastedCodesCount: 2847,
  avgScore: 4.2,
};

const metricsRouter = createTRPCRouter({
  homepage: baseProcedure.query(() => homepageMetrics),
});

export const appRouter = createTRPCRouter({
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
