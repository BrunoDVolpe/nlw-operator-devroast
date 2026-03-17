"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

function MetricValue({
  value,
  suffix,
  decimals,
}: {
  value: number;
  suffix?: string;
  decimals?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1 font-sans text-[12px] text-text-tertiary">
      <NumberFlow
        value={value}
        format={{
          minimumFractionDigits: decimals ? 1 : 0,
          maximumFractionDigits: decimals ? 1 : 0,
        }}
      />
      {suffix ? <span className="text-text-tertiary">{suffix}</span> : null}
    </span>
  );
}

export function HomeMetrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.metrics.homepage.queryOptions());

  const roastedCodesCount = data?.roastedCodesCount ?? 0;
  const avgScore = data?.avgScore ?? 0;

  return (
    <div className="flex items-center justify-center gap-6 text-[12px] text-text-tertiary">
      <span className="font-sans">
        <MetricValue value={roastedCodesCount} /> codes roasted
      </span>
      <span className="font-mono">·</span>
      <span className="font-sans">
        avg score: <MetricValue value={avgScore} suffix="/10" decimals />
      </span>
    </div>
  );
}
