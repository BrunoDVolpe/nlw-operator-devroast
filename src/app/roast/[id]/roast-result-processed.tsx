import type { BundledLanguage } from "shiki";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock, CodeBlockRoot } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  StatusBadgeDot,
  StatusBadgeLabel,
  StatusBadgeRoot,
} from "@/components/ui/status-badge";
import {
  SectionTitleLabel,
  SectionTitleRoot,
  SectionTitleSlash,
} from "@/components/ui/typography";

export type RoastResultProcessedProps = {
  submission: {
    id: string;
    code: string;
    language: string;
    score: string | null;
    roastSummary: string | null;
    roastQuote: string | null;
    analysisIssues: {
      severity: "critical" | "warning" | "good";
      title: string;
      description: string;
    }[];
    diffSuggestions: {
      fromFile: string;
      toFile: string;
      unifiedDiff: string;
    } | null;
  };
};

function parseDiff(unifiedDiff: string) {
  const lines = unifiedDiff.split("\n");
  const parsedLines: {
    variant: "context" | "removed" | "added";
    code: string;
  }[] = [];

  for (const line of lines) {
    if (line.startsWith("-")) {
      parsedLines.push({ variant: "removed", code: line.slice(1) });
    } else if (line.startsWith("+")) {
      parsedLines.push({ variant: "added", code: line.slice(1) });
    } else if (line.startsWith(" ")) {
      parsedLines.push({ variant: "context", code: line.slice(1) });
    }
  }

  return parsedLines;
}

export function RoastResultProcessed({
  submission,
}: RoastResultProcessedProps) {
  const lineCount = submission.code.split("\n").length;
  const rawScore = submission.score ? Number(submission.score) : 0;
  const score = Math.min(10, Math.max(0, Number(rawScore.toFixed(1))));

  const getVerdict = (s: number) => {
    if (s >= 8) {
      return {
        label: "clean_enough_to_ship",
        variant: "good" as const,
      };
    }

    if (s >= 6) {
      return {
        label: "needs_some_refactor",
        variant: "warning" as const,
      };
    }

    return {
      label: "needs_serious_help",
      variant: "critical" as const,
    };
  };

  const verdict = getVerdict(score);
  const diffLines = submission.diffSuggestions
    ? parseDiff(submission.diffSuggestions.unifiedDiff)
    : [];

  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-10 pb-16 pt-10 sm:px-20">
        <section className="flex items-center gap-12">
          <ScoreRing score={score} />

          <div className="flex flex-1 flex-col gap-4">
            <StatusBadgeRoot variant={verdict.variant}>
              <StatusBadgeDot />
              <StatusBadgeLabel>verdict: {verdict.label}</StatusBadgeLabel>
            </StatusBadgeRoot>

            <p className="font-mono text-[20px] leading-[1.5] text-text-primary">
              {submission.roastQuote}
            </p>

            <div className="flex items-center gap-4 font-mono text-[12px] text-text-tertiary">
              <span>lang: {submission.language}</span>
              <span>·</span>
              <span>{lineCount} lines</span>
            </div>

            <div>
              <button
                type="button"
                className="border border-border-primary px-4 py-2 font-mono text-[12px] text-text-primary transition-colors hover:border-text-tertiary"
              >
                $ share_roast
              </button>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-4">
          <SectionTitleRoot>
            <SectionTitleSlash>{"//"}</SectionTitleSlash>
            <SectionTitleLabel>your_submission</SectionTitleLabel>
          </SectionTitleRoot>

          <CodeBlockRoot className="max-h-[424px] overflow-auto">
            <CodeBlock
              code={submission.code}
              language={submission.language as BundledLanguage}
            />
          </CodeBlockRoot>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>{"//"}</SectionTitleSlash>
            <SectionTitleLabel>detailed_analysis</SectionTitleLabel>
          </SectionTitleRoot>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-5">
              {submission.analysisIssues.map((issue) => (
                <Card key={issue.title} className="flex-1 min-w-[300px]">
                  <CardHeader>
                    <StatusBadgeRoot variant={issue.severity}>
                      <StatusBadgeDot />
                      <StatusBadgeLabel>{issue.severity}</StatusBadgeLabel>
                    </StatusBadgeRoot>
                  </CardHeader>
                  <CardTitle className="font-medium">{issue.title}</CardTitle>
                  <CardDescription>{issue.description}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {submission.diffSuggestions && (
          <>
            <div className="h-px w-full bg-border-primary" />

            <section className="flex flex-col gap-6">
              <SectionTitleRoot>
                <SectionTitleSlash>{"//"}</SectionTitleSlash>
                <SectionTitleLabel>suggested_fix</SectionTitleLabel>
              </SectionTitleRoot>

              <div className="w-full overflow-hidden border border-border-primary bg-bg-input">
                <div className="flex h-10 items-center border-b border-border-primary px-4">
                  <span className="font-mono text-[12px] font-medium text-text-secondary">
                    {submission.diffSuggestions.fromFile} →{" "}
                    {submission.diffSuggestions.toFile}
                  </span>
                </div>
                <div className="flex flex-col py-1">
                  {diffLines.map((line, idx) => (
                    <DiffLine
                      // biome-ignore lint/suspicious/noArrayIndexKey: lines in a diff can be identical
                      key={`diff-${idx}-${line.variant}`}
                      variant={line.variant}
                      code={line.code}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
