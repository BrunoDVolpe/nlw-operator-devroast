import { ImageResponse } from "@takumi-rs/image-response";

export type CreateRoastOgResponseInput = {
  score: string | number | null;
  verdict: string | null;
  quote: string | null;
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const containerStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  height: "100%",
  padding: "56px",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "linear-gradient(130deg, #06080f 0%, #0e1321 55%, #19111f 100%)",
  color: "#f8fafc",
  fontFamily: "Geist Mono, monospace",
};

export function createRoastOgResponse(input: CreateRoastOgResponseInput) {
  const score = input.score === null ? "--" : String(input.score);
  const verdict = input.verdict?.trim() || "pending_review";
  const quote = input.quote?.trim() || "Waiting for the next roast.";

  return new ImageResponse(
    (
      <div style={containerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Devroast
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              backgroundColor: "#1e293b",
              color: "#cbd5e1",
              fontSize: 24,
            }}
          >
            {verdict}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ fontSize: 110, fontWeight: 700, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 36, color: "#a5b4fc" }}>/10</span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.3,
              color: "#e2e8f0",
            }}
          >
            "{quote}"
          </p>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    },
  );
}
