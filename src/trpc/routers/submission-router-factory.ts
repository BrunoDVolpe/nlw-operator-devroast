import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import {
  mapSubmissionToOgShare,
  type OgShareSubmissionRow,
} from "./submission-og-share-mapper";

type SubmissionDb = {
  select: Pick<typeof import("@/db/client").db, "select">["select"];
};

function isEligibleOgShareRow(
  row: OgShareSubmissionRow | undefined,
): row is OgShareSubmissionRow {
  return (
    row !== undefined &&
    row.status === "processed" &&
    row.score !== null &&
    row.roastQuote !== null
  );
}

export function createSubmissionRouter(db: SubmissionDb) {
  return createTRPCRouter({
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

        return isEligibleOgShareRow(submission)
          ? mapSubmissionToOgShare(submission)
          : null;
      }),
  });
}
