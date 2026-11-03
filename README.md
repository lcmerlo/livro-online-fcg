# Projeto

Livro interativo online de **Fundamentos de Cálculo e Geometria - FCG**,  desenvolvido em [Quarto](https://quarto.org/) pelo corpo docente do GGM-IME-UFF e publicado em GitHub Pages.

## Status
Em desenvolvimento.

## Componentes de um capítulo
Repertório, não roteiro obrigatório: cada capítulo usa os componentes de que precisa, na ordem que o conteúdo pedir (ver `_interno/diretrizes/guia-editorial.md`).

Objetivo
Pré-requisitos
Ideia central intuitiva
Formalização
Interpretação algébrica e geométrica
Exemplos gradativos resolvidos
Applet guiado
Erros comuns
Exercícios com ajuda
Exercícios de fixação

## Bibliografia
	- Ainda não utilizada: 'references.bib' e 'references.qmd' estão em '_interno/oficina/'
	- Para ativar: mover os dois para a raiz, listar 'references.qmd' ao fim de 'chapters' e restaurar 'bibliography: references.bib' em '_quarto.yml'
	- Exemplo de citação: ... @autor2024, ...


## Linguagens de desenvolvimento
	- Markdown / QMD
	- LaTeX / BibTeX / MathJax
	- HTML, CSS/SCSS, JavaScript


## Plataforma de desenvolvimento - Quarto

### Arquivos principais
index.qmd 		- Página inicial
_quarto.yml 	- Configuração principal do livro
_brand.yml 		- Identidade visual
_language.yml 	- Traduções dos títulos de definições, proposições etc.
assets/css/custom.scss - Estilos próprios
tests/ 			- Verificação automática (tests/verificar-site.mjs), executada no workflow
components/macros.html - Macros de matemática (`\vet`, `\norm`, `\N`, `\Z`, `\Q`, `\R`, `\C`)
components/ - Filtros Lua (`blocos.lua`) e shortcodes (`applet.lua`); o bundle dos applets só é carregado nas páginas que usam `applet`
capitulos/ 		- Capítulos listados em '_quarto.yml'
applets-src/ 	- Código-fonte dos applets JSXGraph (Vite)
assets/js/applets-dist/ - Bundle gerado por 'npm run build' (não versionado)
docs/ 			- Site gerado por 'quarto render' (não versionado)
_interno/ 		- Material interno fora do livro: diretrizes/ (princípios, guia editorial, diretrizes técnicas, decisões, pendências, mapa arquitetural) e oficina/ (protótipos/ com capítulos ainda não publicados, testes/ para arquivos de teste com a configuração do livro, referências)
.github/workflows/publish.yml - Verifica cada pull request; renderiza e publica no GitHub Pages a cada push na main
AGENTS.md 		- Resumo das diretrizes para assistentes de IA

### Comandos principais
quarto preview      - preview local
quarto render       - gera o site HTML completo em docs/ (o projeto não tem saída em PDF)
cd applets-src && npm ci && npm run build - gera o bundle dos applets (necessário antes do render local)
cd applets-src && npm run watch - refaz o bundle a cada alteração em applets-src/src/ (use junto com o quarto preview ao editar applets)
node tests/verificar-site.mjs - verifica fontes e docs/ após o render (--estrito trata avisos como erros)
`quarto render _interno/oficina/testes/ARQUIVO.qmd` - renderiza um arquivo de teste com tema, filtros e macros do livro


## Applets

### Características dos applets:
- objetivo claro;
- instrução curta;
- controles mínimos;
- descrição textual;
- botão ou instrução de reinício;
- checkpoint após a exploração;
- uso pelo teclado e alternativa ao arraste.

O que cada applet garante e como é aceito: `_interno/diretrizes/diretrizes-tecnicas.md`, §4.


### Ferramentas para produção de applets
	- JSXGraph: ferramenta dos applets do livro.
	- GeoGebra: applets de projetos anteriores, ainda em alguns capítulos. Servem de inspiração e serão reescritos em JSXGraph (lista em `_interno/diretrizes/pendencias.md`).
	- Outras ferramentas, como Desmos, só por decisão registrada.

### Incorporação (shortcodes de `components/applet.lua`)
Applet JSXGraph próprio (gera o contêiner, o botão de reinício e carrega o bundle só nesta página):

::: {.bloco-interacao}
Neste applet, mova os pontos A e B e observe como o segmento muda.

{{< applet segmento id="jxg-segmento-1" rotulo="Applet interativo sobre segmento com dois pontos móveis." >}}
:::

O primeiro argumento é o nome de um arquivo de `applets-src/src/applets/`, sem `.js`; `id` deve ser único na página.

Applet GeoGebra, provisório até a reescrita em JSXGraph (iframe com `title`, carregamento tardio e link alternativo):

{{< geogebra f2zqppmu titulo="Applet GeoGebra: descrição curta" >}}

## Versionamento e Repositório Remoto - Git e GitHub

### Fluxo recomendado
Cada mudança é feita num branch e só depois integrada à `main`; o site é publicado a cada push na `main`.

git switch -c nome-da-mudanca     - cria o branch da mudança
git status                        - verifica alterações
git add .                         - adiciona arquivos ao commit
git commit -m "Descrição da alteração realizada"
git push -u origin nome-da-mudanca  - envia o branch ao repositório remoto

Depois, no GitHub, abrir um pull request do branch para a `main`. O GitHub Actions verifica o pull request (sem publicar) e mostra o resultado na página dele; integrá-lo só com a verificação aprovada.

### Mensagens de commit devem ser curtas e descritivas, por exemplo:
- Adiciona capítulo sobre segmentos
- Corrige links internos
- Ajusta estilos dos blocos didáticos
- Inclui applet de ponto na reta

### Checklist antes de commit
- [ ] O projeto renderiza sem erro.
- [ ] `node tests/verificar-site.mjs` não acusa erros.
- [ ] O capítulo novo está listado em `_quarto.yml`.
- [ ] Fórmulas, imagens e links funcionam.
- [ ] Applets carregam localmente.
- [ ] O conteúdo funciona em tela estreita.
- [ ] Não há arquivos temporários no commit.
- [ ] Se houve decisão nova, ela está em `_interno/diretrizes/decisoes.md` e todo o material foi ajustado a ela.

### Arquivos principais Git

.gitignore (pastas e arquivos que não devem ir para o commit): ver o arquivo na raiz.
Grupos principais: cache e saída do Quarto (`.quarto/`, `docs/`, `index.tex`, `*_files/`), `node_modules/` e o bundle dos applets, `.DS_Store`, `*.code-workspace`, `_scratch/` (local, não versionado) e HTML gerado em `_interno/`, temporários do LaTeX.

## Licença
	Definir antes da publicação pública.