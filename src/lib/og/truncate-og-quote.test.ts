import assert from "node:assert/strict";
import { test } from "node:test";

import { truncateOgQuote } from "./truncate-og-quote";

const measureByLength = (text: string) => text.length;

test("truncateOgQuote adds ellipsis when wrapped text overflows two lines", () => {
  const output = truncateOgQuote(
    "alpha beta gamma delta epsilon zeta eta theta",
    {
      maxWidth: 16,
      maxLines: 2,
      measureTextWidth: measureByLength,
    },
  );

  assert.equal(output, "alpha beta gamma\ndelta epsilon...");
});

test("truncateOgQuote keeps fitting text without ellipsis", () => {
  const output = truncateOgQuote("alpha beta gamma", {
    maxWidth: 30,
    maxLines: 2,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "alpha beta gamma");
});

test("truncateOgQuote normalizes explicit newlines before wrapping", () => {
  const output = truncateOgQuote("alpha\n\nbeta   gamma", {
    maxWidth: 30,
    maxLines: 2,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "alpha beta gamma");
});

test("truncateOgQuote keeps ellipsis marker within very small maxWidth", () => {
  const output = truncateOgQuote("alpha beta gamma", {
    maxWidth: 2,
    maxLines: 1,
    measureTextWidth: measureByLength,
  });

  assert.equal(output, "..");
  assert.ok(
    output
      .split("\n")
      .every((line) => measureByLength(line) <= 2),
  );
});

test("truncateOgQuote never returns chunk wider than maxWidth for single wide glyph", () => {
  const measureWithWideGlyph = (text: string) =>
    text.includes("🔥") ? 5 : text.length;

  const output = truncateOgQuote("🔥", {
    maxWidth: 2,
    maxLines: 2,
    measureTextWidth: measureWithWideGlyph,
  });

  assert.equal(output, "..");
  assert.ok(
    output
      .split("\n")
      .every((line) => measureWithWideGlyph(line) <= 2),
  );
});
