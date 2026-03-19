export const OG_EVENT_NAMES = [
  "og.render.success",
  "og.render.fallback",
  "og.render.error",
] as const;

export type OgEventName = (typeof OG_EVENT_NAMES)[number];

export const OG_EVENT_TYPES = ["success", "fallback", "error"] as const;

export type OgEventType = (typeof OG_EVENT_TYPES)[number];

export const OG_EVENT_PHASES = ["fetch", "normalize", "render", "fallback"] as const;

export type OgEventPhase = (typeof OG_EVENT_PHASES)[number];

export type OgErrorCategory = "timeout" | "network" | "render" | "fetch" | "unknown";

export type OgEventInput = {
  name: OgEventName;
  roastId: string;
  requestId: string;
  phase: OgEventPhase;
  durationMs: number;
  errorType?: OgErrorCategory;
  errorCode?: string;
};

export type OgEvent = OgEventInput & {
  type: OgEventType;
};

const EVENT_TYPE_BY_NAME: Record<OgEventName, OgEventType> = {
  "og.render.success": "success",
  "og.render.fallback": "fallback",
  "og.render.error": "error",
};

const TIMEOUT_CODES = new Set(["ETIMEDOUT", "ECONNABORTED", "UND_ERR_CONNECT_TIMEOUT"]);

const NETWORK_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EAI_AGAIN",
]);

const TIMEOUT_TEXT_PATTERN = /\b(timeout|timed out|deadline exceeded|aborted|aborterror)\b/i;
const NETWORK_TEXT_PATTERN = /\b(network|socket|dns|connection reset|refused|unreachable)\b/i;
const RENDER_TEXT_PATTERN =
  /\b(render|renderer|image response|serialize|serialization|jsx|layout)\b/i;
const FETCH_TEXT_PATTERN = /\b(fetch|http status|response body|request failed)\b/i;

export function makeOgEvent(input: OgEventInput): OgEvent {
  return {
    ...input,
    type: EVENT_TYPE_BY_NAME[input.name],
  };
}

export function classifyOgError(error: unknown): OgErrorCategory {
  if (!error || typeof error !== "object") {
    return "unknown";
  }

  const normalized = normalizeError(error);

  if (TIMEOUT_CODES.has(normalized.code) || TIMEOUT_TEXT_PATTERN.test(normalized.text)) {
    return "timeout";
  }

  if (NETWORK_CODES.has(normalized.code) || NETWORK_TEXT_PATTERN.test(normalized.text)) {
    return "network";
  }

  if (RENDER_TEXT_PATTERN.test(normalized.text)) {
    return "render";
  }

  if (normalized.name.toLowerCase() === "fetcherror" || FETCH_TEXT_PATTERN.test(normalized.text)) {
    return "fetch";
  }

  return "unknown";
}

function normalizeError(error: object): { code: string; name: string; text: string } {
  const source = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
    cause?: unknown;
  };

  const code = typeof source.code === "string" ? source.code : "";
  const name = typeof source.name === "string" ? source.name : "";
  const message = typeof source.message === "string" ? source.message : "";

  let causeText = "";

  if (source.cause && typeof source.cause === "object") {
    const cause = source.cause as { message?: unknown; code?: unknown; name?: unknown };
    const causeName = typeof cause.name === "string" ? cause.name : "";
    const causeMessage = typeof cause.message === "string" ? cause.message : "";
    const causeCode = typeof cause.code === "string" ? cause.code : "";

    causeText = [causeName, causeMessage, causeCode].filter(Boolean).join(" ");
  }

  const text = [name, message, code, causeText].filter(Boolean).join(" ");

  return {
    code,
    name,
    text,
  };
}
