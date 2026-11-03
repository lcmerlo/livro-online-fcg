# Guia editorial

Guia curto para quem escreve ou revisa capítulos. A justificativa de cada orientação está em `Princípios e Especificações Operacionais-26-10-03.md` (§ entre parênteses); o desenvolvimento técnico (applets, código, verificação) está em `diretrizes-tecnicas.md`.

As orientações deste guia são padrões: valem até que outra forma se mostre melhor e mudam por decisão registrada (`diretrizes-tecnicas.md`, §1 e §2). Quando o guia diverge de outro documento, a divergência é um defeito a corrigir; o que fazer até lá está no §1.2 das diretrizes técnicas.

## 1. Estrutura de um tópico (§5, §22)

Um tópico trata **uma ideia principal**. A ordem e a presença dos componentes variam com o conteúdo; não preencher componente só para completar a lista.

- **Núcleo (no fluxo principal):** objetivo, pré-requisitos (se necessários), ideia central, uma ou mais representações, exemplo, prática ou verificação.
- **Apoio (quando ajudar):** erro comum, nota de notação, interpretação geométrica, segundo exemplo, applet, dica.
- **Complementar (fora do fluxo ou expansível):** remediação, demonstração detalhada, aprofundamento, desafio.

A lista de dez itens do `README.md` e do `index.qmd` é um repertório, não um roteiro obrigatório.

## 2. Títulos

- Um `#` por arquivo, o título do capítulo. Seções de capítulo com `##`, subseções com `###`. Sem saltos de nível.
- Títulos, arquivos, labels (`{#def-…}`, `{#fig-…}`) e IDs são âncoras e URLs (§26): manter estáveis. Para renomear um capítulo publicado sem quebrar o endereço antigo, usar `aliases` (`diretrizes-tecnicas.md`, §7).

## 3. Componentes

Use as classes e shortcodes, sem formatar à mão (§23, §35).

| Para | Use |
|---|---|
| Objetivo, pré-requisitos, interação, erro comum, checkpoint | `::: {.bloco-objetivo}` … `:::` (também `-pre-requisitos`, `-interacao`, `-erro`, `-checkpoint`). O rótulo visível é inserido automaticamente por `components/blocos.lua`. |
| Applet JSXGraph próprio | `{{< applet segmento id="jxg-segmento-1" rotulo="Descrição para leitor de tela" >}}` |
| Applet GeoGebra (provisório) | `{{< geogebra f2zqppmu titulo="Applet GeoGebra: descrição específica" >}}`, só nos capítulos que ainda não têm a versão JSXGraph; em conteúdo novo, só por decisão do autor (`diretrizes-tecnicas.md`, §4) |
| Definição | `::: {#def-nome}` … `:::` (padrão adotado; ver abaixo) |
| Proposição | `::: {#prp-nome}` … `:::` (ver abaixo) |
| Exemplo | `::: {#exm-nome}` … `:::` |
| Exercício / exercício resolvido | `::: {#exr-nome}` / `::: {#exrr-nome}`, com `.dica` e `.solucao` opcionais dentro, após o enunciado |
| Dica, resolução, resposta | `::: {.dica}`, `::: {.solucao}`, `::: {.resposta}` dentro de `#exm`, `#exr`, `#exrr` ou `.bloco-checkpoint`: viram abas recolhíveis "Dica", "Resolução", "Resposta", numeradas quando há mais de uma do mesmo tipo (gerado por `components/blocos.lua`) |
| Figura com legenda | `::: {.fig-leg #fig-nome}` (largura opcional: `.w30` … `.w80`) |

**Uso dos componentes (08/10/2026).** Ver as quatro famílias visuais no §23 dos Princípios.

- Abertura: `.bloco-objetivo` (uma ou duas frases) seguido imediatamente de `.bloco-pre-requisitos` (lista curta, com links de revisão); os dois aparecem como um só bloco, com os rótulos "Objetivo" e "Antes de começar".
- Interação (`.bloco-interacao`): orientações e o shortcode do applet; o shortcode gera sozinho o quadro `.bloco-applet`, que não se escreve à mão. Instrução imediatamente antes, poucos controles e uma pergunta de observação logo depois. Sem callouts dentro do bloco.
- Erro comum: sempre aberto; apresentar o equívoco e a correção.
- Checkpoint: uma pergunta conceitual breve (até três itens) com resposta colapsada. Diagnostica a compreensão; não é exercício e não recebe `{#exr-…}`.
- Dicas, respostas e resoluções ficam fechadas: só se abrem por ação do estudante.

Dicas e resoluções ficam dentro do exercício (ou exemplo), depois do enunciado, separadas por linhas em branco. Divs `.dica`, `.solucao` e `.resposta` consecutivas formam um só conjunto de abas, na ordem Dica, Resolução, Resposta; abas do mesmo tipo são numeradas ("Dica 1", "Dica 2").

```markdown
::: {#exrr-nome}
Enunciado.

::: {.dica}
…
:::

::: {.solucao}
…
:::
:::
```

No checkpoint:

```markdown
::: {.bloco-checkpoint}
Pergunta.

::: {.resposta}
**Resposta correta: (B).** …
:::
:::
```

**Definições e proposições (04/10/2026).** Usam blocos com referência cruzada, nunca títulos:

```markdown
::: {#def-vetor-nulo}
## Vetor nulo

O **vetor nulo** é …
:::

::: {#prp-formula-distancia-ponto-reta}
## Fórmula da distância entre ponto e reta

Se $P=(x_0,y_0)$ e $r:ax+by+c=0$, então …
:::

Pela @prp-formula-distancia-ponto-reta, temos …
```

- O título (`## …`, primeira linha do bloco) é opcional; use-o só quando nomear o resultado ajuda.
- O bloco contém o enunciado. Demonstração ("De fato…"), exemplos e observações ficam depois dele.
- Referir-se a um resultado sempre com `@def-…` ou `@prp-…`, não com "Proposição 1" digitado, pois a numeração é automática (ex.: "Proposição 18.2").
- `tests/verificar-site.mjs` acusa erro se um título começar com "Definição" ou "Proposição".

## 4. Matemática (§27)

- Fórmulas são texto (LaTeX), nunca imagem.
- Números: ponto decimal e vírgula entre coordenadas, como `$x = 1.5$` e `$A = (2.5, 3)$`. Convenção provisória, a reavaliar (`pendencias.md`, §2).
- Vetor, por enquanto com dois comandos: `\vec{u}` quando o nome tem uma só letra; `\vet{AB}` (tabela abaixo) quando o nome é formado por dois pontos, como `AB` ou `P_0P`. A busca por um comando único está em `pendencias.md`, §2.
- Implicações: `\Rightarrow`, `\Leftrightarrow`. Paralelo e perpendicular: `\parallel`, `\perp`.
- **Macros** (definidas em `components/macros.html` e válidas em todas as páginas HTML):

  | Escrever | Resulta em | Uso |
  |---|---|---|
  | `\vet{AB}` | `\overset{\rightarrow}{AB}` | vetor representado pelo segmento orientado `AB` |
  | `\norm{\vec{u}}` | `\lVert \vec{u} \rVert` | norma |
  | `\N`, `\Z`, `\Q`, `\R`, `\C` | `\mathbb{N}` … `\mathbb{C}` | conjuntos numéricos |

  A notação é definida num só lugar: para alterá-la em todo o livro, edite `components/macros.html`. As macros não valem em PDF/Typst; se o livro passar a ter PDF ou trocar de motor de fórmulas, a definição deve continuar única (`diretrizes-tecnicas.md`, §5).
- Cor não pode ser o único modo de distinguir termos em uma fórmula: se usar `\color`, indicar o sentido também no texto. Cores hexadecimais são escritas com `#`: `\color{#993300}`. No MathJax do site, `\color{993300}` não aplica cor e `\color[HTML]{993300}` produz erro (testado em 04/10/2026).
- Os capítulos já usam as macros (os protótipos ainda não: `pendencias.md`, §4); não escrever `\overrightarrow`, `\vec{AB}`, `\lVert`, `\|…\|` ou `\mathbb{R}` à mão.
- Introduzir a notação antes de usá-la com frequência.
- Alterações de conteúdo matemático e de texto didático só entram com a aprovação do autor responsável. O que conta como cada tipo de mudança está em `diretrizes-tecnicas.md`, §9.

## 5. Imagens (§28)

- Pasta e nome: `assets/img/<arquivo-do-capítulo>/<nome-descritivo>.svg` (ou `.png`). Evitar `Untitled.png` e nomes gerados por ferramentas.
- Preferir SVG para diagramas.
- Toda imagem informativa tem texto alternativo (`fig-alt`) que diga **o que ela mostra para a aprendizagem**, não apenas "Figura". O texto entre colchetes **não** é o alt: no Quarto ele vira legenda.

  ```markdown
  ::: {.fig-leg #fig-segmentos}
  ![](../assets/img/segmentos/segmento-ab-reta-suporte.png){fig-alt="Reta suporte passando por A e B; o trecho entre A e B, destacado, é o segmento AB."}

  Segmento $AB$ de extremos $A$ e $B$ e sua reta suporte.
  :::
  ```

  O `fig-alt` descreve a imagem para quem não a vê; a legenda (última linha do bloco) diz o que ela significa no texto.
- Imagem puramente decorativa deve ser evitada (§28).
- Registrar a origem de imagens de terceiros (§43).

## 6. Applets (§29, §30)

No capítulo, todo applet tem: título ou identificação, objetivo breve, instrução de interação, área interativa e uma pergunta ou atividade associada (um checkpoint, por exemplo). Quando necessário, também tem botão de reinício e texto com o estado ou resultado relevante. Começa em estado compreensível e com poucos controles.

- Inserir com `{{< applet <nome> id="…" rotulo="…" >}}` dentro de um `.bloco-interacao`, com a instrução antes e a pergunta depois. O `id` deve ser único na página; o `rotulo` descreve o applet para o leitor de tela.
- Os applets são JSXGraph próprios. Os GeoGebra que ainda estão nos capítulos serão reescritos em JSXGraph, tomando o original como inspiração, não como modelo.
- Como criar, testar e aceitar um applet, e como reescrever um GeoGebra: `diretrizes-tecnicas.md`, §4.

## 7. Acessibilidade e responsividade (§15, §32)

Valores mínimos em §32 do documento de Princípios: contraste 4,5:1 (texto) e 3:1 (elementos gráficos), alvos de 24 × 24 px, reflow em 320 px. Conferir cada página em tela estreita antes de fechar o capítulo.

## 8. Antes de enviar (§39)

Na raiz do projeto:

```bash
(cd applets-src && npm ci && npm run build)  # bundle dos applets: não é versionado, gere ao clonar e após mexer em applets
quarto render --to html
node tests/verificar-site.mjs                # os erros também bloqueiam a publicação no GitHub Actions
git diff
```

- Trabalhar em branch e integrar à `main` depois da verificação, de preferência por pull request (`diretrizes-tecnicas.md`, §8).
- Corrigir os erros do script. Avisos de `alt` ausente devem ser tratados ao tocar na imagem.
- Mensagens de commit curtas, no imperativo, com um assunto por commit.

## 9. Página-modelo

`capitulos/segmentos.qmd` é a página-modelo (§37): objetivo, pré-requisitos, definições em blocos, figuras com `fig-alt` e legenda, erro comum, applet com instrução e texto de estado, checkpoint com resposta recolhível e exercício resolvido. Ao criar ou revisar um capítulo, use-a como referência. Ela ainda tem pendências, como a alternativa ao arraste no applet (`pendencias.md`); onde a página e as diretrizes divergem, valem as diretrizes.

## 10. Exemplo mínimo de trecho correto


```markdown
## Comprimento de um segmento

::: {.bloco-objetivo}
Calcular o comprimento de um segmento a partir de seus extremos.
:::

::: {#def-comprimento-segmento}
O **comprimento** de $AB$ é $d(A,B)$.
:::

::: {.bloco-interacao}
Mova os pontos $A$ e $B$ e observe como o comprimento muda.

{{< applet segmento id="jxg-segmento-1" rotulo="Segmento com dois pontos móveis" >}}
:::

::: {.bloco-checkpoint}
O que acontece com o segmento quando $A$ e $B$ coincidem?
:::
```
