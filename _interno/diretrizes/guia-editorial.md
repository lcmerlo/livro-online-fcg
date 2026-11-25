# Guia editorial

Guia curto para quem escreve ou revisa capítulos. A justificativa de cada orientação está em `Princípios e Especificações Operacionais-26-10-03.md` (§ entre parênteses); o desenvolvimento técnico (applets, código, verificação) está em `diretrizes-tecnicas.md`.

As orientações deste guia são provisórias, pela regra "siga ou explique", menos as que repetem uma regra fundamental (`diretrizes-tecnicas.md`, §1.2 e §1.3). Valem para os capítulos revisados; nos protótipos (`estado: prototipo` no cabeçalho), vale o §1.4 das diretrizes técnicas. Quando o guia diverge de outro documento, a divergência é um defeito a corrigir; o que fazer até lá está no §1.5 das diretrizes técnicas.

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

Use as classes e os blocos, sem formatar à mão (§23, §35). Desde a fase 7 da migração (25/11/2026), os blocos são os do Apêndice B do livro-base ("Blocos"), e os de antes (`.bloco-*`, `.dica`, `.solucao`, `.resposta`, `#exrr-…`, `.fig-leg` e os avisos `.callout-…` do Quarto) dão erro no verificador; a troca de cada um está no Apêndice F do livro-base ("No capítulo").

| Para | Use |
|---|---|
| Objetivo, com o que é preciso saber antes | `::: {.objective}` … `:::`, com os pré-requisitos numa frase no fim: "Antes de começar: …". O rótulo "Objetivo." entra sozinho, na linha do texto (`filters/blocks.lua`). |
| Erro comum, nota, cuidado, destaque | `::: {.note title="Erro comum"}` … `:::`, com o título que o trecho pedir; sem título, o rótulo é "Observação." |
| Applet | `::: {.applet name="nome-do-applet" spoken="Nome para o leitor de tela"}` … `:::` (o nome é o de um arquivo de `applets/`); dentro, só se o capítulo quiser escolher o lugar delas, as partes: quadros, controles, expressões (§6) |
| Definição | `::: {#def-nome}` … `:::` (padrão adotado; ver abaixo) |
| Proposição | `::: {#prp-nome}` … `:::` (ver abaixo) |
| Exemplo | `::: {#exm-nome}` … `:::` |
| Exercício, exercício resolvido e pergunta para conferir | `::: {#exr-nome}` … `:::`, com `.hint` e `.solution` opcionais dentro, depois do enunciado |
| Dica e solução | `::: {.hint}`, `::: {.solution}` dentro de `#exm` ou `#exr`: viram abas que começam fechadas, "Dica" e "Solução" (gerado por `filters/blocks.lua`) |
| Fórmula comentada | `::: {.annotated}` em volta da fórmula em destaque e da lista dos comentários (§4) |
| Figura com legenda | `::: {.figure-note #fig-nome}` (largura opcional: `.w30` … `.w100`) |

**Uso dos componentes (08/10/2026; a sintaxe, de 25/11/2026).** Ver as quatro famílias visuais no §23 dos Princípios.

- Abertura: `.objective`, uma ou duas frases, com os pré-requisitos numa frase no fim ("Antes de começar: …", com links de revisão).
- Interação: a instrução num parágrafo imediatamente antes do applet, sem bloco em volta (o applet já se apresenta), poucos controles e uma pergunta de observação logo depois. O bloco `.applet` gera sozinho a parte interativa, que não se escreve à mão. Só o quadro, onde fica a figura, tem fundo branco e borda; os controles, as expressões e os botões de reiniciar e de acessibilidade (logo acima de cada quadro) ficam fora dele, no fundo da página.
- Erro comum: `.note title="Erro comum"`, sempre aberto; apresentar o equívoco e a correção.
- Pergunta para conferir (o antigo checkpoint): uma pergunta conceitual breve (até três itens), escrita como exercício, `{#exr-…}`, com a resposta numa `.solution`. Diagnostica a compreensão (decisão E15 do livro-base).
- Dicas e soluções ficam fechadas: só se abrem por ação do estudante.

Dicas e soluções ficam dentro do exercício (ou exemplo), depois do enunciado, separadas por linhas em branco. Divs `.hint` e `.solution` seguidas formam um só conjunto de abas, e cada dica vale para a solução escrita depois dela. Com mais de uma solução, as abas são numeradas ("Solução 1", "Solução 2"); duas dicas seguidas ficam na mesma aba, uma embaixo da outra ("Dica a", "Dica b"). Sem JavaScript, dicas e soluções ficam à vista, cada uma com o nome.

```markdown
::: {#exr-nome}
Enunciado.

::: {.hint}
…
:::

::: {.solution}
…
:::
:::
```

Na pergunta para conferir:

```markdown
::: {#exr-nome}
Pergunta.

::: {.solution}
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

- Fórmulas são texto (LaTeX), nunca imagem. O site as desenha com o KaTeX, que aceita quase todo o LaTeX matemático, mas não todo; `tests/verificar-site.mjs` acusa a fórmula que ele não desenha.
- Plica com o apóstrofo do teclado: `$a'$`, `$A'B'$`. O apóstrofo curvo `’`, que alguns editores põem sozinhos, aparece como apóstrofo, e não como plica (o verificador avisa).
- Números: ponto decimal e vírgula entre coordenadas, como `$x = 1.5$` e `$A = (2.5, 3)$`. Convenção provisória, a reavaliar (`pendencias.md`, §2).
- Vetor, com dois comandos: `\vec{u}` quando o nome tem uma só letra; `\vet{AB}` (tabela abaixo) quando o nome é formado por dois pontos, como `AB` ou `P_0P`. A seta de `\vet` acompanha a largura do nome, com o desenho ajustado no estilo do site (`styles/page.scss`; decisão E6 do livro-base). Um comando único ainda pode ser escolhido (`pendencias.md`, §2).
- Implicações: `\Rightarrow`, `\Leftrightarrow`. Paralelo e perpendicular: `\parallel`, `\perp`.
- **Macros** (definidas em `math/macros.json` e expandidas em toda fórmula, em qualquer formato de saída, e também nos applets):

  | Escrever | Resulta em | Uso |
  |---|---|---|
  | `\vet{AB}` | `\overrightarrow{AB}`, com a seta ajustada | vetor representado pelo segmento orientado `AB` |
  | `\norm{\vec{u}}` | `\lVert \vec{u} \rVert` | norma |
  | `\N`, `\Z`, `\Q`, `\R`, `\C` | `\mathbb{N}` … `\mathbb{C}` | conjuntos numéricos |

  Para alterar a notação em todo o livro, edite a lista de `math/macros.json`, em que cada barra invertida aparece dobrada (`"\\R": "\\mathbb{R}"`). Por que num só lugar: `diretrizes-tecnicas.md`, §5.
- Cor não pode ser o único modo de distinguir termos em uma fórmula: se usar `\color`, indicar o sentido também no texto. Cores hexadecimais são escritas com `#`: `\color{#993300}`, forma que vale em qualquer motor de fórmulas. O KaTeX também aplica `\color{993300}`, mas o MathJax não; `\color[HTML]{993300}` produz erro nos dois (testado no KaTeX em 05/11/2026 e no MathJax em 04/10/2026).
- Use as macros: não escrever `\overrightarrow`, `\vec{AB}`, `\lVert`, `\|…\|` ou `\mathbb{R}` à mão.
- **Fórmula comentada**, quando as partes de uma fórmula pedem explicação: um bloco `::: {.annotated}` com a fórmula em destaque, cada parte marcada com `\note{n}{…}`, e logo depois a lista numerada dos comentários, um por número. As formas (`.annotated`, `.annotated .beside`, `.annotated .legend`, e a chave `\underbrace`) e quando usar cada uma: Apêndice B do livro-base, "Fórmulas comentadas"; funcionando, `laboratorio/formulas-comentadas.qmd`.
- Introduzir a notação antes de usá-la com frequência.
- Alterações de conteúdo matemático e de texto didático só entram com a aprovação do autor responsável. O que conta como cada tipo de mudança está em `diretrizes-tecnicas.md`, §9.

## 5. Imagens (§28)

- Pasta e nome: `assets/img/<arquivo-do-capítulo>/<nome-descritivo>.svg` (ou `.png`). Evitar `Untitled.png` e nomes gerados por ferramentas.
- Preferir SVG para diagramas.
- Toda imagem informativa tem texto alternativo (`fig-alt`) que diga **o que ela mostra para a aprendizagem**, não apenas "Figura". O texto entre colchetes **não** é o alt: no Quarto ele vira legenda.

  ```markdown
  ::: {.figure-note #fig-segmentos}
  ![](../assets/img/segmentos/segmento-ab-reta-suporte.png){fig-alt="Reta suporte passando por A e B; o trecho entre A e B, destacado, é o segmento AB."}

  Segmento $AB$ de extremos $A$ e $B$ e sua reta suporte.
  :::
  ```

  O `fig-alt` descreve a imagem para quem não a vê; a legenda (última linha do bloco) diz o que ela significa no texto.
- Imagem puramente decorativa deve ser evitada (§28).
- Registrar a origem de imagens de terceiros (§43).

## 6. Applets (§29, §30)

No capítulo, todo applet tem: título ou identificação, objetivo breve, instrução de interação, área interativa e uma pergunta ou atividade associada (uma pergunta para conferir, por exemplo). Começa em estado compreensível e com poucos controles. Os botões de reiniciar e de acessibilidade, o texto que descreve a figura (para o leitor de tela, e à vista para quem o pede), o teclado e as alternativas ao arraste vêm com todo applet: o capítulo não escreve nada para tê-los.

Desde a fase 5 da migração (25/11/2026), a sintaxe é a do Apêndice B do livro-base ("Um applet no capítulo"); a de antes (os shortcodes `applet` e `geogebra`, o bloco com `nome=` e as partes `.quadro`, `.controles` e `.leitura`) saiu, e o verificador dá erro onde ela estiver. A troca de cada uma está no Apêndice F do livro-base, seção "No capítulo".

- **O caso mais simples:** a instrução num parágrafo antes, a pergunta depois, sem bloco em volta. O applet põe o quadro e, logo abaixo, os controles.

  ```markdown
  Arraste a ponta de $\vec{u}$ e veja o que acontece com $a\vec{u}$.

  ::: {.applet name="scalar-multiple" spoken="Múltiplo de um vetor"}
  :::
  ```

  `name` é o nome do arquivo em `applets/`, sem o `.js`; `spoken` é o nome que o leitor de tela diz, e todo applet precisa de um.
- **Escolher onde as partes ficam:** escrevem-se as partes, na ordem e no lugar desejados. As partes que um applet oferece estão nas primeiras linhas do arquivo dele.

  ```markdown
  ::::: {.applet name="scalar-multiple" spoken="Múltiplo de um vetor"}
  :::: {.middle cols="7fr 5fr"}
  []{.board name="plane"}

  ::: {}
  Agora, [product]{.live}.

  []{.controls .stack}
  :::
  ::::
  :::::
  ```

  O bloco de fora tem mais dois-pontos que os de dentro, para que se leia onde cada um termina.

  | Parte | O que é |
  |---|---|
  | `[]{.board name="…"}` | um quadro; só os quadros escritos são desenhados. Aceita `spoken`, `width` (como `20rem`), `ratio` (como `3 / 1`, que solta as escalas dos eixos) e as classes `.center`, `.float-right` e `.float-left` |
  | `[]{.controls}` | o lugar dos controles (padrão: abaixo dos quadros); aceita `.center` e `.stack` (um embaixo do outro) |
  | `[nome]{.live}` | uma expressão escrita pelo applet; sozinha na linha, em destaque; numa frase, em linha. Fora do bloco, pertence ao applet anterior, ou ao indicado por `of="id"` |

- **Arranjos**, sem CSS no capítulo:

  | Para | Escreva |
  |---|---|
  | só alguns quadros | só esses; os outros não são desenhados |
  | um quadro mais estreito ou no centro | `width="20rem"` e `.center` no quadro |
  | outro formato de quadro | `ratio="3 / 1"`; as escalas dos eixos ficam livres |
  | partes lado a lado | `cols="2"`, `cols="7fr 5fr"` ou `cols="auto"`; desfazem-se num espaço estreito |
  | texto ao lado do quadro | uma célula de `cols` com o texto; para vários parágrafos na mesma célula, `::: {}` |
  | células centradas na altura | `.middle`, junto de `cols` |
  | texto contornando o quadro | `.float-right` ou `.float-left` no quadro |
  | quadros de tamanho fixo, juntos | `::: {.board-group}` em volta deles |
  | mais largo que o texto | `.column-page-right` no bloco do applet |
  | sem controles | `controls="none"` no bloco do applet |
  | controles em outro lugar | `[]{.controls}` onde eles devem ficar |

- Cada quadro tem um nome lido diferente dos outros quadros da página.
- Cada arranjo funcionando, com o que se escreve no `.qmd`: `laboratorio/arranjos.qmd` (ver com `quarto preview --profile lab`).
- Como criar, testar e aceitar um applet, e como reescrever um GeoGebra: `diretrizes-tecnicas.md`, §4.

## 7. Acessibilidade e responsividade (§15, §32)

Os valores mínimos estão no §32 dos Princípios; quais deles são regras fundamentais, no `diretrizes-tecnicas.md`, §1.3. Conferir cada página em tela estreita antes de fechar o capítulo.

## 8. Antes de enviar (§39)

Na raiz do projeto:

```bash
quarto render --to html
node tests/verificar-site.mjs                # os erros também bloqueiam a publicação no GitHub Actions
quarto render --profile lab --to html        # o laboratório: se não renderizar, a publicação também para
git diff
```

- Trabalhar em branch e integrar à `main` depois da verificação, de preferência por pull request (`diretrizes-tecnicas.md`, §8).
- Corrigir os erros do script e, nos capítulos revisados, os avisos; nos protótipos, os avisos aparecem só contados (`diretrizes-tecnicas.md`, §1.4).
- Mensagens de commit curtas, no imperativo, com um assunto por commit.

## 9. Página-modelo

Os capítulos de hoje são protótipos (`diretrizes-tecnicas.md`, §1.4) e não servem de modelo. Até o primeiro capítulo revisado, a referência de forma é `laboratorio/modelo-capitulo-completo.qmd`, que reúne os componentes deste guia com texto de exemplo. O primeiro capítulo reescrito e marcado `estado: revisado` passa a ser a página-modelo (§37): objetivo, pré-requisitos, definições em blocos, figuras com `fig-alt` e legenda, applet, erro comum, pergunta para conferir com resposta recolhível e exercício resolvido. Onde a página e as diretrizes divergem, valem as diretrizes.

## 10. Exemplo mínimo de trecho correto


```markdown
## Comprimento de um segmento

::: {.objective}
Calcular o comprimento de um segmento a partir de seus extremos.
:::

::: {#def-comprimento-segmento}
O **comprimento** de $AB$ é $d(A,B)$.
:::

Mova os pontos $A$ e $B$ e observe como o comprimento muda.

::: {.applet name="nome-do-applet" spoken="Segmento com dois pontos móveis"}
:::

::: {#exr-segmento-degenerado}
O que acontece com o segmento quando $A$ e $B$ coincidem?

::: {.solution}
…
:::
:::
```
