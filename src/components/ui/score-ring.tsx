import type * as React from "react";

import { cn } from "@/lib/cn";

export type ScoreRingProps = React.HTMLAttributes<HTMLDivElement> & {
  score: number;
  maxScore?: number;
};

export const ScoreRing = ({
  score,
  maxScore = 10,
  className,
  ...props
}: ScoreRingProps) => {
  const radius = 86;
  const strokeWidth = 4;
  const center = 90;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(score / maxScore, 1);
  const dashOffset = circumference * (1 - ratio);

  const scoreColor =
    score <= 3
      ? "text-accent-red"
      : score <= 5
        ? "text-accent-amber"
        : "text-accent-green";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: 180, height: 180 }}
      {...props}
    >
      <svg
        width={180}
        height={180}
        viewBox={`0 0 ${center * 2} ${center * 2}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border-primary"
        />

        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="origin-center -rotate-90"
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      </svg>

      <div className="flex flex-col items-center">
        <span
          className={cn(
            "font-mono text-[48px] font-bold leading-none",
            scoreColor,
          )}
        >
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-[16px] text-text-tertiary">/10</span>
      </div>
    </div>
  );
};
