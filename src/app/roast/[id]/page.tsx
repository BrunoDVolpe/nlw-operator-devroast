import type { Metadata } from "next";
import { cacheLife } from "next/cache";

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

export const metadata: Metadata = {
  title: "Roast Results | Devroast",
  description: "Your code has been roasted.",
};

const staticData = {
  score: 3.5,
  verdict: "needs_serious_help",
  roastQuote:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  lineCount: 16,
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      severity: "critical" as const,
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      severity: "warning" as const,
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      severity: "good" as const,
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      severity: "good" as const,
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diffHeader: "your_code.ts → improved_code.ts",
  diffLines: [
    { variant: "context" as const, code: "function calculateTotal(items) {" },
    { variant: "removed" as const, code: "  var total = 0;" },
    {
      variant: "removed" as const,
      code: "  for (var i = 0; i < items.length; i++) {",
    },
    {
      variant: "removed" as const,
      code: "    total = total + items[i].price;",
    },
    { variant: "removed" as const, code: "  }" },
    { variant: "removed" as const, code: "  return total;" },
    {
      variant: "added" as const,
      code: "  return items.reduce((sum, item) => sum + item.price, 0);",
    },
    { variant: "context" as const, code: "}" },
  ],
};

export default async function RoastResultPage() {
  "use cache";

  cacheLife("hours");

  const data = staticData;

  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-10 pb-16 pt-10 sm:px-20">
        <section className="flex items-center gap-12">
          <ScoreRing score={data.score} />

          <div className="flex flex-1 flex-col gap-4">
            <StatusBadgeRoot variant="verdict">
              <StatusBadgeDot />
              <StatusBadgeLabel>verdict: {data.verdict}</StatusBadgeLabel>
            </StatusBadgeRoot>

            <p className="font-mono text-[20px] leading-[1.5] text-text-primary">
              {data.roastQuote}
            </p>

            <div className="flex items-center gap-4 font-mono text-[12px] text-text-tertiary">
              <span>lang: {data.language}</span>
              <span>·</span>
              <span>{data.lineCount} lines</span>
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
            <CodeBlock code={data.code} language="javascript" />
          </CodeBlockRoot>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>{"//"}</SectionTitleSlash>
            <SectionTitleLabel>detailed_analysis</SectionTitleLabel>
          </SectionTitleRoot>

          <div className="flex flex-col gap-5">
            <div className="flex gap-5">
              {data.issues.slice(0, 2).map((issue) => (
                <Card key={issue.title} className="flex-1">
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
            <div className="flex gap-5">
              {data.issues.slice(2, 4).map((issue) => (
                <Card key={issue.title} className="flex-1">
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

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>{"//"}</SectionTitleSlash>
            <SectionTitleLabel>suggested_fix</SectionTitleLabel>
          </SectionTitleRoot>

          <div className="w-full overflow-hidden border border-border-primary bg-bg-input">
            <div className="flex h-10 items-center border-b border-border-primary px-4">
              <span className="font-mono text-[12px] font-medium text-text-secondary">
                {data.diffHeader}
              </span>
            </div>
            <div className="flex flex-col py-1">
              {data.diffLines.map((line) => (
                <DiffLine
                  key={`diff-${line.variant}-${line.code}`}
                  variant={line.variant}
                  code={line.code}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
