import assert from "node:assert/strict";
import { test } from "node:test";

import { createRoastOgResponse } from "./render-roast-og-image";

test("createRoastOgResponse returns an image response", () => {
  const response = createRoastOgResponse({
    score: "8.8/10",
    verdict: "sharp, but overconfident",
    quote: "Clean architecture beats clever one-liners.",
  });

  const contentType = response.headers.get("content-type");

  assert.equal(response instanceof Response, true);
  assert.ok(contentType?.startsWith("image/"));
});
