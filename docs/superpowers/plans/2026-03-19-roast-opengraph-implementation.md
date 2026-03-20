# Roast OpenGraph Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer com que todo link de `/roast/[id]` gere preview social com imagem dinamica (`score`, `verdict`, `roastQuote`) via Takumi, com fallback automatico e cache HTTP.

**Architecture:** A pagina de roast passa a usar `generateMetadata` dinamico e apontar para uma rota de imagem dedicada (`/roast/[id]/opengraph-image`). Essa rota consome um contrato oficial do backend (tRPC), prepara payload visual, aplica truncamento em 2 linhas com ellipsis, tenta render Takumi e cai para fallback em qualquer falha mantendo HTTP 200 e headers de cache. Logs estruturados capturam sucesso, fallback e erro.

**Tech Stack:** Next.js App Router, tRPC, Drizzle ORM, TypeScript, `@takumi-rs/image-response`, Node test runner (`tsx --test`).

---

## File Structure (target)

- Modify: `next.config.ts`
  - externalizar `@takumi-rs/core` via `serverExternalPackages`.
- Modify: `package.json`
  - adicionar `@takumi-rs/image-response` e scripts de teste.
- Create: `src/trpc/routers/submission.ts`
  - query oficial `ogShareById` para dados de OG do roast.
- Modify: `src/trpc/router.ts`
  - compor router `submission` no `appRouter`.
- Create: `src/server/roast/get-roast-og-payload.ts`
  - adapter que chama `caller.submission.ogShareById` e classifica payload como `ready` ou `incomplete`.
- Create: `src/server/roast/get-roast-og-payload.test.ts`
  - testes de normalizacao e contrato.
- Create: `src/lib/og/truncate-og-quote.ts`
  - truncamento visual-aware (2 linhas + `...`).
- Create: `src/lib/og/truncate-og-quote.test.ts`
  - testes de truncamento com casos de newline e overflow.
- Create: `src/lib/og/takumi/render-roast-og-image.tsx`
  - template Takumi alinhado ao frame Pencil `Footer Hint (e1iw1)`.
- Create: `src/lib/og/takumi/render-roast-og-image.test.ts`
  - testes de contrato de resposta e erro.
- Create: `src/lib/og/fallback-og-image.tsx`
  - provider de fallback OG 1200x630.
- Create: `src/lib/og/og-events.ts`
  - contrato de eventos/logs (`og.render.success|fallback|error`).
- Create: `src/lib/og/og-events.test.ts`
  - testes de schema de eventos.
- Create: `src/app/roast/[id]/opengraph-image/route.ts`
  - rota GET da imagem OG com cache + fallback.
- Create: `src/app/roast/[id]/opengraph-image/route.test.ts`
  - testes de status/content-type/cache/fallback.
- Modify: `src/app/roast/[id]/page.tsx`
  - trocar `metadata` estatico por `generateMetadata` dinamico com contexto.
- Create: `src/app/roast/[id]/metadata.test.ts`
  - testes para `openGraph.images` e `twitter.images`.

### Task 1: Preparar runtime Takumi e base de testes

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`
- Create: `tests/config/next-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../../next.config";

test("takumi core is externalized", () => {
  const externals = (nextConfig as { serverExternalPackages?: string[] })
    .serverExternalPackages;
  assert.ok(externals?.includes("@takumi-rs/core"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "tests/config/next-config.test.ts"`  
Expected: FAIL (missing `serverExternalPackages`).

- [ ] **Step 3: Write minimal implementation**

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["@takumi-rs/core"],
};
```

```json
// package.json
{
  "dependencies": {
    "@takumi-rs/image-response": "^0.73.1"
  },
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "tsx --test src/**/*.test.ts tests/**/*.test.ts"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "tests/config/next-config.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts package.json tests/config/next-config.test.ts
git commit -m "build: configure takumi runtime support"
```

### Task 2: Criar contrato oficial tRPC para dados OG do roast

**Files:**
- Create: `src/trpc/routers/submission.ts`
- Modify: `src/trpc/router.ts`
- Create: `src/trpc/routers/submission.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mapSubmissionToOgShare } from "./submission";

test("maps processed row to og share payload", () => {
  const out = mapSubmissionToOgShare({
    id: "abc",
    status: "processed",
    score: "4.5",
    roastQuote: "quote",
  });
  assert.equal(out.id, "abc");
  assert.equal(out.score, "4.5");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/trpc/routers/submission.test.ts"`  
Expected: FAIL (router/helper missing).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/trpc/routers/submission.ts
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export function mapSubmissionToOgShare(row: {
  id: string;
  status: "pending" | "processed" | "failed";
  score: string | null;
  roastQuote: string | null;
}) {
  return {
    id: row.id,
    status: row.status,
    score: row.score,
    roastQuote: row.roastQuote,
  };
}

export const submissionRouter = createTRPCRouter({
  ogShareById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          id: submissions.id,
          status: submissions.status,
          score: submissions.score,
          roastQuote: submissions.roastQuote,
        })
        .from(submissions)
        .where(eq(submissions.id, input.id))
        .limit(1);

      return row ? mapSubmissionToOgShare(row) : null;
    }),
});
```

```ts
// src/trpc/router.ts
import { submissionRouter } from "./routers/submission";

export const appRouter = createTRPCRouter({
  metrics: metricsRouter,
  leaderboard: leaderboardRouter,
  submission: submissionRouter,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/trpc/routers/submission.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/trpc/routers/submission.ts src/trpc/router.ts src/trpc/routers/submission.test.ts
git commit -m "feat: add submission og share query to trpc"
```

### Task 3: Adapter server-side com politica de dados incompletos

**Files:**
- Create: `src/server/roast/get-roast-og-payload.ts`
- Create: `src/server/roast/get-roast-og-payload.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateRoastOgPayload } from "./get-roast-og-payload";

test("marks payload as incomplete when required fields are missing", () => {
  const out = evaluateRoastOgPayload({
    id: "abc",
    status: "pending",
    score: null,
    roastQuote: null,
  });

  assert.equal(out.kind, "incomplete");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/server/roast/get-roast-og-payload.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```ts
import { caller } from "@/trpc/server";

export type RoastOgPayload = {
  id: string;
  scoreLabel: string;
  verdictLabel: string;
  quote: string;
};

export type RoastOgPayloadResult =
  | { kind: "ready"; payload: RoastOgPayload }
  | { kind: "incomplete"; reason: "status" | "score" | "quote" };

export function evaluateRoastOgPayload(input: {
  id: string;
  status: "pending" | "processed" | "failed";
  score: string | null;
  roastQuote: string | null;
}): RoastOgPayloadResult {
  if (input.status !== "processed") return { kind: "incomplete", reason: "status" };
  if (input.score == null) return { kind: "incomplete", reason: "score" };
  if (!input.roastQuote) return { kind: "incomplete", reason: "quote" };

  return {
    kind: "ready",
    payload: {
      id: input.id,
      scoreLabel: input.score,
      verdictLabel: "processed",
      quote: input.roastQuote,
    },
  };
}

export async function getRoastOgPayload(id: string): Promise<RoastOgPayloadResult | null> {
  const row = await caller.submission.ogShareById({ id });
  if (!row) return null;
  return evaluateRoastOgPayload(row);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/server/roast/get-roast-og-payload.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/roast/get-roast-og-payload.ts src/server/roast/get-roast-og-payload.test.ts
git commit -m "feat: add normalized server adapter for roast og payload"
```

### Task 4: Truncamento por medicao real de largura (2 linhas)

**Files:**
- Create: `src/lib/og/truncate-og-quote.ts`
- Create: `src/lib/og/truncate-og-quote.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { truncateOgQuote } from "./truncate-og-quote";

test("clamps to two visual lines with ellipsis", () => {
  const text = "very long quote ".repeat(40);
  const out = truncateOgQuote(text, {
    maxLines: 2,
    containerWidth: 860,
    measureTextWidth: (value) => value.length * 20,
  });
  assert.equal(out.endsWith("..."), true);
});

test("does not append ellipsis when text already fits", () => {
  const out = truncateOgQuote("short quote", {
    maxLines: 2,
    containerWidth: 860,
    measureTextWidth: (value) => value.length * 20,
  });
  assert.equal(out.endsWith("..."), false);
});

test("normalizes explicit newlines", () => {
  const out = truncateOgQuote("line1\nline2\nline3", {
    maxLines: 2,
    containerWidth: 860,
    measureTextWidth: (value) => value.length * 20,
  });
  assert.equal(out.includes("\n"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/lib/og/truncate-og-quote.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```ts
type TruncateOptions = {
  maxLines: number;
  containerWidth: number;
  measureTextWidth: (text: string) => number;
};

export function truncateOgQuote(input: string, options: TruncateOptions): string {
  const normalized = input.replace(/\s+/g, " ").trim();

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (options.measureTextWidth(candidate) <= options.containerWidth) {
      current = candidate;
      continue;
    }

    lines.push(current || word);
    current = current ? word : "";
    if (lines.length === options.maxLines) break;
  }

  if (lines.length < options.maxLines && current) lines.push(current);
  const overflowed = lines.length > options.maxLines || words.join(" ") !== lines.join(" ");
  const clamped = lines.slice(0, options.maxLines).join(" ");
  return overflowed ? `${clamped.replace(/\s+$/, "")}...` : clamped;
}

export function measureTakumiTextWidth(
  text: string,
  config: { fontFamily: string; fontSize: number; fontWeight: number },
): number {
  // wrapper around Takumi measure API to keep route/template decoupled
  // from renderer internals.
  return measureTextWithTakumi(text, config);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/lib/og/truncate-og-quote.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/og/truncate-og-quote.ts src/lib/og/truncate-og-quote.test.ts
git commit -m "feat: add two-line og quote truncation helper"
```

### Task 5: Renderer Takumi + fallback image

**Files:**
- Create: `src/lib/og/takumi/render-roast-og-image.tsx`
- Create: `src/lib/og/takumi/render-roast-og-image.test.ts`
- Create: `src/lib/og/fallback-og-image.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoastOgResponse } from "./render-roast-og-image";

test("returns image response", () => {
  const response = createRoastOgResponse({
    scoreLabel: "3.5",
    verdictLabel: "needs_serious_help",
    quote: "short quote",
  });
  assert.equal(response.headers.get("content-type")?.startsWith("image/"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/lib/og/takumi/render-roast-og-image.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { ImageResponse } from "@takumi-rs/image-response";

export function createRoastOgResponse(input: {
  scoreLabel: string;
  verdictLabel: string;
  quote: string;
}): Response {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#09090B", color: "#F4F4F5", padding: 48, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 24, opacity: 0.85 }}>devroast</div>
      <div style={{ fontSize: 112, fontWeight: 700 }}>{input.scoreLabel}</div>
      <div style={{ fontSize: 30 }}>{input.verdictLabel}</div>
      <div style={{ fontSize: 36, lineHeight: 1.25 }}>{input.quote}</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
```

```tsx
import { ImageResponse } from "@takumi-rs/image-response";

export function createFallbackOgImageResponse(): Response {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#09090B", color: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 700 }}>
      devroast // roast result
    </div>,
    { width: 1200, height: 630 },
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/lib/og/takumi/render-roast-og-image.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/og/takumi/render-roast-og-image.tsx src/lib/og/takumi/render-roast-og-image.test.ts src/lib/og/fallback-og-image.tsx
git commit -m "feat: add takumi og renderer with fallback provider"
```

### Task 6: Observabilidade de render OG

**Files:**
- Create: `src/lib/og/og-events.ts`
- Create: `src/lib/og/og-events.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeOgEvent } from "./og-events";
import { classifyOgError } from "./og-events";

test("creates og.render.error with required fields", () => {
  const event = makeOgEvent("og.render.error", {
    roastId: "abc",
    requestId: "req-1",
    phase: "render",
    durationMs: 12,
    errorType: "render",
    errorCode: "og_render_failed",
  });

  assert.equal(event.name, "og.render.error");
  assert.equal(event.payload.requestId, "req-1");
});

test("classifies timeout error", () => {
  const type = classifyOgError(new Error("Takumi render timeout"));
  assert.equal(type, "timeout");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/lib/og/og-events.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```ts
export type OgEventName = "og.render.success" | "og.render.fallback" | "og.render.error";
export type OgPhase = "fetch" | "normalize" | "render" | "fallback";
export type OgErrorType = "timeout" | "network" | "render" | "fetch" | "unknown";

export function classifyOgError(error: unknown): OgErrorType {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("timeout")) return "timeout";
  if (message.includes("network") || message.includes("econn")) return "network";
  if (message.includes("render") || message.includes("takumi")) return "render";
  if (message.includes("fetch")) return "fetch";
  return "unknown";
}

export function makeOgEvent(
  name: OgEventName,
  payload: {
    roastId: string;
    requestId: string;
    phase: OgPhase;
    durationMs: number;
    errorType?: OgErrorType;
    errorCode?: string;
  },
) {
  return { name, payload };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/lib/og/og-events.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/og/og-events.ts src/lib/og/og-events.test.ts
git commit -m "chore: add structured og render event contract"
```

### Task 7: Implementar rota de imagem OG com cache/fallback

**Files:**
- Create: `src/app/roast/[id]/opengraph-image/route.ts`
- Create: `src/app/roast/[id]/opengraph-image/route.test.ts`
- Modify: `src/lib/og/og-events.ts` (if needed)

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { GET } from "./route";

test("returns fallback with HTTP 200 for malformed id", async () => {
  const req = new Request("http://localhost:3000/roast/not-uuid/opengraph-image");
  const res = await GET(req, { params: Promise.resolve({ id: "not-uuid" }) });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type")?.startsWith("image/"), true);
});

test("always sets cache-control header", async () => {
  const req = new Request("http://localhost:3000/roast/not-uuid/opengraph-image");
  const res = await GET(req, { params: Promise.resolve({ id: "not-uuid" }) });
  assert.equal(
    res.headers.get("cache-control"),
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
});

test("returns fallback when takumi render throws", async () => {
  const GET = createOgRoute({
    getPayload: async () => ({
      kind: "ready",
      payload: { id: "abc", scoreLabel: "3.5", verdictLabel: "processed", quote: "q" },
    }),
    render: () => {
      throw new Error("render failed");
    },
  });

  const req = new Request("http://localhost:3000/roast/00000000-0000-0000-0000-000000000001/opengraph-image");
  const res = await GET(req, {
    params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type")?.startsWith("image/"), true);
});

test("returns fallback when takumi times out", async () => {
  const GET = createOgRoute({
    getPayload: async () => ({
      kind: "ready",
      payload: { id: "abc", scoreLabel: "3.5", verdictLabel: "processed", quote: "q" },
    }),
    render: () => {
      throw new Error("Takumi render timeout");
    },
  });

  const req = new Request("http://localhost:3000/roast/00000000-0000-0000-0000-000000000001/opengraph-image");
  const res = await GET(req, {
    params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
  });
  assert.equal(res.status, 200);
  assert.equal(
    res.headers.get("cache-control"),
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
});

test("returns fallback when roast payload is incomplete", async () => {
  // mock getRoastOgPayload to return { kind: "incomplete", reason: "score" }
  // then assert HTTP 200 fallback response
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/app/roast/[id]/opengraph-image/route.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```ts
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createFallbackOgImageResponse } from "@/lib/og/fallback-og-image";
import { makeOgEvent } from "@/lib/og/og-events";
import { classifyOgError } from "@/lib/og/og-events";
import { measureTakumiTextWidth, truncateOgQuote } from "@/lib/og/truncate-og-quote";
import { createRoastOgResponse } from "@/lib/og/takumi/render-roast-og-image";
import { getRoastOgPayload } from "@/server/roast/get-roast-og-payload";

const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
const IdSchema = z.string().uuid();

function withCache(response: Response) {
  response.headers.set("cache-control", CACHE);
  return response;
}

export function createOgRoute(deps?: {
  getPayload?: typeof getRoastOgPayload;
  render?: typeof createRoastOgResponse;
}) {
  const getPayload = deps?.getPayload ?? getRoastOgPayload;
  const render = deps?.render ?? createRoastOgResponse;

  return async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> },
  ): Promise<Response> {
  const requestId = randomUUID();
  const start = Date.now();

  try {
    const { id } = await context.params;
    const parsed = IdSchema.safeParse(id);

    if (!parsed.success) {
      console.info(makeOgEvent("og.render.fallback", {
        roastId: id,
        requestId,
        phase: "fetch",
        durationMs: Date.now() - start,
        errorType: "fetch",
        errorCode: "invalid_id",
      }));
      return withCache(createFallbackOgImageResponse());
    }

    const payloadResult = await getPayload(parsed.data);
    if (!payloadResult) {
      console.info(makeOgEvent("og.render.fallback", {
        roastId: parsed.data,
        requestId,
        phase: "fetch",
        durationMs: Date.now() - start,
        errorType: "fetch",
        errorCode: "submission_not_found",
      }));
      return withCache(createFallbackOgImageResponse());
    }

    if (payloadResult.kind === "incomplete") {
      console.info(makeOgEvent("og.render.fallback", {
        roastId: parsed.data,
        requestId,
        phase: "normalize",
        durationMs: Date.now() - start,
        errorType: "fetch",
        errorCode: `incomplete_${payloadResult.reason}`,
      }));
      return withCache(createFallbackOgImageResponse());
    }

    const payload = payloadResult.payload;

    const response = render({
      ...payload,
      quote: truncateOgQuote(payload.quote, {
        maxLines: 2,
        containerWidth: 860,
        measureTextWidth: (text) => {
          // use Takumi measure API with OG font settings for real line-fit
          return measureTakumiTextWidth(text, {
            fontFamily: "JetBrains Mono",
            fontSize: 36,
            fontWeight: 500,
          });
        },
      }),
    });

    console.info(makeOgEvent("og.render.success", {
      roastId: payload.id,
      requestId,
      phase: "render",
      durationMs: Date.now() - start,
    }));

    return withCache(response);
  } catch (error) {
    const errorType = classifyOgError(error);
    console.error(makeOgEvent("og.render.error", {
      roastId: "unknown",
      requestId,
      phase: "render",
      durationMs: Date.now() - start,
      errorType,
      errorCode: error instanceof Error ? error.name : "unknown_error",
    }));
    return withCache(createFallbackOgImageResponse());
  }
  };
}

export const GET = createOgRoute();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/app/roast/[id]/opengraph-image/route.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/roast/[id]/opengraph-image/route.ts src/app/roast/[id]/opengraph-image/route.test.ts
git commit -m "feat: implement roast opengraph image route with fallback"
```

### Task 8: Metadata dinamico com contexto do roast

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`
- Create: `src/app/roast/[id]/metadata.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRoastMetadata } from "./page";

test("builds metadata with contextual description and image", async () => {
  const data = await buildRoastMetadata({
    id: "00000000-0000-0000-0000-000000000001",
    origin: "https://devroast.app",
    scoreLabel: "3.5",
    verdictLabel: "needs_serious_help",
  });

  assert.equal(
    data.openGraph?.images?.[0]?.url,
    "https://devroast.app/roast/00000000-0000-0000-0000-000000000001/opengraph-image",
  );
  assert.equal(data.description?.includes("score 3.5"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm tsx --test "src/app/roast/[id]/metadata.test.ts"`  
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getRoastOgPayload } from "@/server/roast/get-roast-og-payload";

export async function buildRoastMetadata(input: {
  id: string;
  origin: string;
  scoreLabel: string;
  verdictLabel: string;
}): Promise<Metadata> {
  const imageUrl = `${input.origin}/roast/${input.id}/opengraph-image`;
  return {
    title: `Roast ${input.verdictLabel} | Devroast`,
    description: `Share this roast result with score ${input.scoreLabel}.`,
    openGraph: { images: [{ url: imageUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const payload = await getRoastOgPayload(id);
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  return buildRoastMetadata({
    id,
    origin: `${protocol}://${host}`,
    scoreLabel: payload?.kind === "ready" ? payload.payload.scoreLabel : "--",
    verdictLabel:
      payload?.kind === "ready" ? payload.payload.verdictLabel : "pending_review",
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm tsx --test "src/app/roast/[id]/metadata.test.ts"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/roast/[id]/page.tsx src/app/roast/[id]/metadata.test.ts
git commit -m "feat: add contextual metadata for roast share pages"
```

### Task 9: Verificacao final (spec compliance)

**Files:**
- Modify: qualquer arquivo tocado nas tasks 1-8 (se ajuste final for necessario)

- [ ] **Step 1: Run all tests**

Run: `pnpm test`  
Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`  
Expected: PASS.

- [ ] **Step 3: Run build**

Run: `pnpm build`  
Expected: PASS, incluindo rota `opengraph-image/route.ts` com Takumi.

- [ ] **Step 4: Manual smoke checks**

Run:

```bash
pnpm dev
# 1) abrir /roast/<valid-uuid>
# 2) validar no HTML: og:image e twitter:image -> /roast/<id>/opengraph-image
# 3) abrir /roast/<valid-uuid>/opengraph-image
# 4) abrir /roast/not-uuid/opengraph-image
```

Expected:
- valid uuid: imagem dinamica com score + verdict + quote truncada
- invalid id: fallback com HTTP 200
- ambos com `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: add dynamic takumi opengraph images for roast shares"
```

## Notes

- Nao introduzir renderer alternativo nesta iteracao.
- Preservar linguagem visual do frame Pencil selecionado (`Footer Hint`, `e1iw1`) no template Takumi.
- Se algum teste de imagem for fraco em assert visual, manter asserts de contrato (status, content-type, headers, fallback path, metadata tags) como bloqueadores.
