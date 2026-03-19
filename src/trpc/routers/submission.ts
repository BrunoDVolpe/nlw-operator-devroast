import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { codeLanguageEnum, submissions } from "@/db/schema";

import { baseProcedure, createTRPCRouter } from "../init";

const processRoastBackground = async (id: string) => {
  console.log("processing", id);
};

export const createSubmissionSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.enum(codeLanguageEnum.enumValues),
  roastMode: z.boolean(),
});

export const submissionRouter = createTRPCRouter({
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

      // Trigger background processing (stub)
      after(() => processRoastBackground(submission.id).catch(console.error));

      return { id: submission.id };
    }),
});
