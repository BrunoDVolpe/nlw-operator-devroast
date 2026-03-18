"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import * as React from "react";

import { cn } from "@/lib/cn";

export type LeaderboardEntryToggleProps = {
  rank: number;
  score: number;
  language: string;
  lineCount: number;
  children: React.ReactNode;
};

export function LeaderboardEntryToggle({
  rank,
  score,
  language,
  lineCount,
  children,
}: LeaderboardEntryToggleProps) {
  const [open, setOpen] = React.useState(false);
  const label = open ? "collapse code" : "expand code";

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="border-b border-border-primary"
    >
      <Collapsible.Trigger className="flex w-full items-center gap-6 px-5 py-4 text-left font-mono text-[12px]">
        <div className="w-[50px] text-text-tertiary">
          <span
            className={rank === 1 ? "text-accent-amber" : "text-text-tertiary"}
          >
            {rank}
          </span>
        </div>
        <div className="w-[70px] font-bold text-accent-red">
          {score.toFixed(1)}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-text-secondary">
          <span>{lineCount} lines</span>
          <span className="text-text-tertiary">· click to {label}</span>
        </div>
        <div className="flex w-[100px] items-center justify-between text-text-tertiary">
          <span className="text-text-secondary">{language}</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn(
              "h-4 w-4 transition-transform",
              open ? "rotate-180" : "rotate-0",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </Collapsible.Trigger>

      <div className="px-5 pb-4">
        <div
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            open ? "max-h-[2200px]" : "max-h-[92px]",
          )}
        >
          {children}
          {!open ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-page to-transparent" />
          ) : null}
        </div>
      </div>
    </Collapsible.Root>
  );
}
