# Editor com syntax highlight

## Objetivo
Criar um editor de codigo no Devroast que aplique syntax highlight automaticamente ao colar um trecho e permita selecionar a linguagem manualmente quando necessario.

## Requisitos funcionais
- Colar codigo e aplicar cores automaticamente.
- Detectar linguagem automaticamente (com fallback manual).
- Permitir trocar linguagem manualmente no editor.
- Manter numeracao de linhas e scroll sincronizado.
- Sem conexao com API neste momento.

## Requisitos nao funcionais
- Performance aceitavel com trechos curtos e medios.
- Acessibilidade basica (focus, tab, ARIA quando necessario).
- Integracao com nosso design system (tokens do Tailwind).

## Referencia: ray.so (raycast/ray-so)
Observacoes a partir do repositorio:
- Usa Next.js e React.
- Dependencias relevantes: `highlight.js` e `shiki`.
- Estrutura separa a experiencia de edicao (app/(navigation)/(code)).

Conclusao: o ray.so combina highlight rapido no cliente e rendering com Shiki para qualidade final. Podemos nos inspirar no fluxo (detectar linguagem, aplicar tema, permitir troca manual).

## Opcoes avaliadas

### Opcao A — CodeMirror 6 (recomendada)
**Pro**
- Editor completo e leve.
- Extensoes modulares (linguagens, line numbers, history, keymap).
- Controle total de tema e integracao com Tailwind.

**Contra**
- Precisa mapear linguagem detectada para extensao correta.
- Curva de configuracao maior.

### Opcao B — Monaco Editor
**Pro**
- UX muito semelhante a IDE.
- Linguagens prontas e boas features.

**Contra**
- Bundle pesado.
- Integracao visual mais trabalhosa.

### Opcao C — Textarea + highlight (Shiki/Prism)
**Pro**
- Simples de integrar com o layout atual.
- Bom para MVP rapido.

**Contra**
- Edicao limitada (sem features de editor real).
- Highlight depende de renderizacao separada.

## Recomendacao
Seguir com **CodeMirror 6** para edicao real e destacar com tema custom alinhado ao design. Usar `highlight.js` para detectar linguagem automaticamente no cliente, e mapear para a extensao correta do CodeMirror. Manter um seletor manual de linguagem como override.

## Especificacao tecnica (proposta)

### Deteccao de linguagem
- Ao colar ou editar, executar `highlight.js` (`highlightAuto`) em debounce.
- Se a confianca for baixa, manter linguagem atual.
- Mapear resultado para a extensao do CodeMirror (ex.: `javascript` -> `@codemirror/lang-javascript`).

### Selecionar linguagem manualmente
- Dropdown simples (ex.: Base UI Select ou componente proprio).
- Ao selecionar, desabilitar auto-detect ate o usuario reativar.

### Componentes (proposta)
- `CodeEditorRoot`
- `CodeEditorToolbar`
- `CodeEditorLanguageSelect`
- `CodeEditorArea`
- `CodeEditorFooter`

### Estado
- `code: string`
- `language: string | null`
- `languageMode: "auto" | "manual"`

### UX
- Placeholder com comentario (`// paste your code here...`).
- Manter line numbers e scroll sync.
- Sem highlight em tempo real para trechos muito longos (limite configuravel).

## Dependencias sugeridas
- `@codemirror/view`
- `@codemirror/state`
- `@codemirror/language`
- `@codemirror/lang-javascript`, `@codemirror/lang-python`, etc.
- `highlight.js` (para auto-detect)

## TODOs
- [ ] Definir linguagens suportadas no MVP.
- [ ] Definir politica de auto-detect (threshold de confianca).
- [ ] Escolher tema do CodeMirror alinhado ao design.
- [ ] Decidir se o fallback deve ser `plaintext` ou linguagem anterior.
- [ ] Validar performance com trechos longos.
- [ ] Implementar select de linguagem (manual override).
