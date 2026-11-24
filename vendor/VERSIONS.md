# Programas de terceiros que chegam ao estudante

Copiados para cá para que o site não dependa de outro servidor: se um deles sai do ar, o livro continua funcionando, e nenhum deles fica sabendo de cada visita. Os arquivos vêm do `livro-base`, que é onde uma versão nova se confere primeiro (plano de migração de lá, seção "Versões"); para atualizar, copie de lá os arquivos da versão nova, mude a tabela e rode a verificação (`node tests/verificar-site.mjs`, nos dois modos). Não edite os arquivos.

| Programa | Versão | Licença | Arquivos usados | Origem |
|---|---|---|---|---|
| KaTeX | 0.19.1 | MIT (`katex/LICENSE`) | `katex.min.js`, `katex.min.css`, `fonts/*.woff2` | pacote npm `katex` |
| Atkinson Hyperlegible | fontsource 5.3.0 | SIL OFL 1.1 (`fonts/LICENSE-atkinson-hyperlegible.txt`) | latin 400 e 700, normal e itálico | pacote npm `@fontsource/atkinson-hyperlegible` |
| Source Serif 4 | fontsource 5.3.1 | SIL OFL 1.1 (`fonts/LICENSE-source-serif-4.txt`) | latin 600 e 700 | pacote npm `@fontsource/source-serif-4` |

Quem lê cada um:

- **KaTeX:** `_quarto.yml` (`html-math-method` e `resources`, que copia a pasta para `docs/`) e o `_metadata.yml` de `capitulos/` e de `laboratorio/`, com o caminho a partir dessas pastas. O verificador desenha as fórmulas com o mesmo `katex.min.js`. `applets-src/package.json` repete a versão, só para a página de desenvolvimento (`npm run dev`), e muda junto. Os applets usam `katex.render` e `katex.__defineMacro` (`components/macros.html`), que não é uma função pública: numa versão nova, o verificador acusa erro se ela sumir.
- **Fontes:** `_brand.yml` (`source: file`). Só o recorte latino e só as faces que as páginas usam; uma face que falte (um itálico nos títulos, por exemplo) o navegador imita a partir das outras. Cada arquivo traz, por dentro, o aviso de copyright e o endereço da licença.

O JSXGraph não está aqui: ainda vem do pacote npm, dentro do bundle dos applets (`applets-src/`), até a fase 5 do plano de migração.
