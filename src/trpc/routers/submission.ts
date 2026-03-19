import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { mapSubmissionToOgShare } from "./submission-og-share-mapper";

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
