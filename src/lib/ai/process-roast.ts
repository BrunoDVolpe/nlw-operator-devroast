import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { analysisIssues, diffSuggestions, submissions } from "@/db/schema";

const roastSchema = z.object({
  score: z.number().min(0).max(100).describe("The score of the code, from 0 to 100"),
  roastSummary: z.string().describe("A short summary roasting or reviewing the code"),
  roastQuote: z.string().describe("A punchy quote roasting or reviewing the code"),
  issues: z.array(
    z.object({
      title: z.string().describe("A short title for the issue"),
      description: z.string().describe("A detailed description of the issue"),
      severity: z.enum(["critical", "warning", "good"]).describe("The severity of the issue"),
    })
  ).describe("A list of issues found in the code"),
  diffSuggestions: z
    .object({
      fromFile: z.string().describe("The name of the file being reviewed (e.g. your_code.ts)"),
      toFile: z.string().describe("The name of the file with improvements (e.g. improved_code.ts)"),
      unifiedDiff: z.string().describe("A unified diff showing the suggested changes. If no changes, provide an empty string."),
    })
    .nullable()
    .optional()
    .describe("A unified diff suggestion to improve the code. Optional if the code is perfect."),
});

export const processRoastBackground = async (id: string) => {
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));

  if (!submission) {
    console.error(`Submission ${id} not found`);
    return;
  }

  try {
    const prompt = `Review the following ${submission.language} code.
${submission.roastMode ? "Be extremely harsh, sarcastic, and roast the developer's skills." : "Be constructive, polite, and helpful."}

Code:
\`\`\`${submission.language}
${submission.code}
\`\`\`

Analyze the code for bugs, bad practices, performance issues, and readability.
Provide a score from 0 to 100, where 100 is perfect code and 0 is absolute garbage.
List any specific issues found, assigning a severity (critical, warning, or good).
If there are improvements to be made, provide a unified diff showing how to fix the code.`;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: roastSchema,
      prompt,
    });

    await db.transaction(async (tx) => {
      // Update submission
      await tx
        .update(submissions)
        .set({
          score: object.score.toString(),
          roastSummary: object.roastSummary,
          roastQuote: object.roastQuote,
          status: "processed",
        })
        .where(eq(submissions.id, id));

      // Insert issues
      if (object.issues.length > 0) {
        await tx.insert(analysisIssues).values(
          object.issues.map((issue, index) => ({
            submissionId: id,
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            orderIndex: index,
          }))
        );
      }

      // Insert diff suggestions
      if (object.diffSuggestions?.unifiedDiff) {
        await tx.insert(diffSuggestions).values({
          submissionId: id,
          fromFile: object.diffSuggestions.fromFile,
          toFile: object.diffSuggestions.toFile,
          unifiedDiff: object.diffSuggestions.unifiedDiff,
        });
      }
    });
  } catch (error) {
    console.error(`Failed to process roast for submission ${id}:`, error);

    try {
      await db
        .update(submissions)
        .set({ status: "failed" })
        .where(eq(submissions.id, id));
    } catch (dbError) {
      console.error(`Failed to update status to failed for submission ${id}:`, dbError);
    }
  }
};
