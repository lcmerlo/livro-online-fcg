# Pendências

O que está em aberto no projeto: requisitos ainda não cumpridos, decisões a tomar, ajustes previstos e applets a reescrever. Cada item diz o que é, onde está e qual é o próximo passo. Quando um item se resolve, ele sai desta lista; se a solução for uma decisão, ela vai para `decisoes.md` (`diretrizes-tecnicas.md`, §2).

Última revisão: 2026-11-03.

## 1. Requisitos ainda não cumpridos

| O quê | Onde | Próximo passo |
|---|---|---|
| Imagens sem texto alternativo (11 avisos do verificador em 2026-11-02) | vários capítulos | escrever o `fig-alt` ao revisar cada imagem (`guia-editorial.md`, §5) |
| Contraste medido antes das últimas mudanças de cor | medição de 04/10/2026 (§32); `_brand.yml` e `custom.scss` mudaram depois | medir de novo os pares de cor de texto, bordas e objetos |
| Licença do conteúdo e do código | `README.md`, §43 | definir antes da divulgação pública |
| Aviso de licença do JSXGraph no bundle | `applets-livro.iife.js` (a minificação remove o aviso) | manter o aviso no build |
| Licença e carregamento das fontes | `_brand.yml` (§43) | confirmar |

## 2. Decisões a tomar

| Assunto | Opções | Como decidir |
|---|---|---|
| Opções de acessibilidade ativadas pelo leitor (pedido do autor em 2026-11-03): alternativas como campos de coordenadas apareceriam só para quem as escolher, deixando o layout padrão enxuto | (a) painel único de preferências no site, lembrado pelo navegador (`localStorage`), lido pelos applets; (b) um botão "Mostrar controles alternativos" em cada applet; (c) tudo sempre visível (atual) | piloto com o primeiro applet que precisar da alternativa ao arraste (campos para as coordenadas, por exemplo). Pontos a resolver: a opção precisa ser fácil de achar e operável por teclado, pois o critério 2.5.7 exige que a alternativa esteja disponível; respeitar preferências do sistema quando existirem (`prefers-reduced-motion`, `prefers-contrast`); a escolha vale para todo o livro; custo de manutenção de mais um estado. Se adotada: registrar em `decisoes.md` e atualizar §4 das diretrizes e a ficha de aceitação |
| Formato dos números (reavaliar a convenção provisória de 2026-11-03: ponto decimal e vírgula entre coordenadas, `(2.5, 3)`) | manter, ou adotar a norma brasileira: vírgula decimal e `;` entre coordenadas, `(2,5; 3)` | escolha do autor; vale para applets e texto. Se mudar: `1{,}5` ou macro no MathJax (sem isso, `$1,5$` aparece como "1, 5"), `;` nos ~88 pares numéricos dos capítulos, formatação dos números num só lugar nos applets e campos de digitação que aceitem vírgula |
| Seta de vetor (hoje dois comandos: `\vec{u}` para nome de uma letra e `\vet{AB}` para nome formado por dois pontos) | continuar com os dois, ou um só comando com bom resultado nos dois casos (`\vec{AB}` deixa a seta curta; `\overrightarrow{AB}` não agradou ao autor) | escolha do autor, comparando variantes no MathJax; as tentativas até 2026-11-03 (`_interno/oficina/testes/teste.qmd`) não deram resultado satisfatório. Se um comando só for adotado: mudar `components/macros.html`, o `guia-editorial.md` §4 e os usos nos capítulos (458 `\vec` e 26 `\vet`; redefinir um dos dois nomes evita trocar o outro) |
| Tamanho da fonte e entrelinha | `_brand.yml` define 1,0625rem e 1,6; `custom.scss` define 1,05rem e 1,65, e hoje prevalece | escolher os valores e mantê-los num só arquivo (`diretrizes-tecnicas.md`, §6) |
| Modelo de cor dos applets | por papel didático (atual) ou por identidade do objeto (JSX-quarto) | piloto: as duas variantes no mesmo applet, conferidas pela ficha de aceitação |
| Motor de fórmulas | MathJax (atual) ou KaTeX | piloto: macros, prévias de referências cruzadas e rótulos do JSXGraph |
| Caso paralelo na combinação linear | tornar o caso alcançável (encaixe na grade ou no ângulo) ou não | decisão didática do autor, depois do piloto |

## 3. Ajustes técnicos previstos

| O quê | Por quê |
|---|---|
| Etapa 2 da adoção do JSX-quarto: contas vetoriais, formatação de números e expressões (da `lib/`) e a regra das unidades (radianos nas contas, graus só na tela) | plano aprovado pelo autor em 2026-11-03; o formato dos números passa a ficar num só lugar |
| Etapa 3: vários quadros e partes num applet (quadros ligados, leituras com fórmula, arranjos do cap. 10 do estudo do JSX-quarto); falta o autor escolher como as partes se escrevem no `.qmd` (recomendação: um bloco `::: {.applet …}` que envolve as partes) | quadros, controles e leituras em lugares diferentes da página (`diretrizes-tecnicas.md`, §4.5) |
| Pontos arrastáveis podem sair da região do quadro (conferido no Chrome em 2026-11-03) | o estudante perde o ponto de vista e só o recupera com "Reiniciar"; o JSX-quarto tem a restrição `pontonaregiao` na `lib/` |
| Piloto: combinação linear (2 de 2) reescrita em JSXGraph, no projeto de testes (`_interno/oficina/testes/`) | responde às hipóteses da seção 2 |

## 4. Inconsistências registradas

| O quê | Onde | Próximo passo |
|---|---|---|
| `\overrightarrow{AB}` onde o guia pede `\vet{AB}` (`guia-editorial.md`, §4) | `_interno/oficina/protótipos/` (3 arquivos) | trocar ao publicar cada protótipo |
| Protótipos citam materiais GeoGebra (links e imagens) | `_interno/oficina/protótipos/` | reescrever os applets em JSXGraph ao publicar cada protótipo |
| O JSX-quarto usa 360 px como largura mínima; o livro, 320 px | JSX-quarto, `migracao/manual.qmd` | alinhar lá, se o autor quiser (fora deste repositório) |

## 5. Applets GeoGebra a reescrever em JSXGraph

Todos serão substituídos por applets JSXGraph próprios (`diretrizes-tecnicas.md`, §4). Na coluna "No JSX-quarto", um nome indica um applet já migrado do mesmo material, ponto de partida para a ideia; "tema próximo" indica um applet migrado de outro material sobre o mesmo assunto. A coluna "Original" diz se o `.ggb` está na pasta `AppletsGGB/` do autor; os demais podem ser baixados em `geogebra.org/m/<material>`.

| Capítulo | Material | Título no capítulo | No JSX-quarto | Original |
|---|---|---|---|---|
| `primeiras-nocoes.qmd` | `nep5hngs` | Primeiras Noções | — | não |
| `eixos.qmd` | `f2zqppmu` | Eixos (1 de 2) | — | não |
| `eixos.qmd` | `zt4dnqjy` | Eixos (2 de 2) | — | não |
| `coordenadas-plano.qmd` | `ykdu6wtk` | Coordenadas no plano (1 de 2) | — | não |
| `coordenadas-plano.qmd` | `pbfm8wna` | Coordenadas no plano (2 de 2) | — | não |
| `circulos.qmd` | `h6vdnv3c` | Círculos | — | não |
| `vetores.qmd` | `fjcqnvew` | Vetores | — | não |
| `produto-numero-vetor.qmd` | `rfvkqkbh` | Produto entre Número e Vetor | tema próximo: `multiplo-escalar` | provável (pasta `mrfvkqkbh-Produto-entre-n-e-vetor-1`) |
| `soma-subtracao-vetores.qmd` | `acdycnxx` | Soma e Subtração de Vetores | `soma-de-vetores` | sim |
| `combinacao-linear.qmd` | `kbvp4xpt` | Combinação Linear (1 de 2) | — | não |
| `combinacao-linear.qmd` | `zmcpatqc` | Combinação Linear (2 de 2) | `combinacao-linear` | sim |
| `produto-interno-escalar.qmd` | `nqbrkaya` | Produto Interno ou Escalar | `angulo-entre-vetores` | sim |
| `projecao-ortogonal.qmd` | `kezenkqr` | Projeção Ortogonal | tema próximo: `projecao-ortogonal` | não |
| `equacao-parametrica-reta.qmd` | `xrejqcsh` | Equação Paramétrica de Reta (1 de 2) | tema próximo: `equacao-vetorial-da-reta` | a confirmar (`EqParamRetaApp1_v1.ggb`) |
| `equacao-parametrica-reta.qmd` | `g8j8szyk` | Equação Paramétrica de Reta (2 de 2) | tema próximo: `equacao-vetorial-da-reta` | não |
| `posicao-relativa-circulos.qmd` | `y9vt9eca` | Posição Relativa entre Círculos | — | não |
