# Registro de decisões

Uma linha por decisão: data, decisão, motivo. Mais recentes no fim.

| Data | Decisão | Motivo |
|---|---|---|
| 2026-10-04 | Material interno versionado em `_interno/` (`diretrizes/`, `rascunhos/`); descartáveis em `_scratch/` (não versionado) | `_scratch/` é ignorado pelo Git; `_interno/` é ignorado pelo render do Quarto e mantém o histórico |
| 2026-10-04 | Applets e iframes inseridos por shortcodes (`components/applet.lua`) | Acessibilidade padronizada (`title`, `loading`, link alternativo) e bundle JSXGraph carregado só onde há applet |
| 2026-10-04 | Blocos `.bloco-*` recebem rótulo visível (`components/blocos.lua`) | Informação não pode depender só da cor (§15, §33) |
| 2026-10-04 | Imagem sem `alt` é aviso, não erro, em `tests/verificar-site.mjs` | Figuras provisórias; passar a `--estrito` quando os `alt` forem escritos |
| 2026-10-04 | PDF não é meta atual; se vier a ser, usar Typst | Typst compilou o livro em ~5 s; LaTeX falha no tipo `exrr` sem `latex-env` |
| 2026-10-04 | Definições escritas como blocos `{#def-…}` (não como títulos `## Definição`) | Referência cruzada e forma já usada nos capítulos 1 a 5 |
| 2026-10-04 | Macros MathJax em `components/macros.html`: `\vet`, `\norm`, `\N`, `\Z`, `\Q`, `\R`, `\C` | Notação definida em um só lugar; evita erros como `\MATHBB` |
