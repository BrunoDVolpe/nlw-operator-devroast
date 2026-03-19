import assert from "node:assert/strict";
import { test } from "node:test";

import { createCallerFactory } from "@/trpc/init";
import {
  mapSubmissionToOgShare,
  type OgShareSubmissionRow,
} from "./submission-og-share-mapper";
import { createSubmissionRouter } from "./submission-router-factory";

function createDbStub(row: OgShareSubmissionRow | null) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (row ? [row] : []),
        }),
      }),
    }),
  };
}

async function callOgShareById(row: OgShareSubmissionRow | null, id: string) {
  const router = createSubmissionRouter(createDbStub(row));
  const createCaller = createCallerFactory(router);
  const caller = createCaller({});
  const query = caller.ogShareById as (input: {
    id: string;
  }) => Promise<ReturnType<typeof mapSubmissionToOgShare> | null>;

  return query({ id });
}

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

test("ogShareById returns payload for eligible row", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const output = await callOgShareById(
    {
      id,
      status: "processed",
      score: "4.5",
      roastQuote: "quote",
    },
    id,
  );

  assert.deepEqual(output, {
    id,
    status: "processed",
    score: "4.5",
    roastQuote: "quote",
  });
});

test("ogShareById returns null for ineligible row", async () => {
  const id = "00000000-0000-4000-8000-000000000002";
  const output = await callOgShareById(
    {
      id,
      status: "failed",
      score: "4.5",
      roastQuote: "quote",
    },
    id,
  );

  assert.equal(output, null);
});

test("ogShareById returns null for unknown id", async () => {
  const output = await callOgShareById(
    null,
    "00000000-0000-4000-8000-000000000003",
  );

  assert.equal(output, null);
});
