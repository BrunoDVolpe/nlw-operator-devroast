import { z } from "zod";

import { db } from "@/db/client";
import { codeLanguageEnum, submissions } from "@/db/schema";

import { baseProcedure, createTRPCRouter } from "../init";

const processRoastBackground = async (id: string) => {
  console.log("processing", id);
};

export const submissionRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1),
        language: z.enum(codeLanguageEnum.enumValues),
        roastMode: z.boolean(),
      }),
    )
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
        throw new Error("Failed to create submission");
      }

      const promise = processRoastBackground(submission.id);

      // Trigger background processing (stub)
      promise.catch(console.error);

      return { id: submission.id };
    }),
});
