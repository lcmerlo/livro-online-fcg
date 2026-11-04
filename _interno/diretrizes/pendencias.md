# Pendências

O que está em aberto no projeto: requisitos ainda não cumpridos, decisões a tomar, ajustes previstos e applets a reescrever. Cada item diz o que é, onde está e qual é o próximo passo. Quando um item se resolve, ele sai desta lista; se a solução for uma decisão, ela vai para `decisoes.md` (`diretrizes-tecnicas.md`, §2).

Última revisão: 2026-11-04.

## 1. Requisitos ainda não cumpridos

| O quê | Onde | Próximo passo |
|---|---|---|
| Toque conferido só no Chrome, com toque simulado (formas dos pontos, rolagem da página, área de captura, pontos dentro do quadro; 2026-11-03 e 2026-11-04) | amostra em `applets-src/index.html` | conferir num celular, de preferência um iPhone e um Android: rodar `(cd applets-src && npm run dev -- --host)` e abrir no celular, na mesma rede Wi-Fi, o endereço "Network" que o Vite mostra. Conferir: o dedo fora dos pontos rola a página; tocar um pouco ao lado de um ponto o arrasta; a pinça amplia a página, e não o plano; o anel aparece mais largo; nenhum ponto sai do quadro |
| Imagens sem texto alternativo (11 avisos do verificador em 2026-11-02) | vários capítulos | escrever o `fig-alt` ao revisar cada imagem (`guia-editorial.md`, §5) |
| Contraste de texto e bordas medido antes das últimas mudanças de cor | medição de 04/10/2026 (§32); `_brand.yml` e `custom.scss` mudaram depois. As cores lidas pelos applets são conferidas pelo verificador desde 2026-11-04 | medir de novo os pares de cor de texto e de bordas |
| Licença do conteúdo e do código | `README.md`, §43 | definir antes da divulgação pública |
| Aviso de licença do JSXGraph no bundle | `applets-livro.iife.js` (a minificação remove o aviso) | manter o aviso no build |
| Licença e carregamento das fontes | `_brand.yml` (§43) | confirmar |

## 2. Decisões a tomar

| Assunto | Opções | Como decidir |
|---|---|---|
| Opções de acessibilidade ativadas pelo leitor (pedido do autor em 2026-11-03): alternativas como campos de coordenadas apareceriam só para quem as escolher, deixando o layout padrão enxuto | (a) painel único de preferências no site, lembrado pelo navegador (`localStorage`), lido pelos applets; (b) um botão "Mostrar controles alternativos" em cada applet; (c) tudo sempre visível (atual) | piloto com o primeiro applet que precisar da alternativa ao arraste (campos para as coordenadas, por exemplo). Pontos a resolver: a opção precisa ser fácil de achar e operável por teclado, pois o critério 2.5.7 exige que a alternativa esteja disponível; respeitar preferências do sistema quando existirem (`prefers-reduced-motion`, `prefers-contrast`); a escolha vale para todo o livro; custo de manutenção de mais um estado. Se adotada: registrar em `decisoes.md` e atualizar §4 das diretrizes e a ficha de aceitação |
| Formato dos números (reavaliar a convenção provisória de 2026-11-03: ponto decimal e vírgula entre coordenadas, `(2.5, 3)`) | manter, ou adotar a norma brasileira: vírgula decimal e `;` entre coordenadas, `(2,5; 3)` | escolha do autor; vale para applets e texto. Se mudar: `1{,}5` ou macro no MathJax (sem isso, `$1,5$` aparece como "1, 5"), `;` nos ~88 pares numéricos dos capítulos, a formatação dos números nos applets, que fica num só lugar (`numero`, em `applets-src/src/tools/formatar.js`), e campos de digitação que aceitem vírgula |
| Escrita de um valor indefinido que o applet não tratou (hoje "NaN", aprovado em 2026-11-04 como provisório) | manter "NaN"; ou outra expressão, como "indefinido" ou "não existe" no texto de estado e `\nexists` ou `\text{indefinido}` nas fórmulas | escolha do autor. O "NaN" não deveria chegar ao estudante: aparece só quando o applet esquece um caso especial, e é um sinal fácil de achar ao conferir os casos especiais (ficha de aceitação, §4.6 das diretrizes); uma palavra em português seria mais clara se escapar, mas se confundiria com o texto do caso tratado (hoje `texto.finito` escreve "não existe"). Se mudar: `numero` e `criarExpressao` em `applets-src/src/tools/formatar.js` e §4.5 e §4.7 das diretrizes |
| Seta de vetor (hoje dois comandos: `\vec{u}` para nome de uma letra e `\vet{AB}` para nome formado por dois pontos) | continuar com os dois, ou um só comando com bom resultado nos dois casos (`\vec{AB}` deixa a seta curta; `\overrightarrow{AB}` não agradou ao autor) | escolha do autor, comparando variantes no MathJax; as tentativas até 2026-11-03 (`_interno/oficina/testes/teste.qmd`) não deram resultado satisfatório. Se um comando só for adotado: mudar `components/macros.html`, o `guia-editorial.md` §4 e os usos nos capítulos (458 `\vec` e 26 `\vet`; redefinir um dos dois nomes evita trocar o outro) |
| Tamanho da fonte e entrelinha | `_brand.yml` define 1,0625rem e 1,6; `custom.scss` define 1,05rem e 1,65, e hoje prevalece | escolher os valores e mantê-los num só arquivo (`diretrizes-tecnicas.md`, §6) |
| Modelo de cor dos applets | por papel didático (atual); papéis enxutos (dado, resultado e apoio, com `azul-8`, `laranja-2` e `cinza-5`); neutro com um só destaque; ou por identidade do objeto (JSX-quarto) | comparação na página `_interno/oficina/testes/teste-cores.qmd` (a mesma soma de vetores nos quatro modelos, lado a lado, com as pontas ligadas; 2026-11-04), outros testes com `paleta()` (`arquitetura.md`, §7) e piloto, conferidos pela ficha de aceitação e com simulação de daltonismo. Na medição de 2026-11-04, três pares da paleta atual se confundem com daltonismo: principal × construção (`azul-8` × `roxo-2`), invariante × erro (`laranja-2` × `vermelho-5`) e manipulável × auxiliar (`verde-5` × `cinza-5`) |
| Tons `-suave` abaixo de 3:1 sobre o fundo do quadro: `--cor-constr-suave` (`roxo-1`, 2,72:1) e `--cor-aux-suave` (`cinza-4`, 2,56:1); o verificador avisa desde 2026-11-04 | reservar os tons suaves a preenchimentos, sem linhas nem pontos; escurecer os dois; ou decidir junto com o modelo de cor, que pode dispensar os tons | nenhum applet usa os tons suaves hoje; decidir antes do primeiro que precisar deles ou com o modelo de cor |
| Motor de fórmulas | MathJax (atual) ou KaTeX | piloto: macros, prévias de referências cruzadas e rótulos do JSXGraph |
| Caso paralelo na combinação linear | tornar o caso alcançável (encaixe na grade ou no ângulo) ou não | decisão didática do autor, depois do piloto |

## 3. Ajustes técnicos previstos

| O quê | Por quê |
|---|---|
| Controles dos applets (faixas, botões, caixas de seleção, campos), adaptados da `lib/ui.js` do JSX-quarto, como uma parte `.controles` do bloco `::: {.applet}`, com a posição deles na página | a alternativa ao arraste (§4.4 das diretrizes) depende deles; a etapa 3 (2026-11-04) deixou os controles e a posição deles para quando o primeiro applet precisar, provavelmente o piloto |
| Piloto: combinação linear (2 de 2) reescrita em JSXGraph, no projeto de testes (`_interno/oficina/testes/`) | responde às hipóteses da seção 2 |
| Ferramentas de teste de cor como atributos do bloco `::: {.applet}`: `daltonismo="…"` (`board.emulateColorblindness`, do JSXGraph), `cinza` (`JXG.rgb2bw`) e `trocar="cor:cor …"` (troca as cores no quadro inteiro, para comparar paletas lado a lado sem mudar o applet) | propostas em 2026-11-04 junto com `paleta()` e deixadas para depois. Enquanto isso, o Chrome simula daltonismo na página inteira: Ferramentas do programador > Rendering > Emulate vision deficiencies |

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
