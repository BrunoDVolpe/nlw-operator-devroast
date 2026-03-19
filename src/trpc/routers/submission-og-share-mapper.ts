import { submissions } from "@/db/schema";

export type OgShareSubmissionRow = Pick<
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
