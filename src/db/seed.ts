import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

import { db, dbPool } from "./client";
import {
  analysisIssues,
  codeLanguageEnum,
  diffSuggestions,
  submissionSnippets,
  submissions,
} from "./schema";

const TOTAL_SUBMISSIONS = 100;

const roastQuotes = [
  "Seu codigo tem potencial. Infelizmente, so potencial.",
  "Isso nao e um bug, e uma feature de terror.",
  "Parabens, voce criou um puzzle sem solucao.",
  "A logica ate faz sentido... em outro universo.",
  "Refatorar isso vai ser o cardio da equipe.",
  "Se isso passa no lint, o lint precisa de terapia.",
  "Seu codigo e como cafe frio: ainda funciona, mas machuca.",
  "Eu ja vi planilhas com mais estrutura.",
  "O compilador chorou, mas seguiu em frente.",
  "Seu codigo e consistente: consistentemente confuso.",
];

const roastSummaries = [
  "Funciona, mas com varias escolhas questionaveis.",
  "Tem boas ideias, mas a execucao esta baguncada.",
  "A base esta ok, so precisa de menos atalhos.",
  "Claridade baixa, mas ainda salvavel.",
  "Passou no teste do pavor, nao no da manutencao.",
];

const issueTitles = [
  "Nome de variavel generico",
  "Complexidade desnecessaria",
  "Condicional excessiva",
  "Falta tratamento de erro",
  "Duplicacao de logica",
  "Acoplamento elevado",
];

const issueDescriptions = [
  "A intencao do trecho nao fica clara com os nomes atuais.",
  "Esse bloco pode ser simplificado em funcoes menores.",
  "Os caminhos de execucao estao confusos e dificeis de testar.",
  "Casos extremos nao sao tratados, o que pode quebrar em runtime.",
  "O mesmo comportamento aparece em mais de um lugar.",
];

const severityOptions = ["critical", "warning", "good"] as const;
const snippetPurposeOptions = [
  "leaderboard",
  "result_header",
  "other",
] as const;

const languages = codeLanguageEnum.enumValues;

const makeScore = () =>
  faker.number.float({ min: 0, max: 10, multipleOf: 0.1 }).toFixed(1);

const makeCode = () => {
  const functionName = faker.hacker.verb() + faker.string.alphanumeric(4);
  const lines = [
    `// ${faker.hacker.phrase()}`,
    `function ${functionName}() {`,
    `  const value = ${faker.number.int({ min: 0, max: 10 })};`,
    `  return value;`,
    `}`,
  ];

  return lines.join("\n");
};

const makeDiff = (code: string) => {
  const originalLines = code.split("\n");
  const improvedLines = [...originalLines];
  improvedLines.splice(2, 1, "  const value = Number.parseInt('8', 10);");

  return [
    "--- a/your_code.ts",
    "+++ b/improved_code.ts",
    "@@",
    ...originalLines.map((line) => `-${line}`),
    ...improvedLines.map((line) => `+${line}`),
  ].join("\n");
};

const makeSnippet = (code: string) => {
  const lines = code.split("\n");
  const start = 1;
  const end = Math.min(lines.length, 3);
  return {
    snippet: lines.slice(0, end).join("\n"),
    lineStart: start,
    lineEnd: end,
  };
};

const seed = async () => {
  const submissionsData = Array.from({ length: TOTAL_SUBMISSIONS }, () => {
    const code = makeCode();
    return {
      id: randomUUID(),
      code,
      language: faker.helpers.arrayElement(languages),
      roastMode: true,
      status: "processed" as const,
      score: makeScore(),
      roastSummary: faker.helpers.arrayElement(roastSummaries),
      roastQuote: faker.helpers.arrayElement(roastQuotes),
      createdAt: faker.date.recent({ days: 30 }),
    };
  });

  await db.insert(submissions).values(submissionsData);

  const issuesData = submissionsData.flatMap((submission) => {
    const totalIssues = faker.number.int({ min: 2, max: 4 });
    return Array.from({ length: totalIssues }, (_, index) => ({
      id: randomUUID(),
      submissionId: submission.id,
      title: faker.helpers.arrayElement(issueTitles),
      description: faker.helpers.arrayElement(issueDescriptions),
      severity: faker.helpers.arrayElement(severityOptions),
      orderIndex: index,
    }));
  });

  const diffsData = submissionsData.map((submission) => ({
    id: randomUUID(),
    submissionId: submission.id,
    fromFile: "your_code.ts",
    toFile: "improved_code.ts",
    unifiedDiff: makeDiff(submission.code),
    createdAt: submission.createdAt,
  }));

  const snippetsData = submissionsData.map((submission) => {
    const snippet = makeSnippet(submission.code);
    return {
      id: randomUUID(),
      submissionId: submission.id,
      snippet: snippet.snippet,
      lineStart: snippet.lineStart,
      lineEnd: snippet.lineEnd,
      purpose: faker.helpers.arrayElement(snippetPurposeOptions),
    };
  });

  await db.insert(analysisIssues).values(issuesData);
  await db.insert(diffSuggestions).values(diffsData);
  await db.insert(submissionSnippets).values(snippetsData);
};

seed()
  .then(() => {
    console.log("Seed completed.");
  })
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await dbPool.end();
  });
