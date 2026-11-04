# Mapa arquitetural do projeto

Guia para quem está chegando ao projeto, inclusive quem tem pouca experiência
com desenvolvimento web. Explica **o que cada pasta e arquivo faz**, **como os
arquivos dependem uns dos outros** e **o caminho que o texto de um capítulo
percorre até virar uma página publicada**.

Os diagramas usam [Mermaid](https://mermaid.js.org/): aparecem desenhados no
GitHub e no VS Code com a extensão *Markdown Preview Mermaid Support*.

Este mapa descreve o projeto **como ele é hoje**. Quando o código muda, o mapa
é atualizado na mesma mudança; se os dois divergirem, vale o código.

Documentos relacionados: `README.md` (comandos), `guia-editorial.md` (como
escrever capítulos), `diretrizes-tecnicas.md` (como desenvolver e decidir),
`decisoes.md` (por que as coisas são como são) e `pendencias.md` (o que está
em aberto).

---

## 1. Visão geral em uma frase

Os capítulos são escritos em **Markdown com extensões do Quarto (`.qmd`)**; o
**Quarto** converte esses arquivos em **páginas HTML** (com estilos, fórmulas e
applets) dentro da pasta `docs/`; um **robô do GitHub (GitHub Actions)** faz
isso automaticamente a cada `git push` na `main` e publica o resultado no
**GitHub Pages**. Num pull request, o robô faz as mesmas verificações, mas não
publica.

Há três "linhas de montagem" que se encontram no final:

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    qmd["<b>1 · Conteúdo</b><br/>capitulos/*.qmd<br/>index.qmd"]
    estilo["<b>2 · Aparência</b><br/>_brand.yml<br/>custom.scss"]
    src["<b>3 · Applets</b><br/>applets-src/src/*.js"]

    src --> vite(["npm run build<br/>(Vite)"])
    vite --> bundle["Bundle<br/>applets-livro.iife.js"]

    qmd --> render(["quarto render"])
    estilo --> render
    bundle --> render

    render --> docs["docs/<br/>site HTML pronto"]
    docs --> pages["GitHub Pages<br/>site público"]
```

---

## 2. Glossário mínimo

| Termo | O que é, neste projeto |
|---|---|
| **Quarto** | Programa que transforma `.qmd` em site. Lê a configuração em `_quarto.yml`. |
| **`.qmd`** | Arquivo de texto em Markdown, com fórmulas LaTeX (`$x^2$`) e blocos especiais (`::: {#def-…}`). É onde se escreve o livro. |
| **Pandoc** | Conversor de documentos usado internamente pelo Quarto. Os filtros Lua atuam sobre ele. |
| **Filtro Lua** | Pequeno programa em Lua que modifica o documento durante a conversão (ex.: `components/blocos.lua`). |
| **Shortcode** | Atalho do tipo `{{< applet … >}}` dentro do `.qmd`, que é trocado por HTML na conversão (definido em `components/applet.lua`). |
| **SCSS / Sass** | CSS com variáveis e regras aninhadas. É compilado para CSS comum pelo Quarto. |
| **Bootstrap / Cosmo** | Biblioteca de estilos usada pelo Quarto; *Cosmo* é o tema-base escolhido. |
| **Variável CSS** (`--cor-…`) | Valor definido uma vez em `:root` e reutilizado em todo o site e pelos applets. |
| **JSXGraph** | Biblioteca JavaScript de geometria dinâmica usada nos applets próprios. |
| **Vite** | Ferramenta que junta (*empacota*) vários arquivos JS em um só arquivo, o **bundle**. |
| **IIFE** | Formato do bundle: um único `.js` que roda direto no navegador, sem `import`. Expõe o objeto global `AppletsLivro`. |
| **npm / `package.json`** | Gerenciador de pacotes do Node.js; baixa o JSXGraph e o Vite para `node_modules/`. |
| **MathJax** | Biblioteca que desenha as fórmulas LaTeX no navegador. |
| **GitHub Actions** | Robô que executa `.github/workflows/publish.yml` a cada push na `main` (verifica e publica) e a cada pull request para a `main` (só verifica). |
| **GitHub Pages** | Hospedagem gratuita do GitHub que serve o conteúdo de `docs/` como site. |

---

## 3. Árvore de pastas

Legenda: ✏️ editado à mão · ⚙️ configuração · 🏭 gerado automaticamente (não
editar, não versionado) · 🔒 local (não vai para o Git)

```text
livro-quarto/
├── _quarto.yml                 ⚙️  Configuração central do livro (capítulos, tema, filtros)
├── _brand.yml                  ⚙️  Identidade visual: paleta de cores e fontes
├── _language.yml               ⚙️  Traduções de rótulos ("Demonstração", "Solução"…)
├── index.qmd                   ✏️  Página inicial (Apresentação)
├── README.md                   ✏️  Resumo do projeto e comandos
├── AGENTS.md                   ✏️  Resumo das diretrizes para assistentes de IA
├── cspell.json                 ⚙️  Corretor ortográfico (pt-BR + termos técnicos)
│
├── capitulos/                  ✏️  Um .qmd por capítulo publicado (ordem definida em _quarto.yml)
│
├── components/                 ✏️  Extensões do Quarto feitas para o livro
│   ├── applet.lua              ✏️  Shortcodes {{< applet >}} e {{< geogebra >}}
│   ├── applet-bloco.lua        ✏️  Filtro: bloco ::: {.applet} de um applet com várias partes
│   ├── applet-comum.lua        ✏️  O que os dois acima têm em comum (bundle, estado, botão Reiniciar)
│   ├── blocos.lua              ✏️  Filtro: rótulos dos blocos didáticos e abas Dica/Resolução/Resposta
│   └── macros.html             ✏️  Macros LaTeX (\vet, \norm, \R…) incluídas em todas as páginas
│
├── assets/                     Arquivos estáticos usados pelas páginas
│   ├── css/custom.scss         ✏️  Estilos próprios do livro (tokens de cor, blocos, applets)
│   ├── img/<capítulo>/         ✏️  Figuras, uma subpasta por capítulo
│   └── js/applets-dist/        🏭  Bundle dos applets gerado por `npm run build`
│
├── applets-src/                ✏️  Código-fonte dos applets JSXGraph (projeto Node/Vite separado)
│   ├── package.json            ⚙️  Dependências (jsxgraph, vite) e scripts (dev, build, watch)
│   ├── package-lock.json       🏭  Versões exatas instaladas (gerado pelo npm, mas versionado)
│   ├── vite.config.js          ⚙️  Como gerar o bundle e onde salvá-lo
│   ├── index.html              ✏️  Página de testes para `npm run dev` (não faz parte do livro)
│   ├── src/
│   │   ├── main.js             ✏️  Ponto de entrada: registro automático dos applets, inicialização, reinício
│   │   ├── cores.js            ✏️  Lê as variáveis CSS de cor da página
│   │   ├── tools/quadro.js     ✏️  Cria o quadro (região, proporção, toque e teclado) e liga quadros
│   │   ├── tools/leitura.js    ✏️  Leitura: fórmula do applet desenhada pelo MathJax
│   │   ├── tools/styles.js     ✏️  Estilos JSXGraph: pontos (a forma diz se o ponto se move), seta, traços
│   │   ├── tools/vetores.js    ✏️  Contas com vetores (sem desenho)
│   │   ├── tools/formatar.js   ✏️  Escrita de números, pontos, ângulos e expressões (TeX e texto)
│   │   ├── exemplos/           ✏️  Applets de exemplo para `npm run dev` (fora do bundle)
│   │   └── applets/            ✏️  Um arquivo por applet (hoje vazia; o .gitkeep mantém a pasta no Git)
│   └── node_modules/           🏭  Pacotes baixados pelo `npm ci`
│
├── tests/
│   └── verificar-site.mjs      ✏️  Verificação automática das fontes e do HTML gerado
│
├── _interno/                   ✏️  Material interno, versionado mas ignorado pelo Quarto (começa com "_")
│   ├── diretrizes/             ✏️  Princípios, guia editorial, diretrizes técnicas, decisões, pendências, este mapa
│   └── oficina/
│       ├── protótipos/         ✏️  Capítulos ainda não publicados
│       ├── testes/             ⚙️  Mini-projeto Quarto com a mesma configuração do livro
│       └── references.bib/.qmd ✏️  Bibliografia (ainda inativa)
│
├── .github/
│   ├── workflows/publish.yml   ⚙️  Robô de build e publicação no GitHub Pages
│   └── copilot-instructions.md ⚙️  Regras para o GitHub Copilot
├── .vscode/settings.json       ⚙️  Preferências do VS Code para este projeto
├── .gitignore                  ⚙️  O que o Git não deve versionar
│
├── docs/                       🏭  Site gerado por `quarto render` (é ele que vai ao ar)
├── .quarto/                    🏭  Cache interno do Quarto
├── _scratch/                   🔒  Rascunhos e auditorias descartáveis
└── .claude/                    🔒  Configurações locais do Claude Code
```

**Regra prática:** se a pasta aparece com 🏭, pode ser apagada sem medo — ela é
recriada pelo comando correspondente. Nunca edite arquivos dentro de `docs/` ou
`assets/js/applets-dist/`: a alteração some na próxima geração.

---

## 4. Finalidade de cada arquivo

### 4.1 Configuração do livro (raiz)

| Arquivo | Finalidade | Quem lê |
|---|---|---|
| `_quarto.yml` | Diz ao Quarto: tipo de projeto (`book`), pasta de saída (`docs`), lista e ordem dos capítulos, camadas de tema, filtros, shortcodes, macros, numeração de seções e o tipo personalizado `exrr` (Exercício Resolvido). | Quarto |
| `_brand.yml` | Paleta nomeada (`azul-2`, `areia-1`…), papéis das cores (`primary`, `background`…) e fontes (Atkinson Hyperlegible no texto, Source Serif 4 nos títulos). O Quarto transforma cada cor da paleta em uma variável SCSS `$brand-<nome>`. | Quarto (camada `brand` do tema) |
| `_language.yml` | Substitui rótulos padrão do Quarto ("Proof" → "Demonstração"). Lido automaticamente por estar na raiz do projeto. | Quarto |
| `index.qmd` | Primeira página do livro (sem número de capítulo). | Quarto |
| `cspell.json` | Dicionário e padrões ignorados pelo verificador ortográfico do editor. | Extensão Code Spell Checker |

### 4.2 `capitulos/`

Cada `.qmd` é um capítulo. Só é publicado se estiver listado em `book.chapters`
no `_quarto.yml`. Um capítulo combina:

- **Markdown** (títulos `##`, listas, ênfase);
- **LaTeX** entre `$…$`, usando as macros de `components/macros.html`;
- **Blocos numerados do Quarto**: `{#def-…}`, `{#prp-…}`, `{#exm-…}`, `{#exr-…}`, `{#exrr-…}`, referenciados com `@def-…`;
- **Blocos didáticos do livro**: `.bloco-objetivo`, `.bloco-pre-requisitos`, `.bloco-interacao`, `.bloco-erro`, `.bloco-checkpoint`;
- **Abas recolhíveis**: `.dica`, `.solucao`, `.resposta`;
- **Shortcodes**: `{{< applet … >}}` e `{{< geogebra … >}}`;
- **Figuras** de `assets/img/<capítulo>/`.

### 4.3 `components/` — extensões do Quarto

| Arquivo | Quando roda | O que faz |
|---|---|---|
| `applet.lua` | Na renderização, ao encontrar um shortcode | `applet`: gera o `<div data-applet="…">` (com as classes de `arranjo`, se houver), o parágrafo de estado `<id>-status` e o botão "Reiniciar applet"; registra o bundle JS/CSS **apenas nessa página**. `geogebra`: gera um `<iframe>` acessível (com `title`, carregamento tardio e link alternativo). |
| `applet-bloco.lua` | Na renderização, em todo capítulo | Transforma o bloco `::: {.applet nome="…" id="…" rotulo="…"}` na parte interativa de um applet com várias partes: o bloco recebe `data-applet`, `role="group"` e o rótulo; cada parte `.quadro` vira um `div.applet-jxg` com `aria-label`, e cada `.leitura`, um `div.applet-leitura`; cada parte recebe `data-parte` (o id, sem o prefixo `<id>-`); no fim entram o parágrafo de estado e o botão. Avisa no render quando falta rótulo, quando o id de uma parte não começa por `<id>-` e quando uma parte está fora de um bloco. |
| `applet-comum.lua` | Carregado pelos dois acima (`require`) | Carrega o bundle e escreve o parágrafo de estado e o botão "Reiniciar", iguais no shortcode e no bloco. |
| `blocos.lua` | Na renderização, em todo capítulo | Insere o rótulo visível ("Objetivo", "Erro comum"…) no topo de cada `.bloco-*`; agrupa `.dica`/`.solucao`/`.resposta` consecutivas em abas que começam fechadas, e injeta o pequeno script que permite fechá-las. |
| `macros.html` | Incluído no `<body>` de todas as páginas | Define `\vet`, `\norm`, `\N`, `\Z`, `\Q`, `\R`, `\C` para o MathJax. |

### 4.4 `assets/`

| Caminho | Finalidade |
|---|---|
| `css/custom.scss` | Última camada do tema. Dividido em `scss:defaults` (variáveis Sass, como tamanho de fonte) e `scss:rules` (regras CSS). Seções: **1. Tokens** (variáveis `--cor-…` derivadas de `_brand.yml`), **2. Layout**, componentes (GeoGebra, figuras `.fig-leg`, blocos didáticos, exemplos/exercícios, callouts, abas recolhíveis, applets, com as medidas `--applet-…` dos pontos e o `touch-action` do quadro) e **acessibilidade** (`prefers-reduced-motion`). |
| `img/<capítulo>/` | Imagens dos capítulos. O Quarto copia para `docs/assets/img/` as que são usadas. |
| `js/applets-dist/` | 🏭 `applets-livro.iife.js` + `applets-livro.css`, saída do Vite. |

### 4.5 `applets-src/` — applets JSXGraph

| Arquivo | Finalidade |
|---|---|
| `package.json` | Declara as dependências (`jsxgraph`, `vite`) e os scripts: `dev` (servidor de testes), `build` (gera o bundle uma vez), `watch` (regera a cada alteração). |
| `vite.config.js` | Gera **um único arquivo** IIFE chamado `applets-livro.iife.js`, com nome global `AppletsLivro`, em `../assets/js/applets-dist/`. |
| `index.html` | Página de desenvolvimento usada só por `npm run dev`. Repete as cores, as medidas e as regras dos pontos de `custom.scss` (e imita a grade do Quarto), que fora do livro não existem, e traz uma amostra das formas de ponto e das setas e o exemplo de applet com várias partes, no HTML que o bloco gera (nada disso vai para o bundle). |
| `src/main.js` | **Ponto de entrada.** Importa o JSXGraph e seu CSS, monta o **registro** `applets` com todos os arquivos de `src/applets/` (o nome do arquivo, sem `.js`, é o nome do applet; a exportação padrão é a função que o cria), procura na página todo elemento com `data-applet` e chama a função correspondente, com as partes do bloco em `partes`; trata os cliques em botões `data-reset`. |
| `src/cores.js` | Lê as variáveis `--cor-…` da página (`getComputedStyle`) e as expõe no objeto `CORES`. É a ponte entre o CSS do livro e os applets. |
| `src/tools/quadro.js` | `criarQuadro({ JXG, id, regiao, eixos, grade })`: cria o quadro com a proporção da região e os padrões de interação (o plano não se desloca nem muda de escala; no toque, rolar fora dos pontos e arrastar sobre eles; o ponto mais próximo vence; o ponto arrastado não sai da região); só desenha num `.applet-jxg`. `ligarQuadros(...quadros)`: mexer num quadro redesenha os outros. |
| `src/tools/leitura.js` | `criarLeitura({ id, tex, quadros })`: escreve na parte `.leitura` a fórmula `tex()`, desenhada pelo MathJax da página (com as macros do livro), refeita quando um dos quadros muda; sem MathJax, mostra o TeX. |
| `src/tools/vetores.js` | Contas com vetores em listas de números (`componentes`, `soma`, `produtoEscalar`, `norma`, `angulo`, `determinante`, `coeficientesNaBase`, `projecao`…); `NaN` quando a conta não está definida. |
| `src/tools/formatar.js` | O único lugar do formato dos números: `numero`, `texto.*` (texto simples, para o parágrafo de estado), `tex.*`, `expressao` e `equacao` (TeX, para fórmulas), `casos`. |
| `src/tools/styles.js` | Estilos prontos para objetos JSXGraph: `pontoArrastavel`, `pontoFixo` e `pontoAberto` (cor e forma como parâmetros; medidas lidas das variáveis `--applet-…`), `seta` (ponta e nome no meio) e o objeto `ESTILOS` com os traços por papel didático (`retaPrinc`, `objAux`, `objConstr`, `invar`, `erro`). |
| `src/applets/` | Um arquivo por applet; a exportação padrão é a função que o cria (§7). Hoje está vazia: o livro não tem applet JSXGraph em capítulo desde que o `segmento` foi removido, em 2026-11-03. |
| `src/exemplos/` | Applets de exemplo, fora do bundle (`main.js` só registra `src/applets/`): `exemplo-partes.js`, com dois quadros ligados e uma leitura, é o modelo de applet com várias partes e roda na página de `npm run dev`. |

### 4.6 `tests/verificar-site.mjs`

Script Node sem dependências. Verifica:

- **nas fontes** (`index.qmd` e `capitulos/*.qmd`): imagens inexistentes, "Definição"/"Proposição" escritas como título em vez de bloco, comandos TeX suspeitos (ex.: `\MATHBB`), cores `\color{…}` sem `#`;
- **no site gerado** (`docs/`): `iframe` sem `title`, imagem sem `alt` (aviso), applet usado sem arquivo correspondente em `applets-src/src/applets/`, quadro ou bloco de applet sem rótulo, `id` duplicado, saltos na hierarquia de títulos (aviso).

Links internos e âncoras são verificados à parte pelo *lychee*, no workflow.

### 4.7 Ferramentas e bastidores

| Arquivo | Finalidade |
|---|---|
| `.github/workflows/publish.yml` | Receita do robô de publicação (ver §5.5). |
| `.github/copilot-instructions.md`, `AGENTS.md` | Resumo das diretrizes para assistentes de IA: que tipo de mudança cada um pode fazer e como verificar (`diretrizes-tecnicas.md`, §9). |
| `.vscode/settings.json` | Formatação de `.qmd` pela extensão Quarto, oculta pastas geradas no Explorer, Copilot só em arquivos de código. |
| `.gitignore` | Impede versionar `docs/`, `.quarto/`, `node_modules/`, o bundle, `_scratch/`, HTML gerado em `_interno/` etc. |
| `_interno/oficina/testes/_quarto.yml` | Copia a configuração do livro para testar um arquivo isolado: `quarto render _interno/oficina/testes/ARQUIVO.qmd`. |

---

## 5. Diagramas

### 5.1 Quem depende de quem (configuração e estilos)

As setas significam "é lido / usado por".

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart LR
    quarto["<b>_quarto.yml</b>"]
    quarto -->|"chapters"| caps["index.qmd<br/>capitulos/*.qmd"]
    quarto -->|"brand"| brand["_brand.yml"]
    quarto -->|"theme"| tema["cosmo<br/>+ brand<br/>+ custom.scss"]
    quarto -->|"filters"| blocos["blocos.lua<br/>applet-bloco.lua"]
    quarto -->|"shortcodes"| appletlua["applet.lua"]
    quarto -->|"include-before-body"| macros["macros.html"]
```

O `_language.yml` não aparece no `_quarto.yml`: o Quarto o lê
automaticamente por estar na raiz do projeto.

E o que cada capítulo usa, conforme o que está escrito nele:

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart LR
    cap["<b>capítulo .qmd</b>"]
    cap -->|"figuras"| img["assets/img/"]
    cap -->|"\vet, \R, \norm"| macros["macros.html"]
    cap -->|"blocos .bloco-*<br/>.dica, .solucao"| blocos["blocos.lua"]
    cap -->|"applet, geogebra"| appletlua["applet.lua<br/>(+ bundle JS)"]
    cap -->|"bloco .applet"| appletbloco["applet-bloco.lua<br/>(+ bundle JS)"]
    cap -->|"classes CSS"| scss["custom.scss"]
```

### 5.2 Cadeia das cores: de `_brand.yml` até o applet

Uma cor é definida **uma única vez** e chega ao site e aos applets por este
caminho. Para mudar a cor dos pontos manipuláveis, por exemplo, altere a paleta
ou o token — não o JavaScript.

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    b["<b>_brand.yml</b><br/>verde-5: #0F766E"]
    s["<b>custom.scss</b><br/>--cor-manip:<br/>#{$brand-verde-5}"]
    css["<b>CSS compilado</b><br/>--cor-manip: #0f766e"]
    site["Páginas do livro<br/>(blocos, textos)"]
    c["<b>cores.js</b><br/>CORES.objManip"]
    st["<b>tools/styles.js</b><br/>pontoArrastavel()"]
    a["<b>applets/*.js</b><br/>pontos arrastáveis"]

    b -->|"Quarto cria<br/>$brand-verde-5"| s
    s -->|"Sass compila"| css
    css --> site
    css -->|"getComputedStyle<br/>no navegador"| c
    c --> st
    st --> a
```

Famílias semânticas de cor (definidas em `custom.scss`, seção 1):

| Token | Uso pedagógico |
|---|---|
| `--cor-obj-princ*` | Objeto principal da ideia (ex.: o segmento) |
| `--cor-manip*` | O que o estudante pode arrastar |
| `--cor-constr*` | Construções derivadas |
| `--cor-aux*` | Elementos auxiliares (tracejados) |
| `--cor-invar*` | O que permanece constante |
| `--cor-erro*` | Situações de erro ou contraexemplo |

Cada família tem três tons: `-suave`, normal e `-forte`.

### 5.3 Dependências entre os arquivos JavaScript

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    main["<b>main.js</b><br/>ponto de entrada"]
    jxg["jsxgraph<br/>+ jsxgraph.css"]
    novo["applets/<br/>um arquivo por applet"]
    styles["tools/styles.js"]
    quadro["tools/quadro.js"]
    cores["cores.js"]

    main -->|"import"| jxg
    main -.->|"import automático<br/>(applets/*.js)"| novo
    novo -.->|"import"| styles
    novo -.->|"import"| quadro
    novo -.->|"import"| contas["tools/vetores.js<br/>tools/formatar.js<br/>tools/leitura.js"]
    styles -->|"import"| cores
    main -->|"import"| cores
```

As setas tracejadas mostram onde um applet novo se encaixa: basta criar o
arquivo em `applets/`, porque `main.js` importa todos os arquivos dessa pasta
(`import.meta.glob`). O Vite parte de `main.js`, segue todos esses `import` e
junta tudo em dois arquivos: `applets-livro.iife.js` e `applets-livro.css`.

Observação: o JSXGraph **não** é importado por cada applet. O `main.js` o
importa uma vez e o entrega a cada applet como parâmetro (`criar<Nome>({ id, JXG, partes })`).

### 5.4 O que acontece em `quarto render` (simplificado)

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    start(["<b>quarto render</b>"])
    cfg["<b>Lê a configuração</b><br/>_quarto.yml, _brand.yml,<br/>_language.yml"]
    theme["<b>Compila o tema</b><br/>cosmo → brand → custom.scss<br/>resultado: docs/site_libs/bootstrap/"]
    parse["<b>Para cada capítulo</b><br/>o Pandoc lê o .qmd"]
    sc["<b>Shortcodes viram HTML</b> (applet.lua)<br/>se há applet, o bundle é copiado<br/>para docs/site_libs/quarto-contrib/"]
    flt["<b>Filtros</b><br/>blocos.lua, applet-bloco.lua + numeração,<br/>@referências, callouts, abas"]
    html["<b>Monta a página</b><br/>menu, sumário, busca,<br/>macros.html, MathJax"]
    out(["<b>docs/capitulos/nome.html</b><br/>+ imagens em docs/assets/img/"])

    start --> cfg --> theme --> parse --> sc --> flt --> html --> out
```

> **Importante:** o `quarto render` **não** compila os applets. Se o bundle não
> existir em `assets/js/applets-dist/`, rode antes
> `cd applets-src && npm ci && npm run build`.

### 5.5 Como um applet aparece na tela

Exemplo: um capítulo com a linha
`{{< applet nome-do-applet id="jxg-nome-do-applet-1" rotulo="…" >}}`.

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    subgraph R["Durante o quarto render"]
        direction TB
        r1["<b>①</b> o capítulo contém o shortcode<br/>applet nome-do-applet, id jxg-nome-do-applet-1"]
        r2["<b>②</b> applet.lua escreve o HTML:<br/>div com data-applet = nome-do-applet,<br/>parágrafo de estado e botão Reiniciar"]
        r3["<b>③</b> applet.lua anexa o bundle<br/>JS + CSS só nesta página"]
        r1 --> r2 --> r3
    end

    subgraph N["No navegador do estudante"]
        direction TB
        n1["<b>④</b> A página carrega<br/>applets-livro.iife.js"]
        n2["<b>⑤</b> cores.js lê as cores --cor-*<br/>styles.js lê as medidas --applet-*"]
        n3["<b>⑥</b> main.js, em iniciarTodos(),<br/>procura elementos data-applet"]
        n4["<b>⑦</b> a função do applet é chamada:<br/>criar<Nome>({ id, JXG })"]
        n5["<b>⑧</b> criarQuadro cria o quadro;<br/>o JSXGraph desenha os objetos"]
        n6["<b>⑨</b> O applet fica guardado<br/>em instancias[id]"]
        n7["<b>⑩</b> Clique em Reiniciar:<br/>instancias[id].reset()"]
        n1 --> n2 --> n3 --> n4 --> n5 --> n6 --> n7
    end

    R --> N
```

O nome passado no shortcode (`nome-do-applet`) precisa ser **igual** ao nome do
arquivo do applet (`applets-src/src/applets/nome-do-applet.js`, sem `.js`). Se não
for, o applet não aparece e o teste `verificar-site.mjs` acusa erro.

Com o bloco `::: {.applet}`, o caminho é o mesmo, com três diferenças: em ②, quem
escreve o HTML é `applet-bloco.lua`, e o `data-applet` fica no bloco que envolve as
partes; em ⑦, a função recebe também `partes`, do nome da parte para o id
(`{ figura: "cl-figura", leitura: "cl-leitura" }`); em ⑧, o applet cria um quadro
por parte `.quadro` e a leitura com `criarLeitura`.

### 5.6 Publicação automática (GitHub Actions)

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    push(["<b>git push</b> na main<br/>ou pull request"])
    co["Baixa o repositório"]
    node["Instala Node 22"]
    ci["npm ci<br/>(dependências dos applets)"]
    build["npm run build<br/>(gera o bundle)"]
    qi["Instala Quarto 1.9.35"]
    render["quarto render --to html<br/>(gera docs/)"]
    t1{"verificar-site.mjs<br/>sem erros?"}
    t2{"lychee: links e<br/>âncoras corretos?"}
    pr{"é pull<br/>request?"}
    ok(["Verificação aprovada<br/>(nada é publicado)"])
    up["Envia docs/<br/>ao GitHub Pages"]
    dep(["<b>Site atualizado</b>"])
    fail(["Verificação reprovada<br/>(nada é publicado)"])

    push --> co --> node --> ci --> build --> qi --> render --> t1
    t1 -->|"sim"| t2
    t2 -->|"sim"| pr
    pr -->|"sim"| ok
    pr -->|"não"| up --> dep
    t1 -->|"não"| fail
    t2 -->|"não"| fail
```

O resultado aparece na página do pull request, no GitHub. Integre o pull
request à `main` só quando a verificação estiver aprovada.

Como `docs/` e o bundle não são versionados, **o site publicado é sempre
gerado do zero pelo robô**. O que está na sua máquina em `docs/` serve apenas
para pré-visualização.

---

## 6. Trabalho local: qual comando usar

| Quero… | Comando | Onde |
|---|---|---|
| Instalar dependências dos applets (1ª vez) | `npm ci` | `applets-src/` |
| Gerar o bundle dos applets | `npm run build` | `applets-src/` |
| Ver o livro enquanto escrevo | `quarto preview` | raiz |
| Editar applets e ver no livro | `npm run watch` (num terminal) + `quarto preview` (noutro) | `applets-src/` e raiz |
| Testar um applet fora do livro | `npm run dev` (abre `index.html`) | `applets-src/` |
| Gerar o site completo | `quarto render` | raiz |
| Rodar as verificações | `node tests/verificar-site.mjs` | raiz |
| Testar um `.qmd` isolado com a configuração do livro | `quarto render _interno/oficina/testes/ARQUIVO.qmd` | raiz |

```mermaid
%%{init: {"themeVariables": {"fontSize": "20px"}, "flowchart": {"wrappingWidth": 420}}}%%
flowchart TD
    edjs["Edito<br/>applets-src/src/*.js"]
    w["<b>Terminal 1</b> (applets-src/)<br/>npm run watch"]
    dist["assets/js/applets-dist/<br/>bundle atualizado"]
    edqmd["Edito<br/>.qmd ou .scss"]
    p["<b>Terminal 2</b> (raiz)<br/>quarto preview"]
    nav["O navegador<br/>recarrega a página"]

    edjs --> w --> dist --> p
    edqmd --> p
    p --> nav
```

---

## 7. Receitas comuns

### Adicionar um capítulo
1. Criar `capitulos/<nome>.qmd` com um único título `#`.
2. Incluir `capitulos/<nome>.qmd` em `book.chapters` no `_quarto.yml`, na posição desejada.
3. Imagens em `assets/img/<nome>/`, referenciadas por `../assets/img/<nome>/arquivo.png`.
4. Rodar `quarto preview` e `node tests/verificar-site.mjs`.

### Adicionar um applet JSXGraph
O que o applet deve garantir, a ficha de aceitação e como reescrever um applet
GeoGebra estão em `diretrizes-tecnicas.md`, §4. Os passos técnicos:

1. Criar `applets-src/src/applets/<nome>.js` com a exportação padrão `export default function criar<Nome>({ id, JXG })`, que devolve `{ board, objetos, reset }`. O registro é automático: o nome do arquivo é o nome do applet. Nessa pasta só ficam applets; código compartilhado vai para `src/tools/`. Esqueleto:

   ```js
   import { criarQuadro } from "../tools/quadro.js";
   import { pontoArrastavel } from "../tools/styles.js";
   import { texto } from "../tools/formatar.js";

   export default function criarNome({ id, JXG }) {
     const board = criarQuadro({ JXG, id, regiao: [-1, 5, 7, -1], eixos: true, grade: true });
     if (!board) return null;

     const A0 = [1, 1];   // posição inicial, reaproveitada pelo reset()
     const A = board.create("point", A0, { name: "A", ...pontoArrastavel(), snapToGrid: true });
     // … demais objetos, com os estilos de tools/styles.js

     // Texto de estado (§4.4 das diretrizes), refeito 400 ms depois do último movimento
     const status = document.getElementById(`${id}-status`);
     let espera;
     const descrever = () => { status.textContent = `A = ${texto.ponto(A)}.`; };
     if (status) {
       descrever();
       board.on("update", () => { clearTimeout(espera); espera = setTimeout(descrever, 400); });
     }

     function reset() {
       A.moveTo(A0);
       board.update();
     }

     return { board, objetos: { A }, reset };
   }
   ```

   O `segmento.js`, modelo até 2026-11-03, continua no histórico do Git: `git show d5b3f8d:applets-src/src/applets/segmento.js`.
2. Opcional: acrescentar um `div` de teste em `applets-src/index.html` e usar `npm run dev`.
3. `npm run build`.
4. No capítulo, dentro de um `.bloco-interacao`: `{{< applet <nome> id="jxg-<nome>-1" rotulo="Descrição acessível" >}}`.

### Adicionar um applet com várias partes
Quadros ligados e leituras em lugares diferentes da página. O modelo é
`applets-src/src/exemplos/exemplo-partes.js`, que roda em `npm run dev`.

1. No capítulo, um bloco envolve as partes, nos arranjos do `guia-editorial.md`, §6:

   ```markdown
   ::::: {.applet nome="<nome>" id="<id>" rotulo="Descrição do applet"}
   :::: {.grid}
   ::: {#<id>-figura .quadro .g-col-12 .g-col-md-6 rotulo="Descrição do quadro"}
   :::
   ::: {#<id>-leitura .leitura .g-col-12 .g-col-md-6}
   :::
   ::::
   :::::
   ```

2. No applet, as partes chegam em `partes`, pelo nome (o id sem o prefixo `<id>-`). Uma parte que o capítulo não pôs fica de fora, e o applet a trata como opcional:

   ```js
   export default function criarNome({ id, JXG, partes }) {
     const board = criarQuadro({ JXG, id: partes.figura, regiao: [-1, 5, 7, -1] });
     if (!board) return null;
     const outro = partes.outro ? criarQuadro({ JXG, id: partes.outro, regiao: [-1, 5, 7, -1] }) : null;
     if (outro) ligarQuadros(board, outro);
     criarLeitura({ id: partes.leitura, tex: () => `…`, quadros: [board] });
     // texto de estado em `${id}-status` e reset(), como no applet de um quadro
   }
   ```

3. `npm run build`, `quarto render` e `node tests/verificar-site.mjs`; o render avisa quando falta um rótulo ou quando o id de uma parte não começa por `<id>-`.

### Mudar uma cor
- Cor do tema (fundo, links, títulos): papel ou paleta em `_brand.yml`.
- Cor de um objeto matemático (site e applets): token `--cor-…` em `custom.scss` (seção 1).
- Se mudar um token usado pelos applets, atualize também o `:root` de `applets-src/index.html` (só afeta a página de testes).

### Criar um novo tipo de bloco didático
1. Rótulo em `rotulos` de `components/blocos.lua`.
2. Estilo em `custom.scss`, junto aos demais `.bloco-*`.
3. Documentar em `_interno/diretrizes/guia-editorial.md` e acrescentar aos
   modelos de `_interno/oficina/testes/`.
4. Registrar a decisão em `decisoes.md` (`diretrizes-tecnicas.md`, §2).

---

## 8. Pontos de atenção

- **Duas cópias de configuração.** `_interno/oficina/testes/_quarto.yml` repete parte de `_quarto.yml`. Ao alterar um, altere o outro.
- **Nome do applet = nome do arquivo.** `main.js` registra cada arquivo de `src/applets/`, e o teste usa a mesma regra. Um arquivo auxiliar posto nessa pasta seria tomado por applet: código compartilhado fica em `src/tools/`.
- **`id` único por página.** Cada applet usa `id` como chave em `instancias` e para achar `<id>-status`. Dois applets com o mesmo `id` na mesma página quebram ambos.
- **Rótulos diferentes.** O JSXGraph faz de cada quadro uma região com nome; dois quadros com o mesmo rótulo na mesma página confundem quem navega pelo leitor de tela (o axe acusa).
- **A grade do Quarto e a largura de 320 px.** A `.grid` tem 12 colunas e 11 espaços entre elas; com o espaço padrão (1,5 rem), só os espaços já passavam da coluna a 320 px. `custom.scss` o reduz para 1 rem. Uma parte na grade ou no grupo também pode ficar mais estreita que o desenho já feito (`min-width: 0`), para o JSXGraph redesenhar o quadro quando a janela estreita.
- **Leituras e MathJax.** O Pandoc só carrega o MathJax em páginas com fórmulas; `applet-bloco.lua` põe uma fórmula vazia em cada leitura para garantir o carregamento. Fórmulas longas rolam dentro da leitura a 320 px: prefira leituras curtas.
- **Cores e medidas lidas uma vez.** `cores.js` e `tools/styles.js` leem as variáveis CSS quando o bundle carrega. Mudanças de cor ou de medida exigem recarregar a página.
- **Toque.** O `touch-action` do quadro (`.applet-jxg`, em `custom.scss`) tem `!important` porque o JSXGraph escreve outro valor no quadro a cada toque, com um toque de atraso; quem impede a rolagem quando o dedo pega um ponto é `criarQuadro`. Um applet que crie o quadro sem `criarQuadro` perde esse cuidado.
- **Depuração no navegador.** O bundle expõe o global `AppletsLivro`. No console: `AppletsLivro.instancias` lista os applets ativos; `AppletsLivro.resetarApplet("<id>")` reinicia um deles.
- **`docs/` acumula arquivos antigos** (vários `bootstrap-*.min.css`) entre renderizações locais. É normal; o robô publica a partir de uma pasta limpa. Para limpar localmente, apague `docs/` e renderize de novo.
- **Pastas com `_` no início** (`_interno/`, `_scratch/`) são ignoradas pelo Quarto; por isso o material interno não aparece no site.
- **Erros de SCSS.** Quando a compilação do tema falha, o Quarto pode deixar na raiz um arquivo `_quarto_internal_scss_error.scss` para diagnóstico. Ele é temporário, está no `.gitignore` e pode ser apagado depois de corrigido o erro.
