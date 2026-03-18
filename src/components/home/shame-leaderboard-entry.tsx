import type { BundledLanguage } from "shiki";

import { CodeBlock } from "@/components/ui/code-block";

import { ShameLeaderboardEntryToggle } from "./shame-leaderboard-entry-toggle";

export type ShameLeaderboardEntryProps = {
  entry: {
    rank: number;
    score: number;
    language: string;
    code: string;
  };
};

export async function ShameLeaderboardEntry({
  entry,
}: ShameLeaderboardEntryProps) {
  const lineCount = entry.code.split("\n").length;

  return (
    <ShameLeaderboardEntryToggle
      rank={entry.rank}
      score={entry.score}
      language={entry.language}
      lineCount={lineCount}
    >
      <CodeBlock
        code={entry.code}
        language={entry.language as BundledLanguage}
      />
    </ShameLeaderboardEntryToggle>
  );
}
