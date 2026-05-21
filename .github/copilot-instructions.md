# Instruções para o GitHub Copilot

Neste repositório, atue apenas sobre a parte de software do projeto: JavaScript, JSXGraph, Vite, CSS, SCSS, HTML, JSON e arquivos relacionados a build/configuração.

Não sugira alterações de conteúdo matemático, texto didático, capítulos `.qmd`, arquivos Markdown narrativos ou LaTeX, salvo pedido explícito.

Priorize minimalismo pragmático: soluções simples, modulares, legíveis e fáceis de manter.

Ao escolher entre código puro e biblioteca externa:

- Use código puro quando a solução nativa for clara, curta e sustentável.
- Recomende ferramenta ou biblioteca quando ela reduzir complexidade, bugs ou manutenção futura.
- Justifique brevemente a escolha com: “Optei por código puro porque...” ou “Optei por ferramenta porque...”.

Preserve a estrutura atual do projeto. Não renomeie arquivos, pastas, ids, labels ou funções públicas sem necessidade.

Quando sugerir mudanças relevantes, indique como testar:

- `npm run dev`
- `npm run build`
- `quarto preview`, apenas quando a mudança afetar a integração com o livro
