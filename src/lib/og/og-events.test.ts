import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyOgError, makeOgEvent } from "./og-events";

test("makeOgEvent returns a normalized OG event payload", () => {
  const event = makeOgEvent({
    name: "og.render.success",
    roastId: "roast-123",
    requestId: "req-abc",
    phase: "render",
    durationMs: 87,
  });

  assert.deepEqual(event, {
    name: "og.render.success",
    type: "success",
    roastId: "roast-123",
    requestId: "req-abc",
    phase: "render",
    durationMs: 87,
  });
});

test("classifyOgError returns timeout for timeout-like errors", () => {
  const error = Object.assign(new Error("request timed out"), {
    code: "ETIMEDOUT",
  });

  assert.equal(classifyOgError(error), "timeout");
});

test("classifyOgError returns network for network-like errors", () => {
  const error = Object.assign(new Error("socket hang up"), {
    code: "ECONNRESET",
  });

  assert.equal(classifyOgError(error), "network");
});

test("classifyOgError returns render for render failures", () => {
  const error = new Error("failed to render og image");

  assert.equal(classifyOgError(error), "render");
});

test("classifyOgError returns fetch for fetch-specific failures", () => {
  const error = Object.assign(new Error("failed to fetch roast payload"), {
    name: "FetchError",
  });

  assert.equal(classifyOgError(error), "fetch");
});

test("classifyOgError returns unknown when error cannot be classified", () => {
  assert.equal(classifyOgError("unexpected"), "unknown");
});
