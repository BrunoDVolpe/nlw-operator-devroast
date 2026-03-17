import type { BundledLanguage } from "shiki";

import { CodeBlock, CodeBlockRoot } from "@/components/ui/code-block";
import { Meta } from "@/components/ui/typography";

type LeaderboardEntry = {
  rank: number;
  score: string;
  language: BundledLanguage;
  code: string;
};

const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: 1,
    score: "1.2",
    language: "javascript",
    code: [
      'eval(prompt("enter code"))',
      "document.write(response)",
      "// trust the user lol",
    ].join("\n"),
  },
  {
    rank: 2,
    score: "1.8",
    language: "typescript",
    code: [
      "if (x == true) { return true; }",
      "else if (x == false) { return false; }",
      "else { return !false; }",
    ].join("\n"),
  },
  {
    rank: 3,
    score: "2.1",
    language: "sql",
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"].join(
      "\n",
    ),
  },
  {
    rank: 4,
    score: "2.3",
    language: "java",
    code: ["catch (e) {", "  // ignore", "}"].join("\n"),
  },
  {
    rank: 5,
    score: "2.5",
    language: "javascript",
    code: [
      "const sleep = (ms) =>",
      "  new Date(Date.now() + ms)",
      "  while(new Date() < end) {}",
    ].join("\n"),
  },
];

export const metadata = {
  title: "Shame Leaderboard | Devroast",
  description: "The most roasted code on the internet.",
};

export default function LeaderboardPage() {
  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-10 sm:px-10 lg:px-20">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3 font-mono text-[28px] font-bold text-text-primary sm:text-[32px]">
            <span className="text-accent-green">&gt;</span>
            <span>shame_leaderboard</span>
          </div>
          <p className="font-mono text-[14px] text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>
          <div className="flex items-center gap-3 font-mono text-[12px] text-text-tertiary">
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          {leaderboardEntries.map((entry) => {
            const lineCount = entry.code.split("\n").length;

            return (
              <CodeBlockRoot
                key={`${entry.rank}-${entry.language}`}
                className="min-h-[120px]"
              >
                <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
                  <div className="flex items-center gap-4 font-mono">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <span className="text-text-tertiary">#</span>
                      <span className="font-bold text-accent-amber">
                        {entry.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="text-text-tertiary">score</span>
                      <span className="text-[13px] font-bold text-accent-red">
                        {entry.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[12px]">
                    <span className="text-text-secondary">
                      {entry.language}
                    </span>
                    <span className="text-text-tertiary">
                      {lineCount} lines
                    </span>
                  </div>
                </div>
                <CodeBlock code={entry.code} language={entry.language} />
              </CodeBlockRoot>
            );
          })}
        </section>

        <div className="flex justify-center">
          <Meta>showing top 5 of 2,847</Meta>
        </div>
      </div>
    </main>
  );
}
