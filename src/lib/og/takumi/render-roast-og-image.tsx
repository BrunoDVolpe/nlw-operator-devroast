import { ImageResponse } from "@takumi-rs/image-response";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "../og-image-dimensions";

export type CreateRoastOgResponseInput = {
  score: string | number | null;
  verdict: string | null;
  quote: string | null;
};

export type NormalizedRoastOgInput = {
  score: string;
  verdict: string;
  quote: string;
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  height: "100%",
  padding: "64px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#0A0A0A",
  color: "#FAFAFA",
  gap: "28px",
};

function getVerdictColor(verdict: string) {
  if (verdict === "clean_enough_to_ship") return "#10B981"; // accent-green
  if (verdict === "needs_some_refactor") return "#F59E0B"; // accent-amber
  return "#EF4444"; // accent-red (default for needs_serious_help or others)
}

function normalizeScore(score: CreateRoastOgResponseInput["score"]): string {
  if (score === null) {
    return "--";
  }

  if (typeof score === "number") {
    return Number.isFinite(score) ? String(score) : "--";
  }

  const normalized = score.trim();

  if (normalized.length === 0) {
    return "--";
  }

  const scoreWithoutSuffix = normalized.replace(/\s*\/\s*10\s*$/i, "").trim();

  if (scoreWithoutSuffix.length === 0) {
    return "--";
  }

  return scoreWithoutSuffix;
}

export function normalizeRoastOgInput(
  input: CreateRoastOgResponseInput,
): NormalizedRoastOgInput {
  return {
    score: normalizeScore(input.score),
    verdict: input.verdict?.trim() || "pending_review",
    quote: input.quote?.trim() || "Waiting for the next roast.",
  };
}

export function createRoastOgResponse(input: CreateRoastOgResponseInput) {
  const normalizedInput = normalizeRoastOgInput(input);
  const color = getVerdictColor(normalizedInput.verdict);

  return new ImageResponse(
    (
      <div style={{ ...containerStyle, fontFamily: "JetBrains Mono" }}>
        {/* logoRow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: "#10B981", fontSize: 24, fontWeight: 700 }}>{">"}</span>
          <span style={{ color: "#FAFAFA", fontSize: 20, fontWeight: 500 }}>devroast</span>
        </div>

        {/* scoreRow */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
          <span style={{ color: color, fontSize: 160, fontWeight: 900, lineHeight: 1 }}>
            {normalizedInput.score}
          </span>
          <span style={{ color: "#4B5563", fontSize: 56, fontWeight: "normal", lineHeight: 1 }}>
            /10
          </span>
        </div>

        {/* verdictRow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <span style={{ color: color, fontSize: 20, fontWeight: "normal" }}>
            {normalizedInput.verdict}
          </span>
        </div>

        {/* roastQuote */}
        <div
          style={{
            fontFamily: "IBM Plex Mono", // Original uses $font-secondary
            color: "#FAFAFA",
            fontSize: 32, // Increase slightly for 1200x630 readability
            fontWeight: "normal",
            lineHeight: 1.5,
            textAlign: "center",
            width: "100%",
            marginTop: 16,
          }}
        >
          "{normalizedInput.quote}"
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    },
  );
}
