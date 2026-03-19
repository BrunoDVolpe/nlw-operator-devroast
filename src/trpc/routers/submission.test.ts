import assert from "node:assert/strict";
import { test } from "node:test";

import { mapSubmissionToOgShare } from "./submission";

test("maps processed row to og share payload", () => {
  const output = mapSubmissionToOgShare({
    id: "abc",
    status: "processed",
    score: "4.5",
    roastQuote: "quote",
  });

  assert.equal(output.id, "abc");
  assert.equal(output.score, "4.5");
});
