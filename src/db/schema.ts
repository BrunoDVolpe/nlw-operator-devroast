import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const codeLanguageEnum = pgEnum("code_language", [
  "javascript",
  "typescript",
  "python",
  "go",
  "java",
  "csharp",
  "c",
  "cpp",
  "php",
  "ruby",
  "kotlin",
  "swift",
  "rust",
  "elixir",
  "bash",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "processed",
  "failed",
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const snippetPurposeEnum = pgEnum("snippet_purpose", [
  "leaderboard",
  "result_header",
  "other",
]);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    language: codeLanguageEnum("language").notNull(),
    roastMode: boolean("roastMode").notNull().default(true),
    status: submissionStatusEnum("status").notNull().default("processed"),
    score: numeric("score", { precision: 3, scale: 1 }),
    roastSummary: text("roastSummary"),
    roastQuote: text("roastQuote"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("submissions_leaderboard_idx").on(table.score, table.createdAt),
  ],
);

export const analysisIssues = pgTable("analysis_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submissionId")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: issueSeverityEnum("severity").notNull().default("warning"),
  orderIndex: integer("orderIndex").notNull().default(0),
});

export const diffSuggestions = pgTable("diff_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submissionId")
    .notNull()
    .unique()
    .references(() => submissions.id, { onDelete: "cascade" }),
  fromFile: text("fromFile").notNull().default("your_code.ts"),
  toFile: text("toFile").notNull().default("improved_code.ts"),
  unifiedDiff: text("unifiedDiff").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const submissionSnippets = pgTable("submission_snippets", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submissionId")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  snippet: text("snippet").notNull(),
  lineStart: integer("lineStart").notNull().default(1),
  lineEnd: integer("lineEnd").notNull().default(1),
  purpose: snippetPurposeEnum("purpose").notNull().default("leaderboard"),
});

import { relations } from "drizzle-orm";

export const submissionsRelations = relations(submissions, ({ many, one }) => ({
  analysisIssues: many(analysisIssues),
  diffSuggestions: one(diffSuggestions, {
    fields: [submissions.id],
    references: [diffSuggestions.submissionId],
  }),
}));

export const analysisIssuesRelations = relations(analysisIssues, ({ one }) => ({
  submission: one(submissions, {
    fields: [analysisIssues.submissionId],
    references: [submissions.id],
  }),
}));

export const diffSuggestionsRelations = relations(diffSuggestions, ({ one }) => ({
  submission: one(submissions, {
    fields: [diffSuggestions.submissionId],
    references: [submissions.id],
  }),
}));
