# Registro de decisões

Uma linha por decisão: data, decisão, motivo. Mais recentes no fim.

| Data | Decisão | Motivo |
|---|---|---|
| 2026-10-04 | Material interno versionado em `_interno/` (`diretrizes/`, `rascunhos/`); descartáveis em `_scratch/` (não versionado) | `_scratch/` é ignorado pelo Git; `_interno/` é ignorado pelo render do Quarto e mantém o histórico |
| 2026-10-04 | Applets e iframes inseridos por shortcodes (`components/applet.lua`) | Acessibilidade padronizada (`title`, `loading`, link alternativo) e bundle JSXGraph carregado só onde há applet |
| 2026-10-04 | Blocos `.bloco-*` recebem rótulo visível (`components/blocos.lua`) | Informação não pode depender só da cor (§15, §32) |
| 2026-10-04 | Imagem sem `alt` é aviso, não erro, em `tests/verificar-site.mjs` | Figuras provisórias; passar a `--estrito` quando os `alt` forem escritos |
| 2026-10-04 | PDF não é meta atual; se vier a ser, usar Typst | Typst compilou o livro em ~5 s; LaTeX falha no tipo `exrr` sem `latex-env` |
| 2026-10-04 | Definições escritas como blocos `{#def-…}` (não como títulos `## Definição`) | Referência cruzada e forma já usada nos capítulos 1 a 5 |
| 2026-10-04 | Macros MathJax em `components/macros.html`: `\vet`, `\norm`, `\N`, `\Z`, `\Q`, `\R`, `\C` | Notação definida em um só lugar; evita erros como `\MATHBB` |
| 2026-10-04 | Proposições escritas como blocos `{#prp-…}`; referências por `@prp-…`; título com "Definição" ou "Proposição" passa a ser erro nos testes | Mesma razão das definições; numeração automática evita referências desatualizadas |
| 2026-10-04 | Capítulo 2 é a página-modelo; imagens com `fig-alt` e nomes descritivos; applets com texto de estado (`<id>-status`) | §37 do documento de Princípios; acessibilidade (§32) |
| 2026-10-08 | Blocos em quatro famílias visuais; abertura unificada ("Antes de começar"); exm/exr/exrr com estilo comum; dica como `callout-tip` colapsado | Reduzir carga cognitiva: função reconhecível pelo rótulo, sem código de cores (§7, §15, §23) |
| 2026-10-09 | `_interno/rascunhos/` renomeada para `_interno/oficina/`, com `protótipos/` (capítulos não publicados) e `testes/` (projeto Quarto com a configuração do livro) | O nome "rascunhos" não cobria testes nem a bibliografia inativa |
