import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
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
      const [submission] = await db
        .select({
          id: submissions.id,
          status: submissions.status,
          score: submissions.score,
          roastQuote: submissions.roastQuote,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.id, input.id),
            eq(submissions.status, "processed"),
            isNotNull(submissions.score),
            isNotNull(submissions.roastQuote),
          ),
        )
        .limit(1);

      return submission ? mapSubmissionToOgShare(submission) : null;
    }),
});
