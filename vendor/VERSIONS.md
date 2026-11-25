# Programas de terceiros que chegam ao estudante

Copiados para cá para que o site não dependa de outro servidor: se um deles sai do ar, o livro continua funcionando, e nenhum deles fica sabendo de cada visita. Os arquivos vêm do `livro-base`, que é onde uma versão nova se confere primeiro (plano de migração de lá, seção "Versões"); para atualizar, copie de lá os arquivos da versão nova, mude a tabela e rode a verificação (`node tests/verificar-site.mjs`, nos dois modos). Não edite os arquivos.

| Programa | Versão | Licença | Arquivos usados | Origem |
|---|---|---|---|---|
| KaTeX | 0.19.1 | MIT (`katex/LICENSE`) | `katex.min.js`, `katex.min.css`, `fonts/*.woff2` | pacote npm `katex` |
| Atkinson Hyperlegible | fontsource 5.3.0 | SIL OFL 1.1 (`fonts/LICENSE-atkinson-hyperlegible.txt`) | latin 400 e 700, normal e itálico | pacote npm `@fontsource/atkinson-hyperlegible` |
| Source Serif 4 | fontsource 5.3.1 | SIL OFL 1.1 (`fonts/LICENSE-source-serif-4.txt`) | latin 600 e 700 | pacote npm `@fontsource/source-serif-4` |
| Bootstrap Icons, um recorte | 1.13.1 (a do Quarto 1.11.9) | MIT | `icons/bootstrap-icons-subset.woff2` | `bootstrap-icons.woff` da instalação do Quarto |

Quem lê cada um:

- **KaTeX:** `_quarto.yml` (`html-math-method` e `resources`, que copia a pasta para `docs/`) e o `_metadata.yml` de `capitulos/` e de `laboratorio/`, com o caminho a partir dessas pastas. As fórmulas do texto são desenhadas com o mesmo `katex.min.js` quando o site é gerado (`tools/prerender-math.ts`), e o verificador as confere com ele; o navegador só o recebe nas páginas com applet (`components/applet-comum.lua`). `applets-src/package.json` repete a versão, só para a página de desenvolvimento (`npm run dev`), e muda junto. Os applets usam `katex.render` e `katex.__defineMacro` (`components/applet-comum.lua`, para as macros), que não é uma função pública: numa versão nova, o verificador acusa erro se ela sumir.
- **Ícones:** `styles/page.scss` põe o recorte na frente da fonte inteira de ícones (176 KB) que o Quarto carrega; um ícone que não esteja nele ainda vem da fonte inteira, sem erro e sem aviso, e o ganho some. Ao usar um ícone novo, ou ao trocar a versão do Quarto, refazer o recorte e conferir na aba Rede do navegador que `bootstrap-icons.woff` não é pedido, também com a busca aberta e com resultados. Os ícones: `f461` `layout-text-sidebar-reverse` (o ícone do menu, no cabeçalho e na barra de tela estreita), `f12c` `arrow-left-short` e `f135` `arrow-right-short` (anterior e próximo, no pé), `f285` `chevron-right` (as partes do livro e as seções de cada capítulo, no menu), `f229` `caret-down-fill` (o Quarto o põe num menu sob um elemento largo), e os da busca: `f52a` `search`, `f3b1` `file-richtext` (cada resultado), `f290` `clipboard` e `f272` `check2` (copiar o link da busca), `f333` `exclamation-circle` (erro). Não é o arquivo do `livro-base`, que tem outra lista (com o ícone do painel de acessibilidade e sem o dos resultados da busca). Para refazer (com o `pyftsubset`, do pacote Python `fonttools`):

  ```bash
  pyftsubset /Applications/quarto/share/formats/html/bootstrap/dist/bootstrap-icons.woff \
    --flavor=woff2 --no-layout-closure --output-file=vendor/icons/bootstrap-icons-subset.woff2 \
    --unicodes="U+f461,U+f12c,U+f135,U+f285,U+f229,U+f52a,U+f3b1,U+f290,U+f272,U+f333"
  ```

- **Fontes:** `_brand.yml` (`source: file`). Só o recorte latino e só as faces que as páginas usam; uma face que falte (um itálico nos títulos, por exemplo) o navegador imita a partir das outras. Cada arquivo traz, por dentro, o aviso de copyright e o endereço da licença.

O JSXGraph não está aqui: ainda vem do pacote npm, dentro do bundle dos applets (`applets-src/`), até a fase 5 do plano de migração.
