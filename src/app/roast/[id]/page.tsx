import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getRoastOgPayload,
  type RoastOgPayloadResult,
} from "@/server/roast/get-roast-og-payload";

import { RoastResultFailed } from "./roast-result-failed";
import { RoastResultPending } from "./roast-result-pending";
import {
  RoastResultProcessed,
  type RoastResultProcessedProps,
} from "./roast-result-processed";

const DEFAULT_ROAST_TITLE = "Roast Results | Devroast";
const DEFAULT_ROAST_DESCRIPTION = "Your code has been roasted.";

type RoastPageParams = {
  id: string;
};

type RoastMetadataInput = {
  id: string;
  origin: string;
  payload: RoastOgPayloadResult;
};

export function resolveMetadataOrigin(requestHeaders: Pick<Headers, "get">): string {
  const host = requestHeaders.get("host")?.trim() || "localhost:3000";
  const forwardedProto = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  const protocol =
    forwardedProto ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

export function buildRoastMetadata(input: RoastMetadataInput): Metadata {
  const imageUrl = `${input.origin}/roast/${input.id}/opengraph-image`;

  if (input.payload?.status === "ready") {
    const { score, roastQuote } = input.payload.data;
    const title = `Roast ${score}/10 | Devroast`;
    const description = `Score ${score}/10. "${roastQuote}"`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [imageUrl],
      },
      twitter: {
        title,
        description,
        images: [imageUrl],
      },
    };
  }

  return {
    title: DEFAULT_ROAST_TITLE,
    description: DEFAULT_ROAST_DESCRIPTION,
    openGraph: {
      title: DEFAULT_ROAST_TITLE,
      description: DEFAULT_ROAST_DESCRIPTION,
      images: [imageUrl],
    },
    twitter: {
      title: DEFAULT_ROAST_TITLE,
      description: DEFAULT_ROAST_DESCRIPTION,
      images: [imageUrl],
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: RoastPageParams | Promise<RoastPageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const requestHeaders = await headers();
  const origin = resolveMetadataOrigin(requestHeaders);

  let payload: RoastOgPayloadResult = null;

  try {
    payload = await getRoastOgPayload(id);
  } catch (error) {
    console.error("[roast.metadata] failed to load roast OG payload", {
      id,
      error,
    });
    payload = null;
  }

  return buildRoastMetadata({ id, origin, payload });
}

export default async function RoastResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { caller } = await import("@/trpc/server");

  try {
    const submission = await caller.submission.getById({ id });

    if (submission.status === "pending") {
      return <RoastResultPending id={id} />;
    }

    if (submission.status === "failed") {
      return <RoastResultFailed />;
    }

    const processedSubmission =
      submission as unknown as RoastResultProcessedProps["submission"];

    return <RoastResultProcessed submission={processedSubmission} />;
  } catch (error) {
    console.error("Failed to fetch submission", error);
    notFound();
  }
}
