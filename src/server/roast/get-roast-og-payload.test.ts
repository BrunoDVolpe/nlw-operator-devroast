import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateRoastOgPayload,
  getRoastOgPayload,
  type RoastOgPayload,
} from "./get-roast-og-payload";

const basePayload: RoastOgPayload = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "processed",
  score: "4.5",
  roastQuote: "quote",
};

test("evaluateRoastOgPayload returns ready for complete processed payload", () => {
  const output = evaluateRoastOgPayload(basePayload);

  assert.deepEqual(output, {
    status: "ready",
    data: {
      id: basePayload.id,
      status: "processed",
      score: "4.5",
      roastQuote: "quote",
    },
  });
});

test("evaluateRoastOgPayload returns incomplete for payload with missing fields", () => {
  const output = evaluateRoastOgPayload({
    ...basePayload,
    score: null,
  });

  assert.deepEqual(output, {
    status: "incomplete",
    data: {
      id: basePayload.id,
      status: "processed",
      score: null,
      roastQuote: "quote",
    },
  });
});

test("getRoastOgPayload uses caller response and normalizes as ready", async () => {
  const output = await getRoastOgPayload(basePayload.id, async () => basePayload);

  assert.deepEqual(output, {
    status: "ready",
    data: {
      id: basePayload.id,
      status: "processed",
      score: "4.5",
      roastQuote: "quote",
    },
  });
});

test("getRoastOgPayload returns null when caller returns null", async () => {
  const output = await getRoastOgPayload(basePayload.id, async () => null);

  assert.equal(output, null);
});
