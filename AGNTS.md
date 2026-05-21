# AGENTS.md

Este projeto é um livro online de matemática interativa em Quarto,
com arquivos .qmd, SCSS, GitHub Pages, Vite e applets JSXGraph.

## Regras

- Faça mudanças mínimas e justificadas.
- Preserve a estrutura conceitual do livro.
- Não renomeie arquivos, pastas, labels ou referências sem necessidade.
- Não altere conteúdo matemático sem pedir revisão.
- Antes de modificar muitos arquivos, apresente diagnóstico e plano curto.
- Sempre mostre o diff das alterações.
- Quando possível, verifique com:
  - quarto render
  - npm run build
  - git diff

## Prioridades

1. Corrigir erros reais.
2. Manter legibilidade.
3. Evitar dependências desnecessárias.
4. Separar applets JSXGraph reutilizáveis de conteúdo textual.
5. Preservar compatibilidade com publicação no GitHub Pages.