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
	- Referências em  'references.bib'
	- Exemplo de citação: ... @autor2024, ...


## Liguagens de desenvolvimento
	- Markdown / QMD
	- LaTeX / BibTeX / MathJax
	- HTML, CSS/SCSS, JavaScript


## Plataforma de desenvolvido - Quarto

### Arquivos principais
index.qmd 		-  Página inicial
references.bib 	-  Referências bibliográficas
_quarto.yml 	- Configuração principal do livro
_brand.yml 		- Identidade visual
assets/css/custom.scss - Estilos próprios
applets/ 		- Componentes interativos

### Comandos principais
quarto preview      - preview local
quarto render       - gera o site completo
quarto clean        - limpa arquivos auxiliares


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

### Exemplo de incorporação:
::: {.bloco-applet}
**Applet.** Mova o ponto e observe a mudança na coordenada.
<iframe
src="../applets/jsxgraph/01-primeiras-nocoes/ponto-na-reta.html"
width="100%"
height="420"
loading="lazy"
title="Applet: ponto na reta">
</iframe>
:::

## Versionamento e Repositorio Remoto - Git e GitHub

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

.gitignore (pastas e arquivos que devem ser ignorados no commit)
Conteúdo:
_site/
_book/
.quarto/
.DS_Store
Thumbs.db
*.log
*.aux
*.out
*.toc

## Licença
	Definir antes da publicação pública.