import { Suspense } from "react";

import { Description } from "@/components/ui/typography";

import { LeaderboardContent } from "./leaderboard-content";
import { LeaderboardSkeleton } from "./leaderboard-skeleton";

export function LeaderboardSection() {
  return (
    <section className="flex flex-col gap-5">
      <Description>{"// the most roasted code on the internet"}</Description>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </section>
  );
}
