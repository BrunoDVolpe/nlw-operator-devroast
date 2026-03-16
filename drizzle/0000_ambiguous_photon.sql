CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."code_language" AS ENUM('javascript', 'typescript', 'python', 'go', 'java', 'csharp', 'c', 'cpp', 'php', 'ruby', 'kotlin', 'swift', 'rust', 'elixir', 'bash', 'sql', 'html', 'css', 'json', 'yaml');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."snippet_purpose" AS ENUM('leaderboard', 'result_header', 'other');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "analysis_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submissionId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" "issue_severity" DEFAULT 'warning' NOT NULL,
	"orderIndex" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diff_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submissionId" uuid NOT NULL,
	"fromFile" text DEFAULT 'your_code.ts' NOT NULL,
	"toFile" text DEFAULT 'improved_code.ts' NOT NULL,
	"unifiedDiff" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diff_suggestions_submissionId_unique" UNIQUE("submissionId")
);
--> statement-breakpoint
CREATE TABLE "submission_snippets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submissionId" uuid NOT NULL,
	"snippet" text NOT NULL,
	"lineStart" integer DEFAULT 1 NOT NULL,
	"lineEnd" integer DEFAULT 1 NOT NULL,
	"purpose" "snippet_purpose" DEFAULT 'leaderboard' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "code_language" NOT NULL,
	"roastMode" boolean DEFAULT true NOT NULL,
	"status" "submission_status" DEFAULT 'processed' NOT NULL,
	"score" numeric(3, 1),
	"roastSummary" text,
	"roastQuote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_issues" ADD CONSTRAINT "analysis_issues_submissionId_submissions_id_fk" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diff_suggestions" ADD CONSTRAINT "diff_suggestions_submissionId_submissions_id_fk" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_snippets" ADD CONSTRAINT "submission_snippets_submissionId_submissions_id_fk" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_leaderboard_idx" ON "submissions" USING btree ("score","createdAt");
