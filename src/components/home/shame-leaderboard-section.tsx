import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Description,
  SectionTitleLabel,
  SectionTitleRoot,
  SectionTitleSlash,
} from "@/components/ui/typography";

import { ShameLeaderboardContent } from "./shame-leaderboard-content";
import { ShameLeaderboardSkeleton } from "./shame-leaderboard-skeleton";

export function ShameLeaderboardSection() {
  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <div className="flex w-full items-center justify-between">
        <SectionTitleRoot>
          <SectionTitleSlash>{"//"}</SectionTitleSlash>
          <SectionTitleLabel>shame_leaderboard</SectionTitleLabel>
        </SectionTitleRoot>
        <Button variant="link">$ view_all &gt;&gt;</Button>
      </div>

      <Description>
        {"// the worst code on the internet, ranked by shame"}
      </Description>

      <Suspense fallback={<ShameLeaderboardSkeleton />}>
        <ShameLeaderboardContent />
      </Suspense>
    </section>
  );
}
