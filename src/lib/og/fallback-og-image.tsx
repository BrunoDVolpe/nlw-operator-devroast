import { ImageResponse } from "@takumi-rs/image-response";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "./og-image-dimensions";

export function createFallbackOgImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: "radial-gradient(circle at 75% 0%, #1f2937 0%, #05070d 60%)",
          color: "#e2e8f0",
          fontFamily: "Geist Mono, monospace",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase" }}>
          Devroast
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 74, lineHeight: 1 }}>Roast incoming.</h1>
          <p style={{ margin: 0, fontSize: 32, color: "#94a3b8" }}>
            Shared this before the roast was ready.
          </p>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    },
  );
}
