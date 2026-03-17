# tRPC no Next.js

## Objetivo
Criar a camada tipada de API/back-end do Devroast com tRPC, integrada ao Next.js App Router, SSR e Server Components.

## Contexto
- O projeto usa Next.js e ainda nao tem uma API propria.
- Vamos usar tRPC como fonte unica de tipagem para queries e mutations.
- A integracao precisa funcionar bem com Server Components, prefetch no server e hydrate no client.

## Referencia
- `https://trpc.io/docs/client/tanstack-react-query/setup`
- `https://trpc.io/docs/client/tanstack-react-query/server-components`

## Requisitos funcionais
- Expor procedures tipadas para leitura e escrita.
- Integrar com `App Router` e rota `/api/trpc`.
- Permitir uso em Client Components com React Query.
- Permitir prefetch e hidratacao em Server Components.
- Permitir acesso direto no server quando nao for necessario hidratar no client.

## Requisitos nao funcionais
- Manter separacao clara entre codigo server-only e client-only.
- Criar `QueryClient` por request no server.
- Evitar refetch imediato no client com `staleTime` minimo.

## Especificacao tecnica (proposta)

### Estrutura
- `src/trpc/init.ts`
- `src/trpc/router.ts`
- `src/trpc/query-client.ts`
- `src/trpc/client.tsx`
- `src/trpc/server.ts`
- `app/api/trpc/[trpc]/route.ts`
- `app/layout.tsx`

### Backend
- Criar `createTRPCContext` com `cache()`.
- Inicializar `initTRPC` e exportar `createTRPCRouter` e `baseProcedure`.
- Expor `appRouter` como base da API e `AppRouter` como tipo publico.
- Usar `fetchRequestHandler` na rota do Next.

### Client
- Criar `TRPCReactProvider` com `QueryClientProvider` + `TRPCProvider`.
- Expor `useTRPC` para `queryOptions` e `mutationOptions`.
- Reusar `QueryClient` no browser e criar um novo no server.

### Server Components
- Criar `trpc` via `createTRPCOptionsProxy`.
- Expor `getQueryClient()` com `cache(makeQueryClient)`.
- Usar `prefetch` + `HydrationBoundary` quando o dado precisar chegar no client.
- Usar `caller` quando o dado for consumido somente no server.

### Configuracao
- Adicionar `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `client-only`, `server-only`.
- Se necessario, avaliar `superjson` depois.

## TODOs
- [ ] Definir formato final do router base.
- [ ] Criar estrutura inicial em `src/trpc`.
- [ ] Montar provider no `app/layout.tsx`.
- [ ] Validar prefetch e hydrate em uma tela simples.
- [ ] Criar um exemplo de query e mutation para servir de padrao.
