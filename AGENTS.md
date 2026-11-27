# AGENTS.md

Livro online de matemática interativa em Quarto (HTML publicado no GitHub Pages), com SCSS e applets JSXGraph próprios, sem etapa de compilação (os arquivos de `src/` e `applets/` são servidos como estão). O projeto está em fase de testes e tem um só autor, que decide o conteúdo e aprova as decisões técnicas, mas não avalia código: explique as consequências.

Este arquivo resume `_interno/diretrizes/diretrizes-tecnicas.md` (as diretrizes). Responda em português do Brasil.

## Como as regras valem

- **Fundamentais:** uma lista curta (diretrizes, §1.3). Ninguém faz diferente sem decisão do autor. Se uma delas atrapalha, proponha mudá-la; não a contorne.
- **Provisórias:** todo o resto, pela regra "siga ou explique". Vale por padrão; se atrapalhar o que foi pedido, faça diferente e explique o porquê no commit e na resposta. Um desvio que se repete vira proposta de mudar a regra.
- **Código que funciona:** não mexa sem pedido, a menos que a mudança mostre ganho real (diretrizes, §1.6).
- As diretrizes dizem o quê e o porquê; o como (medidas, nomes de funções, valores) fica no código, e o `arquitetura.md` diz onde. Não acrescente detalhes de implementação às diretrizes.

## Os capítulos antigos

Os 20 capítulos de antes da reescrita estão em `_interno/oficina/nao-publicados/`, fora do livro, como modelo: não aponte nem corrija desvios neles, e não os leve a revisões ou a `pendencias.md` (diretrizes, §1.4). A linha `estado: prototipo` do cabeçalho deles é de antes e não tem mais efeito. Os capítulos novos, em `capitulos/`, seguem as diretrizes desde o primeiro rascunho.

## Antes de mudar

- Leia o documento do assunto (mapa em `diretrizes-tecnicas.md`, §1.5).
- Mudanças que tocam muitos arquivos, ou que decidem algo novo, começam por diagnóstico e plano curto.
- Ao propor uma decisão técnica, diga em linguagem simples o problema, as opções, a recomendação, o que muda para o estudante, o custo de manutenção e como desfazer.
- Faça o necessário para resolver bem o problema, sem misturar melhorias que não foram pedidas.

## Prioridades

1. Corrigir erros reais.
2. Manter a legibilidade do livro e do código.
3. Evitar dependências desnecessárias.
4. Manter os applets em `applets/` (um arquivo por applet) e o texto nos capítulos.
5. Preservar a publicação no GitHub Pages.

## O que se pode mudar

| Tipo | Exemplos | O que fazer |
|---|---|---|
| Conteúdo matemático | enunciados, definições, demonstrações, resoluções, valores, fórmulas, contas dos applets, notação nova | propor; alterar só com aprovação do autor |
| Texto didático | explicações, instruções, perguntas, legendas, textos alternativos | propor; alterar só com aprovação do autor |
| Forma prevista nas diretrizes | macro no lugar da escrita à mão, erro evidente de digitação, link quebrado, classe ou bloco no formato do guia | num capítulo, alterar e mostrar no diff; nos capítulos antigos, não |
| Técnica | código, estilos, configuração, verificações, documentação técnica | alterar dentro do plano combinado |
| Estrutura do livro | ordem e divisão de capítulos e tópicos, renomeação de capítulos e labels | só por decisão do autor |

Nomes públicos (arquivos de capítulo, labels, ids) ficam estáveis a partir da divulgação; para renomear um capítulo publicado, use `aliases` (`diretrizes-tecnicas.md`, §7).

## Applets

- Os applets são JSXGraph. Os applets GeoGebra são inspiração, não modelo: reescreva-os do zero em JSXGraph nativo, sem rastros do GeoGebra (nomes, ids, textos, cores, pixels, ordem de construção, funções de conversão).
- Expressões do GeoGebra usadas pelo autor num pedido são lidas pela intenção e escritas em JSXGraph. Imite o GeoGebra só se o autor pedir explicitamente.
- Um applet é um arquivo de `applets/`, escrito com o que `src/applet/` e `src/elements/` dão prontos (o sistema do `livro-base`, desde a fase 5 da migração); no capítulo, `::: {.applet name="..." spoken="..."}` (`guia-editorial.md`, §6).
- Garantias e ficha de aceitação: `diretrizes-tecnicas.md`, §4. Lista dos applets a reescrever: `_interno/diretrizes/pendencias.md`, §5.

## Decisões e consistência

- Uma decisão só está concluída quando todo o material está de acordo com ela: diretrizes, `README.md`, este arquivo, modelos, capítulos, componentes, estilos, applets e verificações; os capítulos antigos ficam como estão. Procure o termo antigo com `git grep`. O que não der para ajustar agora vai para `pendencias.md`.
- Registre a decisão em `_interno/diretrizes/decisoes.md` (data, decisão, motivo, material ajustado). Trocar um valor ou uma técnica sem mudar uma regra não precisa de registro: basta o commit.
- Dependências que chegam ao estudante só entram por decisão; ferramentas de desenvolvimento entram quando automatizam uma verificação útil (`diretrizes-tecnicas.md`, §3).

## Ao terminar

- Verifique, quando possível:
  - `node --test "tests/unit/*.test.mjs"`
  - `quarto render --to html`
  - `node tests/check-site.mjs`
  - `quarto render --profile lab --to html` e `node tests/check-site.mjs --lab` (o laboratório, em `docs-lab/`)
  - numa mudança de applet, estilo ou `src/`: `(cd tests && npm ci && node browser.mjs)`, que lê `docs-lab/` (alguns minutos; não edite nada enquanto roda)
  - `git diff`
- Mostre o diff: o resumo (arquivos e linhas) e os trechos relevantes; o diff completo quando pedido.
- Trabalhe em branch. Mensagens de commit curtas, no imperativo, com um assunto por commit.
