
# Design Spec: Code Roast Feature

Data: 2026-03-19

## 1. Visão Geral

Este documento descreve o design da funcionalidade principal de "roast" de código, que permite aos usuários submeter trechos de código para análise por IA. A funcionalidade inclui um "roast mode" para feedback mais sarcástico. O fluxo principal do usuário envolve a submissão de código na página inicial e o redirecionamento para uma página de resultados dedicada.

## 2. Design do Frontend (`HomeEditorSection`)

- **Componente:** A interação principal ocorrerá dentro da `HomeEditorSection` existente na página inicial.
- **Gerenciamento de Estado:**
  - Hooks do React (`useState`) gerenciarão o conteúdo do editor, a linguagem de programação selecionada e o estado do toggle "Roast Mode".
- **Lógica de Submissão:**
  - Um hook `useMutation` do tRPC irá lidar com o processo de submissão.
  - O botão "Roast my code" será desabilitado e exibirá um indicador de carregamento (estado `isLoading` do hook da mutation) durante a submissão para evitar múltiplos cliques.
  - Em uma mutation bem-sucedida, o backend retornará um `submissionId` único. O cliente então usará o `useRouter` do `next/navigation` para redirecionar o usuário para `/roast/[submissionId]`.
  - Em caso de falha, uma notificação (toast) informará o usuário sobre o erro.

## 3. Design do Backend (tRPC)

- **Arquitetura:** O backend usará um novo roteador tRPC, `submissionRouter`, para lidar com toda a lógica relacionada a submissões de código. O processo é projetado para ser assíncrono para fornecer uma resposta rápida ao usuário.
- **tRPC Mutation (`submission.create`):**
  - **Entrada:** A mutation aceitará um objeto contendo `code` (string), `language` (enum), e `roastMode` (boolean). A entrada será validada usando `zod`.
  - **Fluxo Síncrono:**
    1. Receber os dados validados do cliente.
    2. Criar um novo registro na tabela do banco de dados `submissions` com os dados fornecidos e um `status` padrão de `'pending'`.
    3. Retornar imediatamente o `id` recém-gerado do registro de submissão para o cliente.
- **Processamento Assíncrono:**
  - Após a inserção inicial no banco de dados, uma tarefa em segundo plano será acionada (por exemplo, uma função assíncrona "fire-and-forget").
  - Esta tarefa irá:
    1. Buscar os detalhes da submissão do banco de dados usando o `id`.
    2. Fazer uma chamada de API para o serviço de IA, passando o código e a preferência de roast.
    3. Processar a resposta da IA para extrair a pontuação, resumo, problemas e sugestões de diff.
    4. Atualizar o registro da submissão no banco de dados, definindo o `status` como `'processed'` e populando os campos de resultado (`score`, `roastSummary`, etc.).
  - **Tratamento de Erros:** Se a chamada da IA ou o processamento de dados falhar, o `status` da submissão será atualizado para `'failed'`, e o erro será registrado (log) para depuração.

## 4. Página de Resultados (`/roast/[id]`)

- **Tipo de Componente:** Será um Server Component do Next.js para permitir a busca de dados direta e segura no servidor.
- **Busca de Dados:**
  - A página extrairá o `id` dos parâmetros da URL.
  - Usará uma query tRPC para buscar o registro da submissão do banco de dados.
- **Manuseio de Estado (`status`):**
  - **Pendente:** Se a submissão buscada tiver um `status` de `'pending'`, a página renderizará um estado de carregamento. Para lidar com a natureza assíncrona da análise, a página implementará um mecanismo de polling. Um componente do lado do cliente irá buscar novamente os dados periodicamente (a cada 3 segundos) até que o status mude.
  - **Processado:** Assim que o `status` for `'processed'`, a página renderizará os resultados completos da análise usando componentes de UI existentes (`ScoreRing`, `DiffLine`, `CodeBlock`, etc.).
  - **Falhou:** Se o `status` for `'failed'`, uma mensagem de erro amigável será exibida.
  - **Não Encontrado:** Se nenhuma submissão corresponder ao `id`, uma página 404 será renderizada.
