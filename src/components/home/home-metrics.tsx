"use client";

import NumberFlow from "@number-flow/react";
import * as React from "react";

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

export type HomeMetricsProps = {
  roastedCodesCount: number;
  avgScore: number;
};

export function HomeMetrics({ roastedCodesCount, avgScore }: HomeMetricsProps) {
  const [animatedRoastedCodesCount, setAnimatedRoastedCodesCount] =
    React.useState(0);
  const [animatedAvgScore, setAnimatedAvgScore] = React.useState(0);

  React.useEffect(() => {
    setAnimatedRoastedCodesCount(roastedCodesCount);
    setAnimatedAvgScore(avgScore);
  }, [roastedCodesCount, avgScore]);

  return (
    <div className="flex items-center justify-center gap-6 text-[12px] text-text-tertiary">
      <span className="font-sans">
        <MetricValue value={animatedRoastedCodesCount} /> codes roasted
      </span>
      <span className="font-mono">·</span>
      <span className="font-sans">
        avg score:{" "}
        <MetricValue value={animatedAvgScore} suffix="/10" decimals />
      </span>
    </div>
  );
}
