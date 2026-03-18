# Devroast

## Projeto
- App web do Devroast: cole seu codigo e receba uma analise direta.
- UI focada em experiencia escura, tipografia monoespacada e feedback rapido.

## Padroes globais
- Tailwind v4 com tokens em @theme (sem CSS vars diretas nos componentes).
- Componentes UI em src/components/ui usando composicao (Root/Label/Title).
- Named exports apenas.
- Documentacao interna e specs em portugues-BR (termos tecnicos em ingles quando fizer sentido).
- Toda nova feature com impacto relevante deve nascer em `specs/<feature>.md` antes da implementacao.
- API/back-end do app usa tRPC com Next.js App Router.
