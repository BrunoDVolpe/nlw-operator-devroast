# Drizzle ORM + Postgres

## Objetivo
Definir o schema inicial e o plano de implantacao do Drizzle ORM com Postgres (Docker Compose) para substituir os dados estaticos do Devroast.

## Contexto (README + layout)
- Fluxo principal: usuario cola o codigo, ativa/desativa roast mode e envia.
- Resultado: score, texto de roast/veredito, analise detalhada com cards e uma sugestao de diff.
- Leaderboard: lista ordenada por score com trechos de codigo e linguagem.
- Submissoes anonimas (sem login).
- Roast gerado por IA agnostica via Vercel AI SDK (provider plugavel).

## Modelo de dados (MVP)

### Tabela: submissions
Armazena cada envio de codigo.

Campos:
- id (uuid, pk)
- code (text, not null)
- language (enum: code_language, not null)
- roast_mode (boolean, default true)
- status (enum: submission_status, default "processed")
- score (numeric(3,1) 0-10, nullable)
- roast_summary (text, nullable)
- roast_quote (text, nullable)
- created_at (timestamp with time zone, default now)

Observacoes:
- score e roast_* podem ser calculados no back-end. Manter no submission facilita leaderboard.
- UI mostra score como "3.5/10" (Screen 2 - Score Hero), por isso numeric(3,1).
- status permite evoluir para pipeline async (pending/processed/failed).

### Tabela: analysis_issues
Cards da secao de analise detalhada.

Campos:
- id (uuid, pk)
- submission_id (uuid, fk -> submissions.id, on delete cascade)
- title (text, not null)
- description (text, not null)
- severity (enum: issue_severity, default "medium")
- order_index (integer, default 0)

### Tabela: diff_suggestions
Diff sugerido para o codigo submetido.

Campos:
- id (uuid, pk)
- submission_id (uuid, fk -> submissions.id, on delete cascade, unique)
- from_file (text, default "your_code.ts")
- to_file (text, default "improved_code.ts")
- unified_diff (text, not null)
- created_at (timestamp with time zone, default now)

### Tabela: submission_snippets
Trechos curtos para leaderboard e cards (evita cortar no client).

Campos:
- id (uuid, pk)
- submission_id (uuid, fk -> submissions.id, on delete cascade)
- snippet (text, not null)
- line_start (integer, default 1)
- line_end (integer, default 1)
- purpose (enum: snippet_purpose, default "leaderboard")

## Enums
- code_language (max 20): "javascript", "typescript", "python", "go", "java", "csharp", "c", "cpp", "php", "ruby", "kotlin", "swift", "rust", "elixir", "bash", "sql", "html", "css", "json", "yaml"
- submission_status: "pending", "processed", "failed"
- issue_severity: "critical", "warning", "good" (labels vistos no detailed_analysis)
- snippet_purpose: "leaderboard", "result_header", "other"

## Relacionamentos
- submissions 1:N analysis_issues
- submissions 1:1 diff_suggestions
- submissions 1:N submission_snippets

## Indices sugeridos
- submissions: (created_at desc), (score desc), (language)
- analysis_issues: (submission_id, order_index)
- diff_suggestions: (submission_id)
- submission_snippets: (submission_id, purpose)

## Setup Drizzle (proposta)

### Estrutura de arquivos
- src/db/client.ts (conexao pg + drizzle)
- src/db/schema.ts (tabelas e enums)
- drizzle.config.ts (drizzle-kit)

### Configuracoes
- DATABASE_URL no .env (ex: postgres://devroast:devroast@localhost:5432/devroast)
- Scripts pnpm:
  - "db:generate": drizzle-kit generate
  - "db:migrate": drizzle-kit migrate
  - "db:studio": drizzle-kit studio

## Docker Compose (Postgres)
Adicionar docker-compose.yml com service postgres:
- image: postgres:16
- env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- ports: "5432:5432"
- volume: devroast_pgdata

## Variaveis de ambiente
- DATABASE_URL
- AI_PROVIDER (ex: "vercel")
- AI_MODEL (ex: "gpt-4.1-mini")
- AI_API_KEY (segredo do provider)

## Drizzle config (drizzle.config.ts)
Campos esperados:
- dialect: "postgresql"
- schema: "src/db/schema.ts"
- out: "drizzle"
- dbCredentials: { connectionString: process.env.DATABASE_URL }

## Schema (src/db/schema.ts)
Deve conter:
- Enums: code_language, submission_status, issue_severity, snippet_purpose
- Tabelas: submissions, analysis_issues, diff_suggestions, submission_snippets
- Relacionamentos e indices descritos acima

## Migrations
- Gerar migrations iniciais com drizzle-kit
- Rodar migrations no startup local (via script)
- Versionar arquivos dentro de /drizzle

## Scripts npm
- "db:generate": drizzle-kit generate
- "db:migrate": drizzle-kit migrate
- "db:studio": drizzle-kit studio
- "db:push": drizzle-kit push (opcional, apenas dev)

## TODOs
- [ ] Definir quais linguagens entram no MVP (reduzir enum se necessario)
- [ ] Confirmar escala do score (0-10 vs 0-100) e padronizar
- [ ] Decidir se diff_suggestions sera 1:1 (unique submission_id)
- [ ] Criar schema Drizzle com enums e relacionamentos
- [ ] Adicionar drizzle.config.ts e scripts no package.json
- [ ] Criar docker-compose.yml e .env.example
- [ ] Rodar migrations iniciais e registrar no repo
- [ ] (Opcional) Seed simples para leaderboard
