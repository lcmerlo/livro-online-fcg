# AGENTS.md

Livro online de matemática interativa em Quarto (HTML publicado no GitHub Pages), com SCSS e applets JSXGraph próprios empacotados pelo Vite. O projeto está em fase de testes e tem um só autor, que decide o conteúdo e aprova as decisões técnicas, mas não avalia código: explique as consequências.

Este arquivo resume `_interno/diretrizes/diretrizes-tecnicas.md`. As diretrizes orientam sem engessar: um padrão muda quando outra solução mostra ganho real (§1.3), por decisão registrada. Responda em português do Brasil.

## Antes de mudar

- Leia o documento do assunto (mapa em `diretrizes-tecnicas.md`, §1.2).
- Mudanças que tocam muitos arquivos, ou que decidem algo novo, começam por diagnóstico e plano curto.
- Ao propor uma decisão técnica, diga em linguagem simples o problema, as opções, a recomendação, o que muda para o estudante, o custo de manutenção e como desfazer.
- Faça o necessário para resolver bem o problema, sem misturar melhorias que não foram pedidas.

## Prioridades

1. Corrigir erros reais.
2. Manter a legibilidade do livro e do código.
3. Evitar dependências desnecessárias.
4. Manter os applets em `applets-src/` e o texto nos capítulos.
5. Preservar a publicação no GitHub Pages.

## O que se pode mudar

| Tipo | Exemplos | O que fazer |
|---|---|---|
| Conteúdo matemático | enunciados, definições, demonstrações, resoluções, valores, fórmulas, contas dos applets, notação nova | propor; alterar só com aprovação do autor |
| Texto didático | explicações, instruções, perguntas, legendas, textos alternativos | propor; alterar só com aprovação do autor |
| Forma prevista nas diretrizes | macro no lugar da escrita à mão, erro evidente de digitação, link quebrado, classe ou shortcode no formato do guia | alterar e mostrar no diff |
| Técnica | código, estilos, configuração, verificações, documentação técnica | alterar dentro do plano combinado |
| Estrutura do livro | ordem e divisão de capítulos e tópicos, renomeação de capítulos e labels | só por decisão do autor |

Nomes públicos (arquivos de capítulo, labels, ids) ficam estáveis; para renomear um capítulo publicado, use `aliases` (`diretrizes-tecnicas.md`, §7).

## Applets

- Os applets são JSXGraph. Os applets GeoGebra são inspiração, não modelo: reescreva-os do zero em JSXGraph nativo, sem rastros do GeoGebra (nomes, ids, textos, cores, pixels, ordem de construção, funções de conversão).
- Expressões do GeoGebra usadas pelo autor num pedido são lidas pela intenção e escritas em JSXGraph. Imite o GeoGebra só se o autor pedir explicitamente.
- Garantias e ficha de aceitação: `diretrizes-tecnicas.md`, §4. Lista dos applets a reescrever: `_interno/diretrizes/pendencias.md`, §5.

## Decisões e consistência

- Uma decisão só está concluída quando todo o material está de acordo com ela: diretrizes, `README.md`, este arquivo, modelos, capítulos, componentes, estilos, applets e verificações. Procure o termo antigo com `git grep`. O que não der para ajustar agora vai para `pendencias.md`.
- Registre a decisão em `_interno/diretrizes/decisoes.md` (data, decisão, motivo, material ajustado).
- Dependências que chegam ao estudante só entram por decisão; ferramentas de desenvolvimento entram quando automatizam uma verificação útil (`diretrizes-tecnicas.md`, §3).
- Se uma orientação ou verificação atrapalha, proponha mudá-la; não a contorne.

## Ao terminar

- Verifique, quando possível:
  - `(cd applets-src && npm run build)`
  - `quarto render --to html`
  - `node tests/verificar-site.mjs`
  - `git diff`
- Mostre o diff: o resumo (arquivos e linhas) e os trechos relevantes; o diff completo quando pedido.
- Trabalhe em branch. Mensagens de commit curtas, no imperativo, com um assunto por commit.
