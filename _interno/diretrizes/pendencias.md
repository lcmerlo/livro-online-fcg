# Pendências

O que está em aberto no projeto: regras fundamentais adiadas, decisões a tomar, ajustes previstos, applets a reescrever e o que falta antes da divulgação. Cada item diz o que é, onde está e qual é o próximo passo. Quando um item se resolve, ele sai desta lista; se a solução for uma decisão, ela vai para `decisoes.md` (`diretrizes-tecnicas.md`, §2). Desvios no conteúdo dos protótipos não entram aqui: são refeitos na reescrita de cada capítulo (`diretrizes-tecnicas.md`, §1.4).

Última revisão: 2026-11-25 (fase 5 da migração).

## 1. Regras fundamentais adiadas

Adiadas por decisão do autor, com um marco para rever (`diretrizes-tecnicas.md`, §1.2).

Nenhuma desde 2026-11-25. A alternativa ao arraste (§4.4 das diretrizes; WCAG 2.5.7), adiada até o piloto, chegou com o sistema novo de applets (fase 5 da migração): todo applet tem, sem uma linha própria, as opções "Campos para digitar os pontos e os valores" e "Tocar no ponto e depois no destino" do painel de acessibilidade (`decisoes.md`).

## 2. Decisões a tomar

| Assunto | Opções | Como decidir |
|---|---|---|
| Formato dos números (reavaliar a convenção provisória de 2026-11-03: ponto decimal e vírgula entre coordenadas, `(2.5, 3)`) | manter, ou adotar a norma brasileira: vírgula decimal e `;` entre coordenadas, `(2,5; 3)` | escolha do autor; vale para applets e texto. Se mudar: `1{,}5` ou macro no KaTeX (sem isso, `$1,5$` aparece como "1, 5"), `;` nos pares numéricos dos capítulos revisados (nos protótipos, na reescrita), a formatação dos números nos applets, que fica num só lugar (`notation.decimal` e `notation.separator`, em `src/math/format.js`; os campos dos applets mostram o número com ela e já aceitam vírgula ou ponto) |
| Escrita de um valor indefinido que o applet não tratou (hoje "NaN", aprovado em 2026-11-04 como provisório; o sistema do livro-base, desde a fase 5, faz o mesmo) | manter "NaN"; ou outra expressão, como "indefinido" ou "não existe" no texto de estado e `\nexists` ou `\text{indefinido}` nas fórmulas | escolha do autor. O "NaN" não deveria chegar ao estudante: aparece só quando o applet esquece um caso especial, e é um sinal fácil de achar ao conferir os casos especiais (ficha de aceitação, §4.6 das diretrizes); uma palavra em português seria mais clara se escapar, mas se confundiria com o texto do caso tratado (hoje `text.finite` escreve "não existe"). Se mudar: `src/math/format.js`, também no livro-base, e §4.5 das diretrizes |
| Seta de vetor (dois comandos: `\vec{u}` para nome de uma letra e `\vet{AB}` para nome formado por dois pontos; desde 2026-11-25, `\vet` é o `\overrightarrow` com a seta ajustada do livro-base, decisão E6 de lá) | continuar com os dois, como no livro-base, ou um só comando com bom resultado nos dois casos (`\vec{AB}` deixa a seta curta) | escolha do autor; a seta de antes, a do KaTeX e a de agora estão lado a lado em `laboratorio/formulas.qmd`. Se um comando só for adotado: mudar `math/macros.json`, o `guia-editorial.md` §4 e os usos nos capítulos revisados (redefinir um dos dois nomes evita trocar o outro) |
| Cor de uma região preenchida nos applets (área, ângulo, paralelogramo). Desde a fase 5, os applets fazem o que o livro-base faz: a cor do papel com transparência (`--region-opacity`, 0.16, em `styles/tokens.scss`; `src/applet/theme.js`) | a cor do papel com transparência, que as diretrizes traziam até 2026-11-05 sem decisão registrada; o cinza do apoio com transparência; ou só o contorno, sem preenchimento | no primeiro applet que precisar, comparando na página de teste de cores, também com daltonismo simulado: o preenchimento não pode esconder os objetos de baixo nem confundir os papéis. Se adotada: registrar em `decisoes.md` e na §4.5 das diretrizes |
| Perguntas de revisão pedagógica de um capítulo | (a) três ou quatro perguntas opcionais no §8 do guia editorial, como "o objetivo está claro?", "cada applet tem uma pergunta associada?" e "a notação aparece antes de ser usada?"; (b) uma ficha completa | testar (a) no primeiro capítulo novo; a ficha completa fica adiada (2026-11-06) |

## 3. Ajustes técnicos previstos

| O quê | Por quê |
|---|---|
| Ferramentas de teste de cor como atributos do bloco `::: {.applet}`: `daltonismo="…"` (`board.emulateColorblindness`, do JSXGraph), `cinza` (`JXG.rgb2bw`) e `trocar="cor:cor …"` (troca as cores no quadro inteiro, para comparar paletas lado a lado sem mudar o applet) | propostas em 2026-11-04 junto com `paleta()` e deixadas para depois. Enquanto isso, o Chrome simula daltonismo na página inteira: Ferramentas do programador > Rendering > Emulate vision deficiencies |

## 4. Inconsistências registradas

| O quê | Onde | Próximo passo |
|---|---|---|
| O JSX-quarto usa 360 px como largura mínima; o livro, 320 px | JSX-quarto, `migracao/manual.qmd` | alinhar lá, se o autor quiser (fora deste repositório) |

## 5. Applets GeoGebra a reescrever em JSXGraph

Inventário para a reescrita dos capítulos: todos serão substituídos por applets JSXGraph próprios (`diretrizes-tecnicas.md`, §4), na reescrita do capítulo em que estão. Desde 2026-11-22, os capítulos da primeira coluna estão em `_interno/oficina/nao-publicados/`, como modelo para os novos, e nenhum deles está no site. Na coluna "No JSX-quarto", um nome indica um applet já migrado do mesmo material, ponto de partida para a ideia; "tema próximo" indica um applet migrado de outro material sobre o mesmo assunto. A coluna "Original" diz se o `.ggb` está na pasta `AppletsGGB/` do autor; os demais podem ser baixados em `geogebra.org/m/<material>`.

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

## 6. Antes da divulgação

O que precisa estar pronto antes de divulgar o livro ao público-alvo. Até lá, esses itens podem esperar (`diretrizes-tecnicas.md`, §1.3).

| O quê | Onde | Próximo passo |
|---|---|---|
| Nomes públicos estáveis | arquivos de capítulo, rótulos, ids (`diretrizes-tecnicas.md`, §7) | fixar os nomes; depois da divulgação, renomear um capítulo só com `aliases` |
| Licença do conteúdo e do código | `README.md`, Princípios §43 | definir |
| Licença das fontes | `vendor/fonts/` (Princípios §43). O carregamento foi resolvido em 2026-11-24: as fontes vêm do site, só o recorte latino das faces usadas, com a licença SIL OFL 1.1. Três dúvidas, pelo FAQ da OFL (openfontlicense.org): (a) a Source Serif 4 tem o nome reservado "Source" (está no próprio arquivo), e um recorte conta como versão modificada (FAQ 2.6 a 2.8), que não pode usar o nome reservado sem acordo com o autor, a Adobe; o Google Fonts e o fontsource servem recortes com o nome, mas não se sabe se o acordo deles vale para quem copia os arquivos. A Atkinson Hyperlegible não tem nome reservado; (b) servir a fonte é distribuí-la (FAQ 2.1), e o texto da licença não vai ao site; (c) o arquivo de licença da Source Serif 4, do fontsource, traz a linha de copyright errada ("Google Inc."); a certa está dentro da fonte ("© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’") | resolver antes da publicação aberta. Saídas: (a) os WOFF2 inteiros da Adobe, sem modificação (mais pesados), outro nome nos arquivos do recorte ou um pedido à Adobe; (b) publicar as licenças com o site (`resources` em `_quarto.yml`); (c) corrigir a linha, também no `livro-base`, de onde vêm os arquivos |
| Nova medição do contraste | medição de 04/10/2026 (Princípios §32); `_brand.yml` e os estilos (hoje em `styles/`) mudaram depois. As cores lidas pelos applets são conferidas pelo verificador desde 2026-11-04. Em 2026-11-25 (fase 4 da migração), os títulos passaram a `gray-5`, e o axe-core (WCAG 2.2 A e AA) não achou falta de contraste de texto na Apresentação nem nas páginas do laboratório, a 1280 e a 320 px | medir de novo os pares de cor de bordas e refazer a tabela dos Princípios, §32 |
| Teste num celular real | o toque só foi conferido no Chrome, com toque simulado (formas dos pontos, rolagem da página, área de captura, pontos dentro do quadro; 2026-11-03 e 2026-11-04; controles, 2026-11-05; os applets do livro-base, lá, e os do laboratório, na fase 5); também é um item da lista "Antes da fase 5" do plano de migração do livro-base | conferir num celular, de preferência um iPhone e um Android: rodar `quarto preview --profile lab --host 0.0.0.0` e abrir no celular, na mesma rede Wi-Fi, o endereço do computador com a porta da prévia, na página Teste dos controles. Conferir: o dedo fora dos pontos rola a página; tocar um pouco ao lado de um ponto o arrasta; a pinça amplia a página, e não o plano; o anel aparece mais largo; nenhum ponto sai do quadro; a faixa de valores anda com o dedo; com "Tocar no ponto e depois no destino", o ponto vai aonde se toca; o teclado do campo tem o sinal de menos |
| Por último: retirar o aviso "Material em construção. Uso não recomendado no momento!" | `book.announcement`, em `_quarto.yml` | apagar o `announcement` de `book` na divulgação ao público-alvo |
