import assert from "node:assert/strict";
import { test } from "node:test";

import { truncateOgQuote } from "./truncate-og-quote";

const measureByLength = async (text: string) => text.length;

test("truncateOgQuote adds ellipsis when wrapped text overflows two lines", async () => {
  const output = await truncateOgQuote(
    "alpha beta gamma delta epsilon zeta eta theta",
    {
      maxWidth: 16,
      maxLines: 2,
      measureTextWidth: measureByLength,
    },
  );

  assert.equal(output, "alpha beta gamma\ndelta epsilon...");
});

test("truncateOgQuote keeps fitting text without ellipsis", async () => {
  const output = await truncateOgQuote("alpha beta gamma", {
    maxWidth: 30,
    maxLines: 2,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "alpha beta gamma");
});

test("truncateOgQuote normalizes explicit newlines before wrapping", async () => {
  const output = await truncateOgQuote("alpha\n\nbeta   gamma", {
    maxWidth: 30,
    maxLines: 2,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "alpha beta gamma");
});

test("truncateOgQuote keeps ellipsis marker within very small maxWidth", async () => {
  const output = await truncateOgQuote("alpha beta gamma", {
    maxWidth: 2,
    maxLines: 1,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "..");
  for (const line of output.split("\n")) {
    assert.ok((await measureByLength(line)) <= 2);
  }
});

test("truncateOgQuote never returns chunk wider than maxWidth for single wide glyph", async () => {
  const measureWithWideGlyph = async (text: string) =>
    text.includes("🔥") ? 5 : text.length;

  const output = await truncateOgQuote("🔥", {
    maxWidth: 2,
    maxLines: 2,
    measureTextWidth: measureWithWideGlyph,
  });

  assert.equal(output, "..");
  const lines = output.split("\n");

  for (const line of lines) {
    assert.ok((await measureWithWideGlyph(line)) <= 2);
  }
});
