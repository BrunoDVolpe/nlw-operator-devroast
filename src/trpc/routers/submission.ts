import { and, eq, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { codeLanguageEnum, submissions } from "@/db/schema";
import { processRoastBackground } from "@/lib/ai/process-roast";
import { mapSubmissionToOgShare } from "./submission-og-share-mapper";

import { baseProcedure, createTRPCRouter } from "../init";

export const createSubmissionSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.enum(codeLanguageEnum.enumValues),
  roastMode: z.boolean(),
});

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

  create: baseProcedure
    .input(createSubmissionSchema)
    .mutation(async ({ input }) => {
      const [submission] = await db
        .insert(submissions)
        .values({
          code: input.code,
          language: input.language,
          roastMode: input.roastMode,
          status: "pending",
        })
        .returning({ id: submissions.id });

      if (!submission) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create submission",
        });
      }

      // Trigger background processing
      after(() => processRoastBackground(submission.id).catch(console.error));

      return { id: submission.id };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const submission = await db.query.submissions.findFirst({
        where: (submissions, { eq }) => eq(submissions.id, input.id),
        with: {
          analysisIssues: {
            orderBy: (issues, { asc }) => [asc(issues.orderIndex)],
          },
          diffSuggestions: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      return submission;
    }),
});
