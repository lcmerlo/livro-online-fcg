# Guia editorial

Guia curto para quem escreve ou revisa capítulos. A justificativa de cada regra está em `Princípios e Especificações Operacionais 26-10-03.md` (§ entre parênteses). Em caso de conflito, o documento de Princípios prevalece.

## 1. Estrutura de um tópico (§5, §22)

Um tópico trata **uma ideia principal**. A ordem e a presença dos componentes variam com o conteúdo; não preencher componente só para completar a lista.

- **Núcleo (no fluxo principal):** objetivo, pré-requisitos (se necessários), ideia central, uma ou mais representações, exemplo, prática ou verificação.
- **Apoio (quando ajudar):** erro comum, nota de notação, interpretação geométrica, segundo exemplo, applet, dica.
- **Complementar (fora do fluxo ou expansível):** remediação, demonstração detalhada, aprofundamento, desafio.

A lista de dez itens do `README.md` e do `index.qmd` é um repertório, não um roteiro obrigatório.

## 2. Títulos

- Um `#` por arquivo, o título do capítulo. Seções de capítulo com `##`, subseções com `###`. Sem saltos de nível.
- Não renomear títulos, arquivos, labels (`{#def-…}`, `{#fig-…}`) nem IDs sem necessidade: eles são âncoras e URLs (§27).

## 3. Componentes

Use as classes e shortcodes, sem formatar à mão (§24, §36).

| Para | Use |
|---|---|
| Objetivo, pré-requisitos, exemplo, applet, erro comum, checkpoint | `::: {.bloco-objetivo}` … `:::` (também `-pre-requisitos`, `-exemplo`, `-applet`, `-erro`, `-checkpoint`). O rótulo visível é inserido automaticamente por `components/blocos.lua`. |
| Applet JSXGraph próprio | `{{< applet segmento id="jxg-segmento-1" rotulo="Descrição para leitor de tela" >}}` |
| Applet GeoGebra | `{{< geogebra f2zqppmu titulo="Applet GeoGebra: descrição específica" >}}` |
| Definição e proposição | Ver "Pendência" abaixo |
| Exercício resolvido | `::: {#exrr-nome}` com a resolução em `::: {.callout-note title="Resolução" collapse="true"}` |
| Figura com legenda | `::: {.fig-leg #fig-nome}` (largura opcional: `.w30` … `.w80`) |

**Pendência (decisão editorial).** Definições e proposições aparecem de duas formas: blocos `::: {#def-…}` com referência cruzada (capítulos 1 a 5) e títulos `## Definição` (demais capítulos). Escolher uma forma e padronizar. Até lá, não misturar as duas no mesmo capítulo.

## 4. Matemática (§28)

- Fórmulas são texto (LaTeX), nunca imagem.
- Vetor: `\vec{u}`. Conjunto dos reais: `\mathbb{R}`. Implicações: `\Rightarrow`, `\Leftrightarrow`. Paralelo e perpendicular: `\parallel`, `\perp`.
- Cor não pode ser o único modo de distinguir termos em uma fórmula: se usar `\color`, indicar o sentido também no texto. Cores hexadecimais são escritas com `#`: `\color{#993300}`. No MathJax do site, `\color{993300}` não aplica cor e `\color[HTML]{993300}` produz erro (testado em 04/10/2026).
- **Pendências de padronização** (observadas no texto atual; decidir uma forma): vetor definido por segmento orientado como `\vec{AB}` ou `\overrightarrow{AB}`; norma como `\lVert\vec{u}\rVert` ou `\|\vec{u}\|`.
- Introduzir a notação antes de usá-la com frequência.
- Alterações de conteúdo matemático passam por revisão de um docente antes de entrar.

## 5. Imagens (§29)

- Pasta e nome: `assets/img/<arquivo-do-capítulo>/<nome-descritivo>.svg` (ou `.png`). Evitar `Untitled.png` e nomes gerados por ferramentas.
- Preferir SVG para diagramas.
- Toda imagem informativa tem texto alternativo que diga **o que ela mostra para a aprendizagem**, não apenas "Figura":
  `![Segmento AB com extremos A e B marcados.](../assets/img/02-segmentos/segmento-ab.svg)`
- Imagem puramente decorativa deve ser evitada (§29).
- Registrar a origem de imagens de terceiros (§44).

## 6. Applets (§30, §31)

Todo applet tem: título ou identificação, objetivo breve, instrução de interação, área interativa e uma pergunta ou atividade associada (checkpoint). Quando necessário, também tem botão de reinício e texto com o estado ou resultado relevante. Começa em estado compreensível e com poucos controles.

Para criar um applet JSXGraph novo:

1. Criar `applets-src/src/applets/<nome>.js`, usando estilos de `src/tools/styles.js` e cores de `src/cores.js`.
2. Registrar o nome em `applets-src/src/main.js` (objeto `applets`).
3. Testar com `cd applets-src && npm run dev`.
4. Inserir no capítulo com `{{< applet <nome> id="…" rotulo="…" >}}`. O `id` deve ser único na página.
5. Garantir acesso por teclado e alternativa a qualquer ação que dependa só de arraste.

## 7. Acessibilidade e responsividade (§15, §33)

Valores mínimos em §33 do documento de Princípios: contraste 4,5:1 (texto) e 3:1 (elementos gráficos), alvos de 24 × 24 px, reflow em 320 px. Conferir cada página em tela estreita antes de fechar o capítulo.

## 8. Antes de enviar (§40)

Na raiz do projeto:

```bash
(cd applets-src && npm ci && npm run build)  # bundle dos applets: não é versionado, gere ao clonar e após mexer em applets
quarto render --to html
node tests/verificar-site.mjs                # os erros também bloqueiam a publicação no GitHub Actions
git diff
```

- Preferir trabalhar em branch e integrar por pull request. O README ainda descreve push direto em `main`; alinhar os dois.
- Corrigir os erros do script. Avisos de `alt` ausente devem ser tratados ao tocar na imagem.
- Mensagens de commit curtas, no imperativo, com um assunto por commit.

## 9. Exemplo mínimo de trecho correto

A definição usa a forma dos capítulos 1 a 5 (`{#def-…}`), que ainda depende da decisão registrada na seção 3.

```markdown
## Comprimento de um segmento

::: {.bloco-objetivo}
Calcular o comprimento de um segmento a partir de seus extremos.
:::

::: {#def-comprimento-segmento}
O **comprimento** de $AB$ é $d(A,B)$.
:::

::: {.bloco-applet}
Mova os pontos $A$ e $B$ e observe como o comprimento muda.

{{< applet segmento id="jxg-segmento-1" rotulo="Segmento com dois pontos móveis" >}}
:::

::: {.bloco-checkpoint}
O que acontece com o segmento quando $A$ e $B$ coincidem?
:::
```
