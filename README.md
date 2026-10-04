# Projeto

Livro interativo online de **Fundamentos de Cálculo e Geometria - FCG**,  desenvolvido em [Quarto](https://quarto.org/) pelo corpo docente do GGM-IME-UFF e publicado em GitHub Pages.

## Status
Em desenvolvimento.

## Estrutura recomendada para capítulos
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
	- Ainda não utilizada: 'references.bib' e 'references.qmd' estão em '_interno/rascunhos/'
	- Para ativar: mover os dois para a raiz, listar 'references.qmd' ao fim de 'chapters' e restaurar 'bibliography: references.bib' em '_quarto.yml'
	- Exemplo de citação: ... @autor2024, ...


## Linguagens de desenvolvimento
	- Markdown / QMD
	- LaTeX / BibTeX / MathJax
	- HTML, CSS/SCSS, JavaScript


## Plataforma de desenvolvimento - Quarto

### Arquivos principais
index.qmd 		-  Página inicial
_quarto.yml 	- Configuração principal do livro
_brand.yml 		- Identidade visual
_language.yml 	- Traduções dos títulos de definições, proposições etc.
assets/css/custom.scss - Estilos próprios
assets/includes/applets.html - Carrega o bundle dos applets em todas as páginas
capitulos/ 		- Capítulos listados em '_quarto.yml'
applets-src/ 	- Código-fonte dos applets JSXGraph (Vite)
assets/js/applets-dist/ - Bundle gerado por 'npm run build' (não versionado)
docs/ 			- Site gerado por 'quarto render' (não versionado)
_interno/ 		- Material interno fora do livro: diretrizes/ (princípios, propostas) e rascunhos/ (capítulos ainda não publicados, referências)
.github/workflows/publish.yml - Renderiza e publica no GitHub Pages
AGENTS.md 		- Regras para agentes de código

### Comandos principais
quarto preview      - preview local
quarto render       - gera o site HTML completo em docs/ (o projeto não tem saída em PDF)
cd applets-src && npm ci && npm run build - gera o bundle dos applets (necessário antes do render local)


## Applets

### Características dos applets:
- objetivo claro;
- instrução curta;
- controles mínimos;
- descrição textual;
- botão ou instrução de reinício;
- checkpoint após a exploração;
- alternativa ao uso exclusivo do mouse, quando possível.


### Ferramentas para produção de applets
	- JSXGraph
	- Desmos
	- GeoGebra

### Exemplo de incorporação (applet JSXGraph próprio):
::: {.bloco-applet}
Neste applet, mova os pontos A e B e observe como o segmento muda.

<div
  id="jxg-segmento-1"
  class="applet-jxg"
  data-applet="segmento"
  aria-label="Applet interativo sobre segmento com dois pontos móveis.">
</div>

<button type="button" onclick="window.AppletsLivro.resetarApplet('jxg-segmento-1')">
  Reiniciar applet
</button>
:::

O valor de `data-applet` deve estar registrado em `applets-src/src/main.js`.
Applets GeoGebra são incorporados com `<iframe>` dentro de `<div class="geogebra-container">`.

## Versionamento e Repositório Remoto - Git e GitHub

### Fluxo recomendado
git status          - verifica alterações
git add .           - adiciona arquivos ao commit
git commit -m "Descrição da alteração realizada"
git push            - envia ao repositório remoto

### Mensagens de commit devem ser curtas e descritivas, por exemplo:
- Adiciona capítulo sobre segmentos
- Corrige links internos
- Ajusta estilos dos blocos didáticos
- Inclui applet de ponto na reta

### Checklist antes de commit
- [ ] O projeto renderiza sem erro.
- [ ] O capítulo novo está listado em `_quarto.yml`.
- [ ] Fórmulas, imagens e links funcionam.
- [ ] Applets carregam localmente.
- [ ] O conteúdo funciona em tela estreita.
- [ ] Não há arquivos temporários no commit.

### Arquivos principais Git

.gitignore (pastas e arquivos que não devem ir para o commit): ver o arquivo na raiz.
Grupos principais: cache e saída do Quarto (`.quarto/`, `docs/`, `index.tex`, `*_files/`), `node_modules/` e o bundle dos applets, `.DS_Store`, `*.code-workspace`, `_scratch/` (local, não versionado) e HTML gerado em `_interno/`, temporários do LaTeX.

## Licença
	Definir antes da publicação pública.