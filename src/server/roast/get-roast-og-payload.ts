import type { caller as trpcCaller } from "@/trpc/server";

type OgShareByIdCaller = (typeof trpcCaller)["submission"]["ogShareById"];

export type RoastOgPayload = NonNullable<
  Awaited<ReturnType<OgShareByIdCaller>>
>;

export type RoastOgPayloadReady = {
  status: "ready";
  data: {
    id: string;
    status: "processed";
    score: string;
    verdict: string;
    roastQuote: string;
  };
};

export type RoastOgPayloadIncomplete = {
  status: "incomplete";
  data: RoastOgPayload;
};

export type RoastOgPayloadEvaluation =
  | RoastOgPayloadReady
  | RoastOgPayloadIncomplete;

export type RoastOgPayloadResult = RoastOgPayloadEvaluation | null;

export function deriveRoastVerdict(score: string): string {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return "needs_work";
  }

  if (numericScore <= 3) {
    return "brutal";
  }

  if (numericScore <= 6) {
    return "needs_work";
  }

  if (numericScore <= 8) {
    return "decent";
  }

  return "clean";
}

export function evaluateRoastOgPayload(
  payload: RoastOgPayload,
): RoastOgPayloadEvaluation {
  if (
    payload.status === "processed" &&
    payload.score !== null &&
    payload.roastQuote !== null
  ) {
    return {
      status: "ready",
      data: {
        id: payload.id,
        status: "processed",
        score: payload.score,
        verdict: deriveRoastVerdict(payload.score),
        roastQuote: payload.roastQuote,
      },
    };
  }

  return {
    status: "incomplete",
    data: payload,
  };
}

export async function getRoastOgPayload(
  id: string,
  ogShareById?: OgShareByIdCaller,
): Promise<RoastOgPayloadResult> {
  const query =
    ogShareById ??
    (await import("@/trpc/server")).caller.submission.ogShareById;

  const payload = await query({ id });

  if (payload === null) {
    return null;
  }

  return evaluateRoastOgPayload(payload);
}
