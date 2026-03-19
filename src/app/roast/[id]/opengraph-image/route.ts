import { randomUUID } from "node:crypto";

import { createFallbackOgImageResponse } from "@/lib/og/fallback-og-image";
import { classifyOgError, makeOgEvent, type OgEvent, type OgEventPhase } from "@/lib/og/og-events";
import { createRoastOgResponse } from "@/lib/og/takumi/render-roast-og-image";
import { measureTakumiTextWidth, truncateOgQuote, type MeasureTextWidth } from "@/lib/og/truncate-og-quote";
import { getRoastOgPayload, type RoastOgPayloadResult } from "@/server/roast/get-roast-og-payload";

const OG_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";
const OG_QUOTE_MAX_WIDTH = 52;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OgRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type CreateOgRouteDependencies = {
  isUuid: (value: string) => boolean;
  getRoastOgPayload: (id: string) => Promise<RoastOgPayloadResult>;
  truncateOgQuote: typeof truncateOgQuote;
  measureTextWidth: MeasureTextWidth;
  createRoastOgResponse: typeof createRoastOgResponse;
  createFallbackOgImageResponse: typeof createFallbackOgImageResponse;
  makeOgEvent: typeof makeOgEvent;
  classifyOgError: typeof classifyOgError;
  logEvent: (event: OgEvent) => void;
  now: () => number;
  createRequestId: () => string;
};

type CreateOgRouteInput = Partial<CreateOgRouteDependencies>;

function defaultIsUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function toErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const source = error as { code?: unknown };

  return typeof source.code === "string" ? source.code : undefined;
}

function withCacheControl(response: Response, status = response.status): Response {
  const headers = new Headers(response.headers);
  headers.set("cache-control", OG_CACHE_CONTROL);

  return new Response(response.body, {
    status,
    statusText: response.statusText,
    headers,
  });
}

export function createOgRoute(input: CreateOgRouteInput = {}) {
  const dependencies: CreateOgRouteDependencies = {
    isUuid: input.isUuid ?? defaultIsUuid,
    getRoastOgPayload: input.getRoastOgPayload ?? getRoastOgPayload,
    truncateOgQuote: input.truncateOgQuote ?? truncateOgQuote,
    measureTextWidth: input.measureTextWidth ?? measureTakumiTextWidth,
    createRoastOgResponse: input.createRoastOgResponse ?? createRoastOgResponse,
    createFallbackOgImageResponse:
      input.createFallbackOgImageResponse ?? createFallbackOgImageResponse,
    makeOgEvent: input.makeOgEvent ?? makeOgEvent,
    classifyOgError: input.classifyOgError ?? classifyOgError,
    logEvent: input.logEvent ?? ((event) => console.info("[og]", event)),
    now: input.now ?? Date.now,
    createRequestId: input.createRequestId ?? randomUUID,
  };

  return async function GET(_request: Request, context: OgRouteContext): Promise<Response> {
    const { id } = await Promise.resolve(context.params);
    const requestId = dependencies.createRequestId();
    const startedAt = dependencies.now();

    const durationMs = () => Math.max(0, Math.round(dependencies.now() - startedAt));

    const emitEvent = (
      name: "og.render.success" | "og.render.fallback" | "og.render.error",
      phase: OgEventPhase,
      extras?: {
        errorType?: ReturnType<typeof classifyOgError>;
        errorCode?: string;
      },
    ) => {
      dependencies.logEvent(
        dependencies.makeOgEvent({
          name,
          roastId: id,
          requestId,
          phase,
          durationMs: durationMs(),
          ...extras,
        }),
      );
    };

    const fallbackResponse = (phase: OgEventPhase) => {
      emitEvent("og.render.fallback", phase);
      return withCacheControl(dependencies.createFallbackOgImageResponse(), 200);
    };

    const handleError = (error: unknown, phase: OgEventPhase) => {
      emitEvent("og.render.error", phase, {
        errorType: dependencies.classifyOgError(error),
        errorCode: toErrorCode(error),
      });

      return fallbackResponse("fallback");
    };

    if (!dependencies.isUuid(id)) {
      return fallbackResponse("fallback");
    }

    let payload: RoastOgPayloadResult;

    try {
      payload = await dependencies.getRoastOgPayload(id);
    } catch (error) {
      return handleError(error, "fetch");
    }

    if (payload === null) {
      return fallbackResponse("fallback");
    }

    if (payload.status !== "ready") {
      return fallbackResponse("fallback");
    }

    let quote: string;

    try {
      quote = dependencies.truncateOgQuote(payload.data.roastQuote, {
        maxWidth: OG_QUOTE_MAX_WIDTH,
        maxLines: 2,
        measureTextWidth: dependencies.measureTextWidth,
      });
    } catch (error) {
      return handleError(error, "normalize");
    }

    try {
      const response = dependencies.createRoastOgResponse({
        score: payload.data.score,
        verdict: null,
        quote,
      });

      emitEvent("og.render.success", "render");

      return withCacheControl(response);
    } catch (error) {
      return handleError(error, "render");
    }
  };
}

export const GET = createOgRoute();
