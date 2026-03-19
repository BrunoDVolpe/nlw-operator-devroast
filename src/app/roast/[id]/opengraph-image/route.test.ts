import assert from "node:assert/strict";
import { test } from "node:test";

import { createOgRoute } from "./route";

const validId = "00000000-0000-4000-8000-000000000001";
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

function createImageResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "image/png",
    },
  });
}

test("returns fallback image with status 200 for malformed roast id", async () => {
  const route = createOgRoute({
    createFallbackOgImageResponse: () => createImageResponse("fallback", 503),
    logEvent: () => {},
  });

  const response = await route(new Request("http://localhost"), {
    params: { id: "not-a-uuid" },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "fallback");
  assert.equal(response.headers.get("content-type"), "image/png");
});

test("always sets cache-control header", async () => {
  const route = createOgRoute({
    getRoastOgPayload: async () => ({
      status: "ready",
      data: {
        id: validId,
        status: "processed",
        score: "8.7",
        roastQuote: "Readable, but too many nested branches.",
      },
    }),
    truncateOgQuote: () => "Readable, but too many nested branches.",
    createRoastOgResponse: () => createImageResponse("og-success"),
    logEvent: () => {},
  });

  const response = await route(new Request("http://localhost"), {
    params: { id: validId },
  });

  assert.equal(response.headers.get("cache-control"), CACHE_CONTROL);
});

test("falls back to image response when Takumi render throws", async () => {
  const route = createOgRoute({
    getRoastOgPayload: async () => ({
      status: "ready",
      data: {
        id: validId,
        status: "processed",
        score: "7.1",
        roastQuote: "Good instincts, rough execution.",
      },
    }),
    truncateOgQuote: () => "Good instincts, rough execution.",
    createRoastOgResponse: () => {
      throw new Error("failed to render og image");
    },
    createFallbackOgImageResponse: () => createImageResponse("fallback"),
    logEvent: () => {},
  });

  const response = await route(new Request("http://localhost"), {
    params: { id: validId },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "fallback");
  assert.equal(response.headers.get("content-type"), "image/png");
});

test("handles timeout errors with fallback and cache-control", async () => {
  const events: Array<{ name: string; phase: string; durationMs: number; errorType?: string }> = [];

  const route = createOgRoute({
    getRoastOgPayload: async () => {
      throw Object.assign(new Error("request timed out"), { code: "ETIMEDOUT" });
    },
    createFallbackOgImageResponse: () => createImageResponse("fallback"),
    logEvent: (event) => {
      events.push(event);
    },
  });

  const response = await route(new Request("http://localhost"), {
    params: { id: validId },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "fallback");
  assert.equal(response.headers.get("cache-control"), CACHE_CONTROL);
  assert.equal(events.some((event) => event.name === "og.render.error"), true);
  assert.equal(events.some((event) => event.errorType === "timeout"), true);
});

test("returns fallback image when payload is incomplete", async () => {
  const route = createOgRoute({
    getRoastOgPayload: async () => ({
      status: "incomplete",
      data: {
        id: validId,
        status: "pending",
        score: null,
        roastQuote: null,
      },
    }),
    createFallbackOgImageResponse: () => createImageResponse("fallback"),
    logEvent: () => {},
  });

  const response = await route(new Request("http://localhost"), {
    params: { id: validId },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "fallback");
  assert.equal(response.headers.get("content-type"), "image/png");
});
