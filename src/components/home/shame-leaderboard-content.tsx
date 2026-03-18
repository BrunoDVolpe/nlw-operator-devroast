import Link from "next/link";

import { Meta } from "@/components/ui/typography";
import { caller } from "@/trpc/server";

import { ShameLeaderboardEntry } from "./shame-leaderboard-entry";

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export async function ShameLeaderboardContent() {
  const { entries, metrics } = await caller.leaderboard.homepage();

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
          <ShameLeaderboardEntry
            key={`${entry.rank}-${entry.language}-${entry.score}`}
            entry={entry}
          />
        ))}
      </div>

      <div className="flex justify-center py-4">
        <Meta className="text-text-tertiary">
          showing top {entries.length} of {formatCount(metrics.totalRoasts)} ·
          avg score: {metrics.avgScore.toFixed(1)}/10 ·{" "}
          <Link
            href="/leaderboard"
            className="text-text-tertiary transition-colors hover:text-text-primary"
          >
            view full leaderboard &gt;&gt;
          </Link>
        </Meta>
      </div>
    </>
  );
}
