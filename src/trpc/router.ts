import { and, asc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { submissions } from "@/db/schema";

import { baseProcedure, createTRPCRouter } from "./init";
import { submissionRouter } from "./routers/submission";

const metricsRouter = createTRPCRouter({
  homepage: baseProcedure.query(async () => {
    const [aggregate] = await db
      .select({
        roastedCodesCount: sql<number>`count(*)`,
        avgScore: sql<string>`coalesce(round(avg(${submissions.score}), 1)::text, '0.0')`,
      })
      .from(submissions)
      .where(
        and(eq(submissions.status, "processed"), isNotNull(submissions.score)),
      );

    return {
      roastedCodesCount: Number(aggregate?.roastedCodesCount ?? 0),
      avgScore: Number(aggregate?.avgScore ?? "0"),
    };
  }),
});

async function getLeaderboardData(limit: number) {
  const [rows, [aggregate]] = await Promise.all([
    db
      .select({
        score: submissions.score,
        language: submissions.language,
        code: submissions.code,
      })
      .from(submissions)
      .where(
        and(eq(submissions.status, "processed"), isNotNull(submissions.score)),
      )
      .orderBy(asc(submissions.score), asc(submissions.createdAt))
      .limit(limit),
    db
      .select({
        totalRoasts: sql<number>`count(*)`,
        avgScore: sql<string>`coalesce(round(avg(${submissions.score}), 1)::text, '0.0')`,
      })
      .from(submissions)
      .where(
        and(eq(submissions.status, "processed"), isNotNull(submissions.score)),
      ),
  ]);

  const entries = rows.map((row, index) => ({
    rank: index + 1,
    score: Number(row.score),
    language: row.language,
    code: row.code,
  }));

  return {
    entries,
    metrics: {
      totalRoasts: Number(aggregate?.totalRoasts ?? 0),
      avgScore: Number(aggregate?.avgScore ?? "0"),
    },
  };
}

const leaderboardRouter = createTRPCRouter({
  homepage: baseProcedure.query(async () => getLeaderboardData(3)),
  page: baseProcedure.query(async () => getLeaderboardData(20)),
});

export const appRouter = createTRPCRouter({
  metrics: metricsRouter,
  leaderboard: leaderboardRouter,
  submission: submissionRouter,
});

export type AppRouter = typeof appRouter;
