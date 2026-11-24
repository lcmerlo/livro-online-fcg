# AGENTS.md

Livro online de matemática interativa em Quarto (HTML publicado no GitHub Pages), com SCSS e applets JSXGraph próprios empacotados pelo Vite. O projeto está em fase de testes e tem um só autor, que decide o conteúdo e aprova as decisões técnicas, mas não avalia código: explique as consequências.

Este arquivo resume `_interno/diretrizes/diretrizes-tecnicas.md` (as diretrizes). Responda em português do Brasil.

## Como as regras valem

- **Fundamentais:** uma lista curta (diretrizes, §1.3). Ninguém faz diferente sem decisão do autor. Se uma delas atrapalha, proponha mudá-la; não a contorne.
- **Provisórias:** todo o resto, pela regra "siga ou explique". Vale por padrão; se atrapalhar o que foi pedido, faça diferente e explique o porquê no commit e na resposta. Um desvio que se repete vira proposta de mudar a regra.
- **Código que funciona:** não mexa sem pedido, a menos que a mudança mostre ganho real (diretrizes, §1.6).
- As diretrizes dizem o quê e o porquê; o como (medidas, nomes de funções, valores) fica no código, e o `arquitetura.md` diz onde. Não acrescente detalhes de implementação às diretrizes.

## Protótipos

Os capítulos com `estado: prototipo` no cabeçalho dão uma ideia do livro e serão reescritos. Num protótipo, não aponte nem corrija desvios das diretrizes, e não os leve a revisões ou a `pendencias.md`. Mexa nele só a pedido do autor ou quando for necessário para o site renderizar e o verificador passar sem erros. As diretrizes valem por inteiro quando o capítulo passa a `estado: revisado` (diretrizes, §1.4).

## Antes de mudar

- Leia o documento do assunto (mapa em `diretrizes-tecnicas.md`, §1.5).
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
| Forma prevista nas diretrizes | macro no lugar da escrita à mão, erro evidente de digitação, link quebrado, classe ou shortcode no formato do guia | num capítulo revisado, alterar e mostrar no diff; num protótipo, não |
| Técnica | código, estilos, configuração, verificações, documentação técnica | alterar dentro do plano combinado |
| Estrutura do livro | ordem e divisão de capítulos e tópicos, renomeação de capítulos e labels | só por decisão do autor |

Nomes públicos (arquivos de capítulo, labels, ids) ficam estáveis a partir da divulgação; para renomear um capítulo publicado, use `aliases` (`diretrizes-tecnicas.md`, §7).

## Applets

- Os applets são JSXGraph. Os applets GeoGebra são inspiração, não modelo: reescreva-os do zero em JSXGraph nativo, sem rastros do GeoGebra (nomes, ids, textos, cores, pixels, ordem de construção, funções de conversão).
- Expressões do GeoGebra usadas pelo autor num pedido são lidas pela intenção e escritas em JSXGraph. Imite o GeoGebra só se o autor pedir explicitamente.
- Garantias e ficha de aceitação: `diretrizes-tecnicas.md`, §4. Lista dos applets a reescrever: `_interno/diretrizes/pendencias.md`, §5.

## Decisões e consistência

- Uma decisão só está concluída quando todo o material está de acordo com ela: diretrizes, `README.md`, este arquivo, modelos, capítulos revisados, componentes, estilos, applets e verificações. Nos protótipos, só o necessário para o site funcionar. Procure o termo antigo com `git grep`. O que não der para ajustar agora vai para `pendencias.md`.
- Registre a decisão em `_interno/diretrizes/decisoes.md` (data, decisão, motivo, material ajustado). Trocar um valor ou uma técnica sem mudar uma regra não precisa de registro: basta o commit.
- Dependências que chegam ao estudante só entram por decisão; ferramentas de desenvolvimento entram quando automatizam uma verificação útil (`diretrizes-tecnicas.md`, §3).

## Ao terminar

- Verifique, quando possível:
  - `(cd applets-src && npm run build)`
  - `quarto render --to html`
  - `node tests/verificar-site.mjs`
  - `quarto render --profile lab --to html` e `node tests/verificar-site.mjs --lab` (o laboratório, em `docs-lab/`)
  - `git diff`
- Mostre o diff: o resumo (arquivos e linhas) e os trechos relevantes; o diff completo quando pedido.
- Trabalhe em branch. Mensagens de commit curtas, no imperativo, com um assunto por commit.
