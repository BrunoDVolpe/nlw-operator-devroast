import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRoastMetadata, resolveMetadataOrigin } from "./page";

const roastId = "00000000-0000-4000-8000-000000000001";
const origin = "https://devroast.test";

test("buildRoastMetadata includes OG and Twitter image URL for roast", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
    origin,
    payload: null,
  });

  assert.deepEqual(metadata.openGraph?.images, [
    `https://devroast.test/roast/${roastId}/opengraph-image`,
  ]);
  assert.deepEqual(metadata.twitter?.images, [
    `https://devroast.test/roast/${roastId}/opengraph-image`,
  ]);
});

test("buildRoastMetadata uses contextual title and description for ready payload", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
    origin,
    payload: {
      status: "ready",
      data: {
        id: roastId,
        status: "processed",
        score: "8.7",
        roastQuote: "Readable, but too many nested branches.",
      },
    },
  });

  assert.equal(metadata.title, "Roast 8.7/10 | Devroast");
  assert.equal(
    metadata.description,
    'Score 8.7/10. "Readable, but too many nested branches."',
  );
});

test("buildRoastMetadata keeps default copy when payload is unavailable", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
    origin,
    payload: null,
  });

  assert.equal(metadata.title, "Roast Results | Devroast");
  assert.equal(metadata.description, "Your code has been roasted.");
});

test("buildRoastMetadata keeps default copy when payload is incomplete", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
    origin,
    payload: {
      status: "incomplete",
      data: {
        id: roastId,
        status: "pending",
        score: null,
        roastQuote: null,
      },
    },
  });

  assert.equal(metadata.title, "Roast Results | Devroast");
  assert.equal(metadata.description, "Your code has been roasted.");
});

test("resolveMetadataOrigin prefers forwarded protocol with host", () => {
  const requestHeaders = new Headers({
    host: "example.com",
    "x-forwarded-proto": "https",
  });

  assert.equal(resolveMetadataOrigin(requestHeaders), "https://example.com");
});
