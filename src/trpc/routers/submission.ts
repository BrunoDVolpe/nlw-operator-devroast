import { eq } from "drizzle-orm";
import { z } from "zod";

import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

type OgShareSubmissionRow = Pick<
  typeof submissions.$inferSelect,
  "id" | "status" | "score" | "roastQuote"
>;

export function mapSubmissionToOgShare(row: OgShareSubmissionRow) {
  return {
    id: row.id,
    status: row.status,
    score: row.score,
    roastQuote: row.roastQuote,
  };
}

export const submissionRouter = createTRPCRouter({
  ogShareById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { db } = await import("@/db/client");

      const [submission] = await db
        .select({
          id: submissions.id,
          status: submissions.status,
          score: submissions.score,
          roastQuote: submissions.roastQuote,
        })
        .from(submissions)
        .where(eq(submissions.id, input.id))
        .limit(1);

      return submission ? mapSubmissionToOgShare(submission) : null;
    }),
});
