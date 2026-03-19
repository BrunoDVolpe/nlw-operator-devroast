import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createRoastOgResponse,
  normalizeRoastOgInput,
} from "./render-roast-og-image";

test("createRoastOgResponse returns an image response", () => {
  const response = createRoastOgResponse({
    score: "8.8",
    verdict: "sharp, but overconfident",
    quote: "Clean architecture beats clever one-liners.",
  });

  const contentType = response.headers.get("content-type");

  assert.equal(response instanceof Response, true);
  assert.ok(contentType?.startsWith("image/"));
});

test("normalizeRoastOgInput applies defaults for null or blank fields", () => {
  const output = normalizeRoastOgInput({
    score: null,
    verdict: "   ",
    quote: "\n\n",
  });

  assert.deepEqual(output, {
    score: "--",
    verdict: "pending_review",
    quote: "Waiting for the next roast.",
  });
});

test("normalizeRoastOgInput sanitizes score strings with /10 suffix", () => {
  const output = normalizeRoastOgInput({
    score: "8.8 / 10",
    verdict: "direct",
    quote: "Readable and stable.",
  });

  assert.equal(output.score, "8.8");
});
