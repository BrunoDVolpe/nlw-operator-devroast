import { cacheLife } from "next/cache";

import { caller } from "@/trpc/server";

import { HomeMetrics } from "./home-metrics";

export async function HomeMetricsData() {
  "use cache";

  cacheLife("hours");

  const metrics = await caller.metrics.homepage();

  return (
    <HomeMetrics
      roastedCodesCount={metrics.roastedCodesCount}
      avgScore={metrics.avgScore}
    />
  );
}
