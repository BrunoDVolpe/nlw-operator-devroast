import type { BundledLanguage } from "shiki";

import { CodeBlock, CodeBlockRoot } from "@/components/ui/code-block";

import { LeaderboardEntryToggle } from "./leaderboard-entry-toggle";

export type LeaderboardEntryProps = {
  entry: {
    rank: number;
    score: number;
    language: string;
    code: string;
  };
};

export async function LeaderboardEntry({ entry }: LeaderboardEntryProps) {
  const lineCount = entry.code.split("\n").length;

  return (
    <LeaderboardEntryToggle
      rank={entry.rank}
      score={entry.score}
      language={entry.language}
      lineCount={lineCount}
    >
      <CodeBlockRoot>
        <CodeBlock
          code={entry.code}
          language={entry.language as BundledLanguage}
        />
      </CodeBlockRoot>
    </LeaderboardEntryToggle>
  );
}
