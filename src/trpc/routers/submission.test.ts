import assert from "node:assert/strict";
import { test } from "node:test";

import { mapSubmissionToOgShare } from "./submission-og-share-mapper";

test("maps processed row to og share payload", () => {
  const output = mapSubmissionToOgShare({
    id: "abc",
    status: "processed",
    score: "4.5",
    roastQuote: "quote",
  });

  assert.equal(output.id, "abc");
  assert.equal(output.status, "processed");
  assert.equal(output.score, "4.5");
  assert.equal(output.roastQuote, "quote");
});

test("maps non-processed row without transforming fields", () => {
  const output = mapSubmissionToOgShare({
    id: "def",
    status: "failed",
    score: null,
    roastQuote: null,
  });

  assert.deepEqual(output, {
    id: "def",
    status: "failed",
    score: null,
    roastQuote: null,
  });
});
