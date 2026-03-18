# tRPC

## Estrutura
- Centralize a camada tRPC em `src/trpc` (`init.ts`, `router.ts`, `query-client.ts`, `client.tsx`, `server.ts`).
- Exponha `AppRouter` em `router.ts` e reutilize esse tipo no client.

## Integracao Next.js
- Use rota `app/api/trpc/[trpc]/route.ts` com `fetchRequestHandler`.
- Monte `TRPCReactProvider` no layout raiz para habilitar React Query + tRPC no app inteiro.

## Convencoes
- Prefira routers pequenos por dominio (`metrics`, etc.) e compose no `appRouter`.
- Para leitura de UI, use `queryOptions()` + `useQuery` no client.
- Quando uma procedure precisar de mais de uma query independente, use `await Promise.all` para executar em paralelo.
- Evite adicionar procedures fora do escopo da feature atual; implemente apenas o necessario.
