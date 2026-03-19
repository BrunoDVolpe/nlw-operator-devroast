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
