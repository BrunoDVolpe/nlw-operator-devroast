# Design: Open Graph dinamico para links de roast

**Data:** 2026-03-19  
**Status:** aprovado para planejamento  
**Escopo:** gerar imagem Open Graph automaticamente para `/roast/[id]`, usando Takumi como renderer principal e obrigatorio.

## 1. Objetivo

Garantir que todo link compartilhavel de resultado de roast tenha preview visual com identidade do Devroast, incluindo dados dinamicos do roast (`score`, `verdict`, `roastQuote`) e fallback seguro quando a geracao falhar.

## 2. Contexto atual

- O app usa Next.js App Router e hoje ja tem metadata estatico na rota de roast.
- Ainda nao existe `generateMetadata` dinamico com `og:image` por submission.
- O arquivo de design ativo no Pencil e `devroast.pen` com frame selecionado `Footer Hint` (`e1iw1`), definido como base visual para o card OG.
- Decisao do produto: usar Takumi como engine obrigatoria da imagem, com fallback para imagem OG padrao quando houver falha.

## 3. Requisitos funcionais

- Todo `/roast/[id]` deve expor `openGraph.images` e `twitter.images` apontando para uma imagem OG por roast.
- A imagem OG deve conter, de forma dinamica:
  - `score`
  - `verdict`
  - `roastQuote`
- O truncamento deve usar limite visual real do container OG (1200x630), com maximo de 2 linhas, preservando palavras quando possivel; em overflow, sufixar `...` na segunda linha.
- A arte base deve seguir o frame `Footer Hint` (`e1iw1`) adaptado para 1200x630.
- Em erro do Takumi (timeout, erro de rede, erro de render), responder imagem padrao de fallback.

## 4. Requisitos nao funcionais

- Cachear resposta da imagem para reduzir custo e latencia da primeira renderizacao.
- Garantir resposta valida para bots de social mesmo em cenario degradado.
- Evitar acoplamento de logica visual no componente da pagina de roast.
- Preservar compatibilidade com Open Graph e Twitter card.

## 5. Arquitetura proposta

### 5.1 Rota de metadata dinamica

- Migrar de `metadata` estatico para `generateMetadata` na rota `/roast/[id]`.
- Construir URL absoluta para `/roast/[id]/opengraph-image`.
- Preencher:
  - `openGraph.images`
  - `twitter.images`
  - `title` e `description` com contexto de roast.

Responsabilidade: apenas descrever o card social; sem render de imagem nessa camada.

### 5.2 Rota de imagem OG por roast

- Criar endpoint dedicado em `/roast/[id]/opengraph-image`.
- Fluxo da rota:
  1. Validar `id`.
  2. Buscar dados do roast no backend.
  3. Normalizar payload visual (`score`, `verdict`, `roastQuote`).
  4. Truncar `roastQuote` para 2 linhas com `...`.
  5. Renderizar imagem com Takumi.
  6. Aplicar headers de cache.
  7. Em falha, retornar imagem de fallback.

- Fonte de dados: a rota deve consumir um contrato unico e oficial de dados do roast no backend (via camada atual do app/tRPC), aplicando a normalizacao padrao desta spec quando qualquer campo opcional vier ausente.

### 5.3 Takumi adapter

- Criar camada fina para isolar o contrato com Takumi:
  - preparar template props
  - executar render
  - converter saida para `Response` de imagem
  - mapear erros tecnicos para erro de dominio (`og_render_failed`)
- Essa camada reduz impacto de mudancas de API da Takumi.

### 5.4 Fallback provider

- Fornecer uma imagem OG padrao da marca em caso de falha do Takumi.
- Fallback deve ter dimensao OG correta e identidade visual consistente.
- Fallback nao depende de dados dinamicos do roast para evitar nova fonte de falha.

## 6. Design visual (base Pencil)

- Fonte de referencia: frame `Footer Hint` (`e1iw1`) no `devroast.pen`.
- Adaptacao para OG:
  - canvas 1200x630
  - manter linguagem visual dark, tipografia mono e acento de marca
  - bloco de score com destaque hierarquico
  - verdict em badge/linha secundaria
  - quote em area principal com limite de 2 linhas
- Regra de seguranca visual: score e verdict nunca podem sumir por overflow da quote.

## 7. Contrato de dados

Entrada minima para render dinamico:

- `id: string`
- `score: number | null`
- `verdict: string | null`
- `roastQuote: string | null`

Normalizacao sugerida:

- `score`: fallback textual (`--`) quando ausente
- `verdict`: fallback (`pending_review` ou equivalente)
- `roastQuote`: fallback curto de marca quando ausente

## 8. Cache e entrega

- Estrategia: geracao sob demanda na primeira requisicao + cache HTTP.
- Headers esperados:
  - `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- Objetivo:
  - reduzir custo de render repetida
  - manter tempo de resposta previsivel para crawlers

## 9. Erros e resiliencia

Casos cobertos:

- Roast inexistente
- Roast sem dados finais prontos
- Timeout do Takumi
- Erro de render ou serializacao

Politica:

- Sempre responder uma imagem valida (dinamica ou fallback), evitando quebrar embed.
- Para qualquer falha (incluindo `id` invalido, roast inexistente ou dados incompletos), a rota `/roast/[id]/opengraph-image` retorna HTTP 200 com imagem fallback e `content-type` de imagem valido.
- Logar causa raiz para diagnostico sem expor detalhes sensiveis na resposta.

## 10. Observabilidade

Eventos e metricas:

- `og.render.success`
- `og.render.fallback`
- `og.render.error`

Campos minimos de log:

- `roastId`
- `requestId`
- `phase` (`fetch`, `normalize`, `render`, `fallback`)
- `durationMs`
- `errorType` (`timeout|network|render|fetch|unknown`)
- `errorCode` (quando aplicavel)

## 11. Testes

### 11.1 Unitarios

- Truncamento de quote em 2 linhas com `...`.
- Normalizacao de payload com dados ausentes.
- Mapeamento de erro do adapter Takumi para fallback.

### 11.2 Integracao

- `generateMetadata` inclui URL OG correta por `id`.
- Rota OG retorna `content-type` de imagem valido.
- Rota OG retorna `Cache-Control` esperado: `public, s-maxage=3600, stale-while-revalidate=86400`.
- `id` malformado retorna fallback com HTTP 200.
- Em erro forjado no Takumi, resposta cai no fallback.
- Fallback continua funcionando com Takumi indisponivel.

### 11.3 E2E leve

- Em `/roast/[id]`, validar presenca de metatags OG/Twitter com imagem por roast.

## 12. Fora de escopo

- Persistir imagem OG final no banco/storage na primeira geracao.
- Trocar engine de render para `next/og` ou outra alternativa.
- Variacoes de layout OG por tema, linguagem ou score range.

## 13. Criterios de aceite

- Todo link de `/roast/[id]` expoe imagem OG dinamica.
- O card contem `score + verdict + roastQuote` com truncamento em 2 linhas.
- Takumi e o renderer principal da imagem.
- Em falha de geracao, fallback padrao e retornado.
- Respostas de imagem sao cacheadas via HTTP para reduzir recomputacao.
