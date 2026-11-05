# Pendências

O que está em aberto no projeto: requisitos ainda não cumpridos, decisões a tomar, ajustes previstos e applets a reescrever. Cada item diz o que é, onde está e qual é o próximo passo. Quando um item se resolve, ele sai desta lista; se a solução for uma decisão, ela vai para `decisoes.md` (`diretrizes-tecnicas.md`, §2).

Última revisão: 2026-11-05.

## 1. Requisitos ainda não cumpridos

| O quê | Onde | Próximo passo |
|---|---|---|
| Toque conferido só no Chrome, com toque simulado (formas dos pontos, rolagem da página, área de captura, pontos dentro do quadro; 2026-11-03 e 2026-11-04) | amostra em `applets-src/index.html` | conferir num celular, de preferência um iPhone e um Android: rodar `(cd applets-src && npm run dev -- --host)` e abrir no celular, na mesma rede Wi-Fi, o endereço "Network" que o Vite mostra. Conferir: o dedo fora dos pontos rola a página; tocar um pouco ao lado de um ponto o arrasta; a pinça amplia a página, e não o plano; o anel aparece mais largo; nenhum ponto sai do quadro |
| Alternativa ao arraste (§4.4 das diretrizes; WCAG 2.5.7) em todos os applets com pontos arrastáveis: nenhum a tem. Por decisão do autor (2026-11-04, reafirmada em 2026-11-05), ela será decidida no futuro, para todos os applets de uma vez; até lá, um applet novo segue sem ela. Hoje: `teste-cores` (pontas de u e v), a amostra e o exemplo de várias partes da página de desenvolvimento; nenhum está num capítulo | `applets-src/src/applets/`, `applets-src/index.html`, `applets-src/src/exemplos/` | decidir o mecanismo (§2, opções de acessibilidade ativadas pelo leitor) e fazer os controles (§3). Até lá, cada applet novo com arraste entra nesta linha, e a ficha de aceitação dele registra o item como pendente |
| Imagens sem texto alternativo (11 avisos do verificador em 2026-11-02) | vários capítulos | escrever o `fig-alt` ao revisar cada imagem (`guia-editorial.md`, §5) |
| Contraste de texto e bordas medido antes das últimas mudanças de cor | medição de 04/10/2026 (§32); `_brand.yml` e `custom.scss` mudaram depois. As cores lidas pelos applets são conferidas pelo verificador desde 2026-11-04 | medir de novo os pares de cor de texto e de bordas |
| Licença do conteúdo e do código | `README.md`, §43 | definir antes da divulgação pública |
| Aviso de licença do JSXGraph no bundle | `applets-livro.iife.js` (a minificação remove o aviso) | manter o aviso no build |
| Licença e carregamento das fontes | `_brand.yml` (§43) | confirmar |

## 2. Decisões a tomar

| Assunto | Opções | Como decidir |
|---|---|---|
| Opções de acessibilidade ativadas pelo leitor (pedido do autor em 2026-11-03): alternativas como campos de coordenadas apareceriam só para quem as escolher, deixando o layout padrão enxuto | (a) painel único de preferências no site, lembrado pelo navegador (`localStorage`), lido pelos applets; (b) um botão "Mostrar controles alternativos" em cada applet; (c) tudo sempre visível (atual) | piloto com o primeiro applet que precisar da alternativa ao arraste (campos para as coordenadas, por exemplo). Pontos a resolver: a opção precisa ser fácil de achar e operável por teclado, pois o critério 2.5.7 exige que a alternativa esteja disponível; respeitar preferências do sistema quando existirem (`prefers-reduced-motion`, `prefers-contrast`); a escolha vale para todo o livro; custo de manutenção de mais um estado. Se adotada: registrar em `decisoes.md` e atualizar §4 das diretrizes e a ficha de aceitação |
| Formato dos números (reavaliar a convenção provisória de 2026-11-03: ponto decimal e vírgula entre coordenadas, `(2.5, 3)`) | manter, ou adotar a norma brasileira: vírgula decimal e `;` entre coordenadas, `(2,5; 3)` | escolha do autor; vale para applets e texto. Se mudar: `1{,}5` ou macro no KaTeX (sem isso, `$1,5$` aparece como "1, 5"), `;` nos ~88 pares numéricos dos capítulos, a formatação dos números nos applets, que fica num só lugar (`numero`, em `applets-src/src/tools/formatar.js`), e campos de digitação que aceitem vírgula |
| Escrita de um valor indefinido que o applet não tratou (hoje "NaN", aprovado em 2026-11-04 como provisório) | manter "NaN"; ou outra expressão, como "indefinido" ou "não existe" no texto de estado e `\nexists` ou `\text{indefinido}` nas fórmulas | escolha do autor. O "NaN" não deveria chegar ao estudante: aparece só quando o applet esquece um caso especial, e é um sinal fácil de achar ao conferir os casos especiais (ficha de aceitação, §4.6 das diretrizes); uma palavra em português seria mais clara se escapar, mas se confundiria com o texto do caso tratado (hoje `texto.finito` escreve "não existe"). Se mudar: `numero` e `criarExpressao` em `applets-src/src/tools/formatar.js` e §4.5 e §4.7 das diretrizes |
| Seta de vetor (hoje dois comandos: `\vec{u}` para nome de uma letra e `\vet{AB}` para nome formado por dois pontos) | continuar com os dois, ou um só comando com bom resultado nos dois casos (`\vec{AB}` deixa a seta curta; `\overrightarrow{AB}` não agradou ao autor) | escolha do autor, comparando variantes no KaTeX, o motor do livro desde 2026-11-05; as tentativas até 2026-11-03 (`_interno/oficina/testes/teste.qmd`), feitas no MathJax, não deram resultado satisfatório; a comparação precisa ser refeita no KaTeX. Se um comando só for adotado: mudar `components/macros.html`, o `guia-editorial.md` §4 e os usos nos capítulos (458 `\vec` e 26 `\vet`; redefinir um dos dois nomes evita trocar o outro) |
| Tamanho da fonte e entrelinha | `_brand.yml` define 1,0625rem e 1,6; `custom.scss` define 1,05rem e 1,65, e hoje prevalece | escolher os valores e mantê-los num só arquivo (`diretrizes-tecnicas.md`, §6) |
| Cor de uma região preenchida nos applets (área, ângulo, paralelogramo) | a cor do papel com transparência, que as diretrizes traziam até 2026-11-05 sem decisão registrada; o cinza do apoio com transparência; ou só o contorno, sem preenchimento | no primeiro applet que precisar, comparando na página de teste de cores, também com daltonismo simulado: o preenchimento não pode esconder os objetos de baixo nem confundir os papéis. Se adotada: registrar em `decisoes.md` e na §4.5 das diretrizes |
| Caso paralelo na combinação linear | tornar o caso alcançável (encaixe na grade ou no ângulo) ou não | decisão didática do autor, depois do piloto |

## 3. Ajustes técnicos previstos

| O quê | Por quê |
|---|---|
| Controles dos applets (faixas, botões, caixas de seleção, campos), adaptados da `lib/ui.js` do JSX-quarto, com a posição deles na página. Plano aprovado em 2026-11-05: §3.1 | a alternativa ao arraste (§4.4 das diretrizes) depende deles (§1); a etapa 3 (2026-11-04) deixou os controles e a posição deles para quando o primeiro applet precisar; o autor pediu que fossem feitos antes |
| Piloto: combinação linear (2 de 2) reescrita em JSXGraph, no projeto de testes (`_interno/oficina/testes/`) | responde às hipóteses da seção 2 |
| Ferramentas de teste de cor como atributos do bloco `::: {.applet}`: `daltonismo="…"` (`board.emulateColorblindness`, do JSXGraph), `cinza` (`JXG.rgb2bw`) e `trocar="cor:cor …"` (troca as cores no quadro inteiro, para comparar paletas lado a lado sem mudar o applet) | propostas em 2026-11-04 junto com `paleta()` e deixadas para depois. Enquanto isso, o Chrome simula daltonismo na página inteira: Ferramentas do programador > Rendering > Emulate vision deficiencies |
| Retirar o aviso "Material em construção. Uso não recomendado no momento!" (`website.announcement`, em `_quarto.yml`) | o aviso vale só enquanto o livro está em testes; sai na divulgação ao público-alvo |

### 3.1 Plano dos controles (aprovado em 2026-11-05)

Branch `controles`. Começar por ler `diretrizes-tecnicas.md` §4, `arquitetura.md` §4.5 e §7, `guia-editorial.md` §6, e no JSX-quarto `lib/ui.js`, `lib/core.js` (`state`, `animate`), `styles/jsxgraph.scss` (bloco "Controles e leituras") e `estudo/10-layout.qmd` (§5.3 e §7).

**Diagnóstico.** A `lib/ui.js` tem faixa, caixa de seleção, botões de opção, botão ▶/⏸, campo numérico e painel. Todos dependem de duas peças de `lib/core.js` que o livro não tem: o estado (os valores que o estudante controla; mudar um valor redesenha os quadros e atualiza os controles) e a animação. Na adaptação, cinco diferenças:

1. Campo numérico: a lib usa `type="number"`, cujo separador decimal varia com o navegador e o idioma da página (`pt-BR`; o Firefox pode mostrar e exigir `1,5`). No livro: campo de texto com `inputmode="decimal"`, que aceita `1.5` e `1,5` e mostra o valor com `numero()` de `formatar.js`.
2. Leitor de tela: na lib, o nome da faixa muda a cada valor, e o botão ▶ troca de texto e ainda usa `aria-pressed` ("Pausar, pressionado"). No livro: nome fixo (`aria-label`, texto simples), valor em `aria-valuetext` (texto simples, de `texto.*`), TeX visível com `aria-hidden`; botão sem `aria-pressed`, só o texto muda; símbolos ▶/⏸ com `aria-hidden`.
3. Animação: a lib permite começar sozinha (o applet seno-cosseno começa animado). No livro (§4.4), só pelo botão; ela para quando outro código muda o mesmo valor (o estudante mexe na faixa) e no reinício. Com "Reduzir movimento", o botão continua funcionando, porque a animação só começa a pedido do estudante (leitura do §4.4 aprovada pelo autor).
4. Cor: a lib usa a identidade do objeto; no livro, a faixa usa o papel dado (`--cor-dado`), "o que o estudante controla".
5. Nomes em português.

**Plano.**

1. `src/tools/estado.js` (novo): `criarEstado(valoresIniciais, ...quadros)`, com leitura e escrita por chave, `on(ouvinte)` e `reiniciar()` (volta tudo ao início e avisa todos os ouvintes, mesmo sem mudança de valor); `criarAnimacao(estado, chave, { min, max, velocidade, modo })`, com `tocar`, `pausar`, `alternar`, `tocando`, `on`.
2. `src/tools/controles.js` (novo): `criarFaixa`, `criarCaixa` (caixa de seleção), `criarCampo` (campo numérico), `criarBotao` (ação qualquer) e `criarBotaoAnimacao` (Animar/Pausar). Cada controle recebe a parte onde fica, o estado e a chave; sem função de painel.
3. Posição:
   - por padrão, os controles ficam logo abaixo do quadro: quando o capítulo não escreveu uma parte de controles, o próprio `controles.js` cria o contêiner (`div.applet-controles`) logo antes do texto de estado (`<id>-status`). Assim, o applet de um quadro com controles continua no shortcode `{{< applet >}}`, e esquecer a parte não faz os controles sumirem. O filtro e `main.js` não mudam para isso;
   - a parte `.controles` do bloco `::: {.applet}` (`applet-bloco.lua`, como `.quadro` e `.leitura`: vira `div.applet-controles` com `data-parte`) põe os controles em outro lugar: em cima, ou ao lado do quadro, numa célula da grade. Se as fórmulas dos controles precisarem do KaTeX, a parte recebe a fórmula invisível `{}`, como a leitura;
   - uma parte por lugar, sem painel por linha: os controles seguem a ordem do código (que é também a da tecla Tab) e passam para a linha de baixo quando não cabem;
   - `.centro` centraliza os controles; no shortcode, `arranjo="centro"` vale para o quadro e para os controles.
4. Aparência (`custom.scss`, seção dos applets): cursor da faixa igual ao ponto arrastável (disco com anel, medidas `--applet-…`, cor do dado; anel reforçado sob o cursor e com o foco, mais o contorno de foco do site), trilho fino e trecho grosso até o valor, como no JSX-quarto; área de toque de pelo menos 24 px (WCAG 2.5.8); faixa que encolhe numa célula estreita; botões com a aparência do "Reiniciar"; a parte nova entra nas regras de margem existentes (`.grid > …`), sem refazer o CSS atual. Repetir em `applets-src/index.html` o que a página de desenvolvimento precisar.
5. Teste: applet `src/applets/teste-controles.js` (para nenhum capítulo, como `teste-cores`), numa página de `_interno/oficina/testes/` e na página de desenvolvimento: vetor u arrastável e o vetor a·u, com faixa e campo para a (um acompanha o outro), uma caixa de seleção e o botão Animar. Quatro arranjos: shortcode com controles embaixo; bloco com controles ao lado do quadro; controles em cima; quadro estreito centralizado. Conferir no Chrome a 320, ~800 e 1200 px e nas larguras intermediárias em que o menu lateral aparece, só com o teclado, com toque simulado, com o reinício (pontos, valores e animação) e com "Reduzir movimento"; ficha de aceitação (`diretrizes-tecnicas.md` §4.6) no que couber.
6. Documentos: `diretrizes-tecnicas.md` §4.5 (substituir a frase "Os controles … entram quando o livro tiver controles") e §4.7 (linha "Controles"); `guia-editorial.md` §6 (duas linhas na tabela de arranjos: controles em outro lugar; controles ao lado do quadro); `arquitetura.md` §3, §4.3, §4.5, §5.3 e §7; `README.md` e `AGENTS.md` se citarem o assunto; `cspell.json`; este item sai da §3, e a linha da alternativa ao arraste (§1) passa a dizer que os controles existem; uma linha em `decisoes.md`.

**Fora do plano**, por decisão de 2026-11-05: coluna automática numa célula da grade (a quebra de linha basta), espaçamento único no bloco (mexeria no CSS da etapa 3 sem ganho atual), botões de opção e faixa vertical (entram quando um applet precisar), texto contornando o quadro, texto em colunas e applet na margem, e a alternativa ao arraste (adiada, §1).

**Custo e como desfazer:** dois arquivos novos (cerca de 100 e 200 linhas), algumas dezenas de linhas de CSS e o tipo de parte novo no filtro. Para desfazer, apagar os dois arquivos, a parte `.controles` e o CSS dos controles; nada fora dos applets depende deles.

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
