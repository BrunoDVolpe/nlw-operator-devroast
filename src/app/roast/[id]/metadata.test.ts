import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRoastMetadata } from "./page";

const roastId = "00000000-0000-4000-8000-000000000001";

test("buildRoastMetadata includes OG and Twitter image URL for roast", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
    payload: null,
  });

  assert.deepEqual(metadata.openGraph?.images, [`/roast/${roastId}/opengraph-image`]);
  assert.deepEqual(metadata.twitter?.images, [`/roast/${roastId}/opengraph-image`]);
});

test("buildRoastMetadata uses contextual title and description for ready payload", () => {
  const metadata = buildRoastMetadata({
    id: roastId,
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
    payload: null,
  });

  assert.equal(metadata.title, "Roast Results | Devroast");
  assert.equal(metadata.description, "Your code has been roasted.");
});
