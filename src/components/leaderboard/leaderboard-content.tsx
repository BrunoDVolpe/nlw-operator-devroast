import { cacheLife } from "next/cache";

import { Meta } from "@/components/ui/typography";
import { caller } from "@/trpc/server";

import { LeaderboardEntry } from "./leaderboard-entry";

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export async function LeaderboardContent() {
  "use cache";

  cacheLife("hours");

  const { entries, metrics } = await caller.leaderboard.page();

  return (
    <>
      <div className="w-full overflow-hidden border border-border-primary">
        <div className="flex h-10 items-center gap-6 border-b border-border-primary bg-bg-surface px-5 font-mono text-[12px] font-medium text-text-tertiary">
          <div className="w-[50px]">#</div>
          <div className="w-[70px]">score</div>
          <div className="flex-1">snippet</div>
          <div className="w-[100px]">lang</div>
        </div>

        {entries.map((entry) => (
          <LeaderboardEntry
            key={`${entry.rank}-${entry.language}-${entry.score}`}
            entry={entry}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Meta>
          showing top {entries.length} of {formatCount(metrics.totalRoasts)} ·
          avg score: {metrics.avgScore.toFixed(1)}/10
        </Meta>
      </div>
    </>
  );
}
