# Instruções para o GitHub Copilot

Responda sempre em português do Brasil.

As orientações do projeto valem para todos os assistentes e estão resumidas em `AGENTS.md`, na raiz; o documento completo é `_interno/diretrizes/diretrizes-tecnicas.md`. Este arquivo acrescenta o que é próprio do Copilot.

Neste repositório, atue sobre a parte de software do projeto: JavaScript, JSXGraph, CSS, SCSS, HTML, JSON e arquivos de configuração (não há etapa de compilação: `src/` e `applets/` são servidos como estão). O Copilot fica desligado nos arquivos de texto (`.vscode/settings.json`).

Não sugira alterações de conteúdo matemático, texto didático, capítulos `.qmd`, arquivos Markdown narrativos ou LaTeX, salvo pedido explícito. Quando houver pedido, siga os tipos de mudança do `AGENTS.md`. Nos capítulos antigos, guardados como modelo em `_interno/oficina/nao-publicados/`, não sugira correções de forma.

Os applets são JSXGraph próprios. Um applet GeoGebra é só inspiração: escreva o código em JSXGraph nativo, sem rastros do GeoGebra, salvo pedido explícito para imitá-lo.

Priorize minimalismo pragmático: soluções simples, modulares, legíveis e fáceis de manter.

Ao escolher entre código puro e biblioteca externa:

- Use código puro quando a solução nativa for clara, curta e sustentável.
- Recomende ferramenta ou biblioteca quando ela reduzir complexidade, bugs ou manutenção futura. Biblioteca que chega ao navegador do estudante só entra por decisão do autor.
- Justifique brevemente a escolha com: “Optei por código puro porque...” ou “Optei por ferramenta porque...”.

Nomes públicos (ids, labels, classes e shortcodes usados nos capítulos, funções exportadas) ficam estáveis; renomear exige plano e o ajuste de todas as referências.

As regras das diretrizes são fundamentais (uma lista curta, que não se contorna) ou provisórias (siga ou explique); ver `AGENTS.md`.

Quando sugerir mudanças relevantes, indique como testar:

- `node --test "tests/unit/*.test.mjs"`, quando a mudança afetar `src/math/` ou as cores
- `quarto preview --profile lab`, com os applets das páginas de teste de `laboratorio/`
- `node tests/check-site.mjs`, depois de `quarto render --to html`
- `node tests/check-site.mjs --lab`, depois de `quarto render --profile lab --to html`, quando a mudança afetar as páginas de teste de `laboratorio/`
- `(cd tests && npm ci && node browser.mjs)`, depois do render do laboratório, quando a mudança afetar os applets, os estilos ou `src/`
