import type { Metadata } from "next";
import { caller } from "@/trpc/server";
import { notFound } from "next/navigation";
import { RoastResultPending } from "./roast-result-pending";
import { RoastResultFailed } from "./roast-result-failed";
import { RoastResultProcessed } from "./roast-result-processed";

export const metadata: Metadata = {
  title: "Roast Results | Devroast",
  description: "Your code has been roasted.",
};

export default async function RoastResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const submission = await caller.submission.getById({ id });

    if (submission.status === "pending") {
      return <RoastResultPending id={id} />;
    }

    if (submission.status === "failed") {
      return <RoastResultFailed />;
    }

    // Processed state
    return (
      <RoastResultProcessed
        submission={{
          ...submission,
          analysisIssues: submission.analysisIssues.map(issue => ({
             ...issue,
             severity: issue.severity as "critical" | "warning" | "good"
          })),
          diffSuggestions: submission.diffSuggestions ? {
            fromFile: submission.diffSuggestions.fromFile,
            toFile: submission.diffSuggestions.toFile,
            unifiedDiff: submission.diffSuggestions.unifiedDiff
          } : null
        }}
      />
    );
  } catch (error) {
    console.error("Failed to fetch submission", error);
    notFound();
  }
}
