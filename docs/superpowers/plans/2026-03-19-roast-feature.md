# Code Roast Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- []`) syntax for tracking.

**Goal:** Implement the core roast feature allowing users to submit code and view AI-generated roast results.

**Architecture:** tRPC mutation to create a pending submission and trigger a background AI processing task using Vercel AI SDK (`generateText` with `Output.object`). Client redirects to a result page that polls until the status is processed.

**Tech Stack:** Next.js App Router, tRPC, Drizzle ORM, Vercel AI SDK, Zod, Tailwind CSS.

---

### Task 1: Create Submission Router and Mutation

**Files:**
- Modify: `src/trpc/router.ts`
- Create: `src/trpc/routers/submission.ts` (if we decide to split, but let's stick to adding to `router.ts` for simplicity as per existing pattern or create a new file if preferred. We will create a new file `src/trpc/routers/submission.ts` to keep it clean and import it).

- [ ] **Step 1: Create the submission router file**
Create `src/trpc/routers/submission.ts` with a `create` mutation that accepts `code` (string), `language` (enum string), and `roastMode` (boolean). It should insert a 'pending' record into `submissions` and return the `id`.

- [ ] **Step 2: Connect the router**
In `src/trpc/router.ts`, import the new `submissionRouter` and add it to the `appRouter`.

- [ ] **Step 3: Trigger background processing (stub)**
Inside the `create` mutation, after the DB insert, add a placeholder function call `processRoastBackground(submissionId)` (do not `await` it) using `waitUntil` if available, or just as a floating promise. We'll implement this function in Task 2.

- [ ] **Step 4: Commit**
```bash
git add src/trpc/routers/submission.ts src/trpc/router.ts
git commit -m "feat: add tRPC mutation to create code submission"
```

### Task 2: Implement Background AI Processing

**Files:**
- Create: `src/lib/ai/process-roast.ts`
- Modify: `src/trpc/routers/submission.ts`

- [ ] **Step 1: Define the Zod schema for AI output**
In `src/lib/ai/process-roast.ts`, define a Zod schema matching the required DB fields (score, roastSummary, roastQuote, issues array, diffSuggestions object).

- [ ] **Step 2: Implement `processRoastBackground`**
Write the function that takes a `submissionId`. It should fetch the submission, call `generateText` from `ai` with `Output.object` using the schema, and a prompt based on the code and `roastMode`.

- [ ] **Step 3: Update Database with AI Results**
After receiving the AI response, update the `submissions`, `analysis_issues`, and `diff_suggestions` tables using Drizzle transactions. Handle errors by setting status to 'failed'.

- [ ] **Step 4: Integrate with Mutation**
Import and call this function in the tRPC `create` mutation from Task 1.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ai/process-roast.ts src/trpc/routers/submission.ts
git commit -m "feat: implement background AI processing for roasts"
```

### Task 3: Implement Frontend Submission Logic

**Files:**
- Modify: `src/components/home/home-editor-section.tsx`

- [ ] **Step 1: Add tRPC mutation hook**
Use `trpc.submission.create.useMutation()` inside the component.

- [ ] **Step 2: Handle form submission**
Update the "Roast my code" button `onClick` handler to call the mutation with the editor state (code, language, roastMode).

- [ ] **Step 3: Handle loading state and redirect**
Disable the button while `isLoading` is true. In the `onSuccess` callback, use `useRouter().push('/roast/' + data.id)` to redirect.

- [ ] **Step 4: Commit**
```bash
git add src/components/home/home-editor-section.tsx
git commit -m "feat: connect home editor to submission mutation"
```

### Task 4: Implement Result Page Polling & Fetching

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`
- Modify: `src/trpc/routers/submission.ts`

- [ ] **Step 1: Add `getById` query to tRPC**
In `src/trpc/routers/submission.ts`, add a query `getById` that fetches a submission and its relations (issues, diff) by ID.

- [ ] **Step 2: Implement polling in the result page**
In `src/app/roast/[id]/page.tsx`, change it to use a Client Component wrapper or just use `trpc.submission.getById.useQuery` with `refetchInterval: query => query.state.data?.status === 'pending' ? 3000 : false`.

- [ ] **Step 3: Handle UI states**
If status is 'pending', show a loading spinner/skeleton. If 'failed', show an error message. If 'processed', render the existing layout with the fetched data.

- [ ] **Step 4: Commit**
```bash
git add src/app/roast/[id]/page.tsx src/trpc/routers/submission.ts
git commit -m "feat: implement polling and dynamic data on roast result page"
```
