import { caller } from "@/trpc/server";

import { HomeMetrics } from "./home-metrics";

export async function HomeMetricsData() {
  const metrics = await caller.metrics.homepage();

  return (
    <HomeMetrics
      roastedCodesCount={metrics.roastedCodesCount}
      avgScore={metrics.avgScore}
    />
  );
}
