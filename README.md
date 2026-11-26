# Projeto

Livro interativo online de **Fundamentos de Cálculo e Geometria - FCG**,  desenvolvido em [Quarto](https://quarto.org/) pelo corpo docente do GGM-IME-UFF e publicado em GitHub Pages.

## Status
Em desenvolvimento. O site publicado leva o aviso "Material em construção". Os capítulos estão sendo escritos do zero. Os de antes, protótipos (`estado: prototipo` no cabeçalho; `_interno/diretrizes/diretrizes-tecnicas.md`, §1.4), saíram do site em 2026-11-22 e ficam em `_interno/oficina/nao-publicados/`, como modelo.

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
	- LaTeX / BibTeX / KaTeX
	- HTML, CSS/SCSS, JavaScript


## Plataforma de desenvolvimento - Quarto

### Arquivos principais
index.qmd 		- Página inicial
acessibilidade.qmd 	- O que cada opção do painel de acessibilidade faz (o ícone do cabeçalho leva a ela sem JavaScript)
_quarto.yml 	- Configuração principal do livro
_quarto-lab.yml - Perfil lab: acrescenta ao livro a parte Laboratório (as páginas de laboratorio/), gerada em docs-lab/ e fora do site publicado
_brand.yml 		- Identidade visual
_language.yml 	- Traduções dos títulos de definições, proposições etc.
styles/ 		- Estilos próprios: as cores pelo que significam e as preferências do leitor (tokens.scss), a página (page.scss), os blocos (blocks.scss), as fórmulas comentadas (annotations.scss), os applets (applet.scss) e o painel de acessibilidade (settings.scss)
src/site/ 		- O que roda em toda página (boot.js, posto por filters/applet.lua): o painel de acessibilidade (settings.js, prefs.js), aberto pelo ícone do cabeçalho, pela segunda parada do Tab e pelo botão acima de cada quadro; a seção atual no menu, o ícone que recolhe o menu e as abas das dicas e soluções; numa página com fórmula comentada, annotations.js; numa página com applet, os applets
src/applet/ 	- O que roda onde há applet: o quadro, o estado, os controles, as alternativas ao arraste (do livro-base, sem compilação)
src/elements/ 	- Os elementos novos do JSXGraph: handle, vector, marcas
src/math/ 		- Contas e escrita de números, sem desenho
applets/ 		- Um arquivo por applet; o nome do arquivo é o nome usado no capítulo
tests/ 			- Verificação automática (tests/verificar-site.mjs) e testes de unidade (tests/unit/), executados no workflow
math/macros.json 	- Macros de matemática (`\vet`, `\norm`, `\N`, `\Z`, `\Q`, `\R`, `\C`), expandidas em toda fórmula por filters/macros.lua
tools/prerender-math.ts - Desenha as fórmulas depois do render (post-render em '_quarto.yml'): as páginas não levam o KaTeX ao navegador; os applets o carregam quando precisam
tools/sidebar-sections.ts - Depois do render, põe as seções de cada capítulo no menu lateral (não há coluna "Neste capítulo")
filters/ 		- Filtros Lua, vindos do livro-base: as macros (macros.lua), os blocos (blocks.lua: objetivo, observação, dicas e soluções em abas), as fórmulas comentadas (annotations.lua) e os applets (applet.lua, que também põe o script de toda página)
capitulos/ 		- Capítulos listados em '_quarto.yml'
laboratorio/ 	- Páginas de teste e modelos de capítulo, com a configuração do livro; só no perfil lab
vendor/ 		- KaTeX, JSXGraph, fontes e um recorte da fonte de ícones, copiados para que o site não dependa de outro servidor (versões e licenças em vendor/VERSIONS.md)
docs/ 			- Site gerado por 'quarto render' (não versionado)
docs-lab/ 		- Site do perfil lab, com o laboratório (não versionado nem publicado)
_interno/ 		- Material interno fora do livro: diretrizes/ (princípios, guia editorial, diretrizes técnicas, decisões, pendências, mapa arquitetural), referencia/ (material anterior aos princípios, que não orienta o trabalho atual) e oficina/ (nao-publicados/ com capítulos ainda fora do índice do livro, referências)
.github/workflows/publish.yml - Verifica cada pull request; renderiza e publica no GitHub Pages a cada push na main
AGENTS.md 		- Resumo das diretrizes para assistentes de IA

### Comandos principais
quarto preview      - preview local
quarto preview --profile axe - preview local com a verificação de acessibilidade do Quarto (resultado no console do navegador)
quarto preview --profile lab - preview local com o laboratório (páginas de teste e modelos de capítulo); com `--profile lab,axe`, também com a verificação de acessibilidade
quarto render       - gera o site HTML completo em docs/ (o projeto não tem saída em PDF)
node tests/verificar-site.mjs - verifica fontes e docs/ após o render (--estrito trata avisos como erros)
node --test "tests/unit/*.test.mjs" - testes de unidade (a paleta, as fórmulas comentadas e as contas e a escrita dos números dos applets, src/math/)
quarto render --profile lab --to html e node tests/verificar-site.mjs --lab - geram e verificam o laboratório, em docs-lab/ (o que o verificador acha nas páginas de teste é listado, sem reprovar)


## Applets

Os applets são JSXGraph próprios: um arquivo em `applets/`, com o que vem pronto em `src/` (o sistema do livro-base, desde a fase 5 da migração, sem compilação: os arquivos são servidos como estão). Os applets GeoGebra dos capítulos de antes ficam em `_interno/oficina/nao-publicados/`, como modelo; um capítulo novo que pedir um deles o ganha reescrito (lista em `_interno/diretrizes/pendencias.md`, §5).

- Como inserir um applet num capítulo (o bloco `::: {.applet}`, as partes, os arranjos): `_interno/diretrizes/guia-editorial.md`, §6, e a página Arranjos do laboratório.
- O que cada applet garante, como é aceito e por quê: `_interno/diretrizes/diretrizes-tecnicas.md`, §4.
- Como criar um applet, passo a passo: `_interno/diretrizes/arquitetura.md`, §7.

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
- [ ] `node tests/verificar-site.mjs` não acusa erros, e `node --test "tests/unit/*.test.mjs"` passa.
- [ ] O laboratório renderiza sem erro (`quarto render --profile lab --to html`).
- [ ] O capítulo novo está listado em `_quarto.yml`.
- [ ] Fórmulas, imagens e links funcionam.
- [ ] Applets carregam localmente.
- [ ] O conteúdo funciona em tela estreita.
- [ ] Não há arquivos temporários no commit.
- [ ] Se houve decisão nova, ela está em `_interno/diretrizes/decisoes.md` e todo o material foi ajustado a ela (nos protótipos, só o necessário para o site funcionar).

### Arquivos principais Git

.gitignore (pastas e arquivos que não devem ir para o commit): ver o arquivo na raiz.
Grupos principais: cache e saída do Quarto (`.quarto/`, `docs/`, `docs-lab/`, `index.tex`, `*_files/`), `node_modules/`, `.DS_Store`, `*.code-workspace`, `_scratch/` (local, não versionado) e HTML gerado em `_interno/`, temporários do LaTeX.

## Licença
	Definir antes da divulgação (`_interno/diretrizes/pendencias.md`, §6).