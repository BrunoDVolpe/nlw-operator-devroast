import { db } from "@/db/client";
import { createSubmissionRouter } from "./submission-router-factory";

export const submissionRouter = createSubmissionRouter(db);
