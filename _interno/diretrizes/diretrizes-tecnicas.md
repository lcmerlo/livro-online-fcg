# Diretrizes técnicas

Orientações para desenvolver o livro: applets, código, estilos, verificação e publicação, e o modo de tomar e aplicar decisões. Servem a quem escreve, a quem programa e aos assistentes de IA, para quem o `AGENTS.md` resume este documento.

O projeto está em fase de testes. Por isso, estas diretrizes **orientam sem engessar**: dizem o quê e o porquê, deixam o como para o código, e só uma lista curta de regras fundamentais fica fixa; o resto é provisório (§1). A justificativa pedagógica está no documento de Princípios (§ entre parênteses); a escrita de capítulos, no `guia-editorial.md`.

## 1. Como usar estas diretrizes

### 1.1 O quê e o porquê, não o como

Estas diretrizes dizem **o quê** e **o porquê**. **O como** (medidas, nomes de funções, valores, a construção passo a passo) fica no próprio código, numa variável ou num comentário onde o valor é usado. O `arquitetura.md` diz onde procurar e guarda as receitas passo a passo, sem copiar o código.

**Critério:** uma frase só fica nas diretrizes se continuasse valendo com o código reescrito do zero.

| Fica (o quê) | Sai (o como) |
|---|---|
| O ponto que se move se distingue do fixo pela forma, e o texto também diz | disco com anel, `pontoArrastavel`, 10 px e 25 px |
| Nenhum número enganoso nos applets | a escrita "NaN", `finito`, `casos` |
| A notação é definida num só lugar | `math/macros.json`, `filters/macros.lua` |
| Ângulos notáveis aparecem como fração de π | denominadores de 1 a 9 ou 12 |

Assim, trocar um valor ou uma técnica (25 px por 30 px, por exemplo) é uma mudança de código, com commit, sem decisão registrada nem edição destas diretrizes.

### 1.2 Regras fundamentais e provisórias

- **Fundamentais** são as da lista do §1.3, aprovada pelo autor. Ninguém faz diferente sem uma decisão do autor. Se uma delas não puder ser cumprida agora, o autor pode adiá-la, com registro em `pendencias.md` e um marco para rever (o piloto, a divulgação), sem exigir uma data.
- **Todo o resto é provisório**, pela regra **"siga ou explique"**: vale por padrão; se atrapalhar o que foi pedido, faz-se diferente e explica-se o porquê no commit e na resposta ao autor. Um desvio que se repete vira proposta de mudar a regra.
- **Por que uma regra é fundamental:** pelo dano ao estudante com o livro em uso, pelo custo alto de corrigir depois ou pela escolha explícita do autor. A regra fixa o objetivo, não a forma de cumpri-lo.
- **Código que funciona** não se muda sem pedido, a menos que a mudança mostre ganho real (§1.6).
- **Valem para todo o material do livro:** o código, os capítulos, as páginas da raiz e o laboratório. Os capítulos antigos, guardados como modelo fora do livro, ficam como estão (§1.4).

### 1.3 As regras fundamentais

Em cada item, "flexível" diz o que não fica preso.

**Para proteger o estudante**

1. **Matemática correta, aprovada pelo autor; no applet, a figura, os números e o texto saem da mesma conta**, feita uma vez só. As fórmulas no código do applet também são matemática. Flexível: como o código organiza as contas.
2. **Nenhum número enganoso nos applets.** Cada caso especial (vetor nulo, divisão por zero) tem um comportamento escolhido antes, como "o ângulo não está definido quando um dos vetores é nulo". Flexível: a frase de cada caso.
3. **Fórmulas como texto; notação definida num só lugar.** Como texto, a fórmula se ajusta ao celular, o leitor de tela a lê, e corrigir é editar; num só lugar, mudar um símbolo em todo o livro é mudar uma linha. Flexível: quais comandos usar e o formato dos números.
4. **Acessibilidade mínima (§32):** tudo funciona pelo teclado; quem navega com Tab vê onde está; a página funciona a 320 px de largura, sem rolar para o lado; a cor não é a única informação (forma, nome ou texto também distinguem). São fundamentais porque sairiam caros de acrescentar depois, embutidos nos applets e nas páginas. Flexível: o jeito de cumprir cada item.
   - Contraste e títulos sem saltos são provisórios: as cores estão definidas num só lugar, e o verificador confere os títulos e o contraste das cores dos applets.
   - O texto alternativo das imagens fica para antes da divulgação (`pendencias.md`, §6); toda imagem nova já nasce com ele.
   - Inclui a alternativa ao arraste: toda ação de arraste também se faz sem arrastar, com as opções "Campos para digitar os pontos e os valores" e "Tocar no ponto e depois no destino" do painel de acessibilidade, que valem para todo applet sem código nele (desde a fase 5 da migração, 2026-11-25).
5. **Animação só a pedido do estudante:** nenhum applet se move sozinho, e o movimento pode ser pausado. Flexível: velocidade, aparência do botão, quais applets animam.
6. **Conteúdo separado da aparência; cada valor definido num só lugar.** O capítulo diz o que um trecho é, com as classes do guia, e nunca como ele aparece; cada cor ou tamanho é definido uma vez. Flexível: os próprios valores (cores, tamanhos, layout).
7. **O site publicado funciona:** o livro e o laboratório renderizam e passam nas verificações sem erros (§8).

**Por escolha do autor**

8. **O autor decide a matemática, o texto didático e a estrutura do livro** (§2.1). Quem propõe espera a aprovação.
9. **Applets JSXGraph próprios, sem rastros do GeoGebra** (§4.2); imitar o GeoGebra só a pedido explícito. Flexível: como cada applet é construído.
10. **Uma decisão só termina quando todo o material concorda com ela** (§2.3), menos os capítulos antigos guardados como modelo (§1.4).

**Para evitar um custo que cresce**

11. **Programa de terceiros que chega ao estudante só entra por decisão do autor** (§3): o navegador do estudante o baixa, ele pesa no carregamento, pode falhar e tem licença. Ferramentas que só rodam no computador de quem desenvolve não precisam dessa decisão.

**A partir da divulgação**

12. **Endereços estáveis e licenças** (§7). Antes da divulgação, reorganizar sai barato; depois, mudar o nome de um capítulo ou de um rótulo quebra links salvos. As licenças dizem quem pode copiar e reaproveitar texto e código.

### 1.4 Os capítulos antigos

Os 20 capítulos de antes da reescrita estão em `_interno/oficina/nao-publicados/`, fora do livro, como modelo (decisão do autor, 2026-11-22). Nenhum projeto os renderiza, e as verificações não os leem: não se apontam nem se corrigem desvios neles, e eles não vão para revisões nem para `pendencias.md`. A linha `estado: prototipo` do cabeçalho deles é de antes e não tem mais efeito.

Os capítulos novos nascem em `capitulos/`, escritos do zero, e todas as diretrizes valem para eles desde o primeiro rascunho. Um capítulo novo do mesmo assunto de um antigo pode reaproveitar o nome do arquivo: o endereço continua valendo.

### 1.5 Documentos

| Documento | Responde a | Muda quando |
|---|---|---|
| `Princípios e Especificações Operacionais-26-10-03.md` | Por que (aprendizagem, acessibilidade) e o que a fase inicial deve alcançar | o autor revê um princípio ou uma meta da fase |
| `guia-editorial.md` | Como escrever e revisar um capítulo | muda um componente ou uma convenção de escrita |
| `diretrizes-tecnicas.md` (este) | O quê e o porquê do desenvolvimento, e como decidir | muda uma regra ou o processo |
| `arquitetura.md` | Como o projeto é hoje e onde está o como: as pastas, o caminho de uma página, as verificações, os comandos, as receitas | o código muda (o mapa acompanha) |
| `decisoes.md` | O que foi decidido, quando e por quê | a cada decisão |
| `pendencias.md` | O que está em aberto: regras fundamentais adiadas, decisões a tomar, o que falta antes da divulgação, applets a reescrever | algo é descoberto ou resolvido |
| `AGENTS.md`, `.github/copilot-instructions.md` | Resumo para assistentes de IA | estas diretrizes mudam |
| `README.md` | Apresentação do projeto e comandos | comandos ou estrutura mudam |

Material de referência, que não orienta o trabalho atual, em `_interno/referencia/`: `relatorio-design-pedagogico-26-05-14.qmd` (fonte dos Princípios) e `biblioteca-estruturas-site-diretrizes.qmd` (padrões anteriores a outubro de 2026).

**Quando dois documentos divergem**, a divergência é um defeito: corrija-a na mesma mudança em que ela for notada ou registre-a em `pendencias.md`. Até a correção:

- a decisão mais recente de `decisoes.md` vale sobre o texto mais antigo;
- os princípios pedagógicos (Parte 1 dos Princípios) orientam todas as decisões; uma decisão que se afaste deles diz isso e ajusta o texto;
- sobre como o projeto é, o código é o fato, e `arquitetura.md` é corrigido para acompanhá-lo.

### 1.6 Mexer em código que funciona

Sem pedido, código que funciona só muda quando a mudança mostra ganho real. Conta como ganho o que se pode mostrar:

| Ganho | Como se mostra |
|---|---|
| Corrige um comportamento: erro, caso especial, tela estreita, teclado, contraste | o caso que falhava e agora funciona |
| Melhora a experiência do estudante: clareza, legibilidade, desempenho | a comparação antes e depois |
| Remove código, arquivo ou dependência sem perder clareza | o diff |
| Elimina uma duplicação que existe | os dois lugares |
| Atende a um segundo uso que já existe | o segundo uso |

Não contam: mudar por gosto, trocar uma ferramenta por outra equivalente sem um problema a resolver, criar abstração para um uso que talvez venha. O critério foi adaptado do manual de migração do JSX-quarto (§4.7).

## 2. Decisões

### 2.1 Quem decide

- **Conteúdo matemático, texto didático e estrutura do livro:** o autor responsável. Hoje o projeto tem um só membro, que acumula autoria e revisão.
- **Questões técnicas:** quem propõe (pessoa ou assistente de IA) explica em linguagem simples o problema, as opções (no máximo três), a recomendação, o que muda para o estudante, o custo de manutenção e como desfazer. O autor decide pelas consequências; não precisa avaliar o código.

### 2.2 Registrar

Cada decisão vira uma linha em `decisoes.md`: data, decisão, motivo e material ajustado. Uma decisão substituída não é apagada: recebe a marca *substituída em AAAA-MM-DD*.

Mudanças que não criam nem alteram uma regra (trocar um valor, corrigir um erro, ajustar um texto) não precisam de registro: bastam o commit e sua mensagem.

### 2.3 Aplicar a todo o material

**Uma decisão só está concluída quando todo o material do projeto estiver de acordo com ela** (regra fundamental 10), menos os capítulos antigos (§1.4). Na mesma mudança:

1. Procure o que a decisão afeta, pelo termo antigo: `git grep -n -i "termo"`.
2. Ajuste cada lugar. Onde procurar:
   - diretrizes (`_interno/diretrizes/`), `README.md`, `AGENTS.md`, `.github/copilot-instructions.md`;
   - modelos de capítulo e páginas de teste (`laboratorio/`);
   - capítulos, `index.qmd` e `acessibilidade.qmd`;
   - filtros (`filters/`), estilos (`_brand.yml`, `styles/`), o que roda nas páginas (`src/`) e applets (`applets/`);
   - verificações (`tests/check-site.mjs`, `tests/browser.mjs`, `tests/unit/`, `.github/workflows/publish.yml`) e o dicionário do corretor (`cspell.json`).
3. Registre em `decisoes.md` o que foi ajustado.

Quando o ajuste não cabe numa mudança só (reescrever dezenas de applets, por exemplo), a decisão diz isso e o trabalho restante vai para `pendencias.md`, com a lista do que falta. Assim a diferença fica registrada, e não escondida. O trabalho fica barato quando cada fato está escrito num só lugar (§1.1).

### 2.4 Quando uma regra atrapalha

- **Regra fundamental:** não a contorne. Proponha a mudança ao autor (§2.1); se for aceita, registre-a e aplique-a (§2.2, §2.3).
- **Regra provisória:** siga ou explique (§1.2).

Isso vale também para as verificações automáticas. Se o verificador acusa algo de que o livro realmente precisa, muda-se o verificador, com o motivo num comentário, em vez de disfarçar o código para passar.

## 3. Ferramentas e dependências

- **Base:** Quarto (livro HTML publicado no GitHub Pages), SCSS e JavaScript; applets em JSXGraph, sem etapa de compilação (os módulos de `src/` e `applets/` são servidos como estão, desde a fase 5 da migração); fórmulas com KaTeX.
- **Versões:** o CI fixa a versão do Quarto (`.github/workflows/publish.yml`). O JSXGraph, o KaTeX e as fontes vêm com o site, em `vendor/`, copiados do `livro-base`, que confere primeiro uma versão nova, com a versão e a licença em `vendor/VERSIONS.md`; as verificações desenham as fórmulas com o mesmo arquivo das páginas. Os testes do navegador usam o Playwright e o axe-core, com a versão fixa em `tests/package.json`: são ferramentas de desenvolvimento e não chegam ao estudante. O JSX-quarto não acompanha essas versões (decisão do autor em 2026-11-22).
- **Dependências de execução**, que chegam ao navegador do estudante (bibliotecas, fontes, serviços externos), pesam no desempenho, na acessibilidade e na licença (§17, §33). Entram por decisão registrada, com o ganho mostrado.
- **Dependências de desenvolvimento**, que só rodam no computador de quem desenvolve ou no CI (testes, verificadores, formatadores), não chegam ao estudante. Entram quando automatizam uma verificação útil, com versão fixada e uma linha em `decisoes.md`.
- **Outras ferramentas de applets** (Desmos, CindyJS…): só por decisão, quando uma representação não puder ser feita bem com JSXGraph (§20).

## 4. Applets

### 4.1 Aonde se quer chegar

Todos os applets do livro são applets JSXGraph próprios, escritos neste projeto. Os applets GeoGebra de projetos anteriores ficaram nos capítulos de antes, em `_interno/oficina/nao-publicados/`, como modelo; a lista está em `pendencias.md`, §5. O livro não tem mais como incorporar um applet GeoGebra: o shortcode saiu na fase 5 da migração (2026-11-25), e trazê-lo de volta seria uma decisão do autor.

### 4.2 O GeoGebra é inspiração, não modelo (fundamental)

- O applet GeoGebra mostra a ideia matemática e a intenção didática. Ele não é uma especificação a reproduzir.
- O applet novo é escrito do zero, no modo próprio do JSXGraph e de acordo com estas diretrizes. Não ficam rastros do GeoGebra: nem nomes, ids ou textos (`A1`, `texto1`, `material-…`), nem cores, tamanhos em pixels, posições na tela ou ordem de construção, nem funções de compatibilidade (como o `ggb2jsx.js` do JSX-quarto).
- Expressões e comandos do GeoGebra que o autor use num pedido ("um `Vector(A, B)`", "um controle deslizante de 0 a 2") são lidos pela intenção e escritos com a construção equivalente do JSXGraph. Imitar o GeoGebra só quando o autor pedir explicitamente; nesse caso, o motivo fica num comentário no código.
- O applet novo pode e deve ser melhor que o original: trata casos especiais, funciona no celular e no teclado, usa as cores, a notação e os textos do livro.

### 4.3 Do GeoGebra ao capítulo

1. **Função pedagógica.** O que o estudante deve perceber com o applet (§9)? Se uma figura ou uma sequência de exemplos bastar, proponha isso ao autor.
2. **Especificação curta.** Objetos, o que se move, o que se calcula, os casos especiais e o que o applet mostra em cada um, a descrição e a pergunta associada.
3. **O que já existe.** Se o JSX-quarto já tem um applet migrado do mesmo material (`pendencias.md`, §5), parta da ideia e da estrutura dele, adaptadas ao livro (§4.7). O original `.ggb` serve para conferir objetos, valores iniciais e casos especiais.
4. **Escrever e testar** o applet (§4.5) numa página do laboratório, com `quarto preview --profile lab`.
5. **Ficha de aceitação** (§4.6).
6. **Pôr no capítulo** o bloco `::: {.applet name="…" spoken="…"}` (`guia-editorial.md`, §6), com a instrução e a pergunta escritas para o applet novo. É texto didático: o autor aprova.
7. **Atualizar** `pendencias.md` (o applet sai da lista) e o que mais a troca afetar (§2.3).

Para ler o `.ggb` e decidir o destino de cada objeto, a referência de método é o manual de migração do JSX-quarto (`migracao/manual.qmd` e `migracao/dicionario.qmd`): inventariar, classificar cada objeto (estado, derivado, auxiliar, apresentação), modelar antes de desenhar, desenhar e ligar, limpar e verificar. Onde o livro e o JSX-quarto diferem, valem estas diretrizes (§4.7).

### 4.4 O que todo applet garante

As garantias marcadas como fundamentais vêm da lista do §1.3; as outras são provisórias (§1.2).

| Garantia | Na prática |
|---|---|
| Matemática correta (fundamental) | A figura, a descrição e os números mostrados vêm da mesma conta, escrita uma vez. As contas do applet são conteúdo matemático: o autor aprova. |
| Casos especiais decididos (fundamental) | Cada caso especial (pontos coincidentes, vetores paralelos, divisão por zero) tem um comportamento escolhido e visível; nunca aparece um número enganoso (0, `NaN`, valores enormes). Se o caso importa para a aula, o estudante consegue alcançá-lo, por exemplo com encaixe na grade. |
| Teclado (fundamental) | Tudo funciona pelo teclado (§32). |
| Alternativa ao arraste | Toda ação de arraste tem alternativa sem arraste (§32): quem escolhe no painel de acessibilidade ganha campos para digitar as coordenadas de cada ponto e o valor de cada faixa de valores, ou move um ponto tocando nele e depois no destino. Vem com todo applet, montada a partir dos pontos e das faixas de valores, sem código no applet (`src/applet/access.js`), desde a fase 5 da migração. |
| Descrição em texto | O que a figura mostra aparece em palavras (`addStatus`), refeito pouco depois do último movimento, para não anunciar cada passo do arraste. O leitor de tela a recebe sempre; à vista, só para quem a pede no painel. |
| Cor não é a única informação (fundamental) | Forma, rótulo ou texto também distinguem os objetos; contraste de pelo menos 3:1 com o fundo (§32; o contraste é provisório). |
| Tela estreita (fundamental) e toque | Funciona a 320 px de largura e com toque; o quadro acompanha a largura da coluna e aparece no tamanho certo também quando começa escondido (aba ou bloco recolhido). O dedo fora dos pontos rola a página; sobre um ponto, arrasta o ponto; a região mostrada não se desloca nem muda de escala. |
| Reinício | O botão de reiniciar, logo acima de cada quadro, volta pontos, valores e animações ao estado inicial, em todos os quadros do applet. |
| Movimento (fundamental) | Animação não começa sozinha e pode ser pausada; com menos movimento, escolhido no sistema ou no painel, a animação avança em passos, a cada toque. |
| Texto no lugar certo | Instruções, títulos e perguntas ficam no `.qmd`; na figura, só nomes e medidas presos aos objetos. |
| Notação do livro | Mesmos símbolos, macros e formato de números do texto (§5). |
| Sem rastros do GeoGebra (fundamental) | §4.2. |

### 4.5 Como se escreve um applet hoje

Regras provisórias (§1.2). Desde a fase 5 da migração, um applet é escrito com o que o sistema do `livro-base` dá pronto; as funções e os elementos novos, com uma ficha para cada um, estão no Apêndice C do `livro-base` ("Guia de autoria de applets"), e os passos, no `arquitetura.md`, §7.

- **Um arquivo por applet**, registrado pelo nome do arquivo, que é o nome usado no capítulo.
- **Janela pela matemática.** O quadro mostra uma região do plano dada por números simples, e a mesma região em qualquer largura; nada é posicionado em pixels de tela. Afastamentos pequenos a partir de um objeto, como o nome ao lado do ponto, são aceitos.
- **Só a figura tem fundo e borda.** Expressões, controles, a descrição e os botões de reiniciar e de acessibilidade ficam no fundo da página e se leem como parte do texto.
- **O plano fica parado.** Ele não se desloca nem muda de escala (mouse, dedos, teclado), porque a região mostrada faz parte da matemática. No toque, o dedo fora dos pontos rola a página, como no resto do livro, e sobre um ponto o arrasta; quando dois pontos estão ao alcance do mesmo toque, vence o mais próximo; o ponto arrastado não sai da região mostrada. Todo quadro é criado pelo código comum que garante isso.
- **A forma diz se o ponto se move.** O ponto arrastável, o fixo (ou que depende de outros) e o extremo aberto têm formas diferentes, e o arrastável é fácil de pegar com o dedo. A forma não substitui o texto: a instrução e o estado também dizem o que se move.
- **Contas e escrita dos números num só lugar.** A figura e a descrição usam as mesmas funções de conta, e os números e as fórmulas são escritos por um só módulo, onde muda o formato. Uma conta não definida (vetor nulo, vetores paralelos) não vira 0 nem some: aparece de um jeito fácil de achar na ficha de aceitação, até o applet decidir o caso (§4.4; escrita provisória: `pendencias.md`, §2).
- **Unidades.** As contas são feitas em radianos e em unidades do plano; graus só na saída. Um controle mostra a unidade que o estudante lê e é convertido na conta. Ângulos notáveis em radianos aparecem como fração de π. A velocidade de uma animação é escolhida pelo efeito visível.
- **Cores pelos papéis.** Três papéis, um tom cada: **dado**, o que o estudante controla ou o que o enunciado fornece; **resultado**, o que o applet calcula a partir dos dados, foco da ideia; **apoio**, tracejado, para construções que ajudam a ler (cópias, projeções, linhas de chamada). Nomes, origem e pontos de referência ficam na cor do texto. Dois objetos do mesmo papel se distinguem pelo nome junto a eles, e não pela cor. Erro ou contraexemplo não tem cor própria: muda o traço, e a descrição diz o que há. Uma quarta cor se confundiria com as outras para quem tem daltonismo; um terceiro papel colorido é uma decisão (§6). O applet nunca escreve uma cor: usa as do livro. Nos testes, um applet pode chamar qualquer cor de `_brand.yml` pelo nome; num applet usado no livro, a cor vem do papel, e o verificador avisa.
- **Nomes no quadro como no texto.** Os nomes dos objetos são escritos como no capítulo (TeX, com as macros do livro), para que a figura e o texto mostrem a mesma notação. Os números dos eixos ficam em texto simples.
- **Nomes no código.** Os elementos levam o nome que o estudante lê no texto (`A`, `B`, `u`, `v`); o resto do código fica em inglês, com os nomes do glossário do `livro-base`, de onde vem o sistema dos applets (desde a fase 5 da migração; antes, em português).
- **Comentários** explicam o porquê, em português.
- **Código compartilhado.** Uma construção usada por dois applets vai para um módulo comum; a de um applet só fica no próprio arquivo.
- **Applets com várias partes.** Quadros, expressões e controles que o capítulo põe em lugares diferentes ficam dentro do bloco do applet; o applet trata como opcional a parte que o capítulo pode omitir; os quadros de um applet se redesenham juntos, e uma só descrição serve ao applet inteiro. Os arranjos na página são atributos e classes do livro, sem CSS nos capítulos (`guia-editorial.md`, §6).
- **Controles.** Faixas, caixas de seleção, campos e botões ficam ligados a um estado: mudar um valor, venha a mudança de onde vier, redesenha a figura e acerta os outros controles, e "Reiniciar" volta tudo ao início.
  - Por padrão, ficam logo abaixo do quadro, para que um capítulo que não os posicionou não os perca; o capítulo pode pô-los em outro lugar (`guia-editorial.md`, §6). A ordem em que aparecem é a da tecla Tab.
  - Cada controle tem um nome fixo, em texto simples, para o leitor de tela; as fórmulas que se veem ficam escondidas dele.
  - Uma faixa de valores não leva campo de digitar ao lado: quem prefere digitar escolhe os campos no painel. O campo aceita o número escrito com ponto ou com vírgula, e uma fração, como `3/2`.
  - A animação só começa pelo botão (regra fundamental 5) e para quando o estudante mexe no mesmo valor e no reinício; por isso funciona também com "Reduzir movimento".
  - Faixa vertical entra quando um applet precisar.

### 4.6 Ficha de aceitação

Antes de um applet entrar num capítulo. Os itens marcados com (T) os testes do navegador (`tests/browser.mjs`) já conferem: um applet numa página do laboratório entra nas conferências de largura, de console e do axe-core; as de teclado e de alternativas ao arraste são feitas num applet só, e por isso valem "em parte". Os outros se conferem à mão.

- [ ] Console do navegador sem erros (T; no Chrome: Ver > Programador > Ferramentas do programador).
- [ ] Cada garantia de §4.4, em especial:
  - [ ] **320 px** (T): modo de dispositivo das ferramentas do programador, com largura 320, e também num celular;
  - [ ] **teclado** (T, em parte): só com Tab, setas e Enter, sem mouse;
  - [ ] **sem arraste** (T, em parte): a mesma tarefa sem arrastar nada, com "Campos para digitar os pontos e os valores" e, depois, com "Tocar no ponto e depois no destino" (no painel de acessibilidade, pelo ícone do cabeçalho ou pelo botão acima do quadro);
  - [ ] **leitor de tela:** o VoiceOver (Cmd+F5 no Mac) lê o nome do applet, de cada quadro e de cada ponto, e a descrição;
  - [ ] **casos especiais:** cada um da especificação (§4.3, passo 2);
  - [ ] **reinício**, depois de mexer em tudo;
  - [ ] **menos movimento:** Ajustes do Sistema > Acessibilidade > Tela > Reduzir movimento, e a opção do painel;
  - [ ] **daltonismo:** ferramentas do programador > Rendering > Emulate vision deficiencies;
  - [ ] **toque:** num celular, rolar a página passando o dedo sobre o quadro, fora dos pontos, e arrastar cada ponto tocando um pouco ao lado dele.
  - [ ] **várias partes:** a 320 px, cada quadro e cada expressão cabem na coluna; mexer num quadro atualiza os outros, as expressões e a descrição; cada quadro tem nome lido próprio, diferente dos outros da página.
- [ ] Sem rastros do GeoGebra: `git grep -n -i -E "geogebra|ggb|material-" applets/` não acusa nada no applet novo.
- [ ] As verificações do §8 sem erros, também as do laboratório e os testes do navegador.
- [ ] Desvios das regras provisórias explicados em comentário e no commit; `pendencias.md` e `decisoes.md` atualizados, se for o caso.

### 4.7 Relação com o JSX-quarto

O JSX-quarto (<https://github.com/lcmerlo/JSX-quarto>) é o laboratório dos applets: lá se testam elementos, cores, arranjos e a migração do GeoGebra. O livro adota, por decisão, o que foi testado lá. Aproveitar código do JSX-quarto é desejável quando poupa trabalho, desde que adaptado às regras do livro; a origem fica num comentário no código, e cada diferença, na decisão que adotou a parte correspondente (`decisoes.md`).

Onde o livro faz diferente, e por quê:

- **Carregamento:** os módulos dos applets e o JSXGraph, sem compilação, são carregados só quando um applet chega perto da tela. Nada vem de outro servidor (CDN, Google Fonts): o site continua funcionando se um deles sair do ar, nenhum deles fica sabendo de cada visita, e a versão fica fixada. O verificador acusa o que uma página carregar de fora.
- **Cores:** três papéis (§4.5), e não uma cor por objeto; escolha do autor em 2026-11-04, depois de comparar quatro modelos lado a lado. Nos testes, as cores do JSX-quarto são chamadas pelo nome.
- **Toque:** o dedo fora dos pontos rola a página, e vence o ponto mais próximo; no JSX-quarto, o quadro bloqueia a rolagem da página.
- **Valor indefinido:** nunca vira 0 nem some (regra fundamental 2).
- **Ângulos em radianos:** fração de π só quando o ângulo é exatamente uma fração notável; o JSX-quarto arredondava para centésimos de π.
- **Foco do teclado e largura mínima:** contorno de foco visível também nos pontos e 320 px, e não 360 (regra fundamental 4).
- **Arranjos na página:** sem CSS nos capítulos (regra fundamental 6); a margem da página, estreita no livro, não recebe applets.
- **Controles:** o número entra com ponto ou vírgula; o nome lido pelo leitor de tela não muda com o valor; a animação só começa a pedido (regra fundamental 5); os controles ficam logo abaixo do quadro ou onde o capítulo os puser; as alternativas de acessibilidade aparecem só para quem as escolhe no painel.

## 5. Notação matemática

- A notação é definida num só lugar (regra fundamental 3) e vale no texto, nas prévias das referências cruzadas e nos applets (expressões, controles e nomes no quadro); o verificador confere as fórmulas com a mesma definição. Se o motor de fórmulas mudar ou surgir outro formato (PDF), a definição continua única.
- As convenções de escrita (números, vetores, macros, símbolos) estão no `guia-editorial.md`, §4, e valem também nos applets. As dos números e dos vetores são provisórias e serão reavaliadas (`pendencias.md`, §2).

## 6. Aparência

- **Cada valor definido uma vez** (regra fundamental 6): as cores numa paleta com nomes, e os papéis de cor como variáveis do livro. Applets e capítulos usam esses nomes, nunca cores escritas à mão (§24, §35). Quando um valor aparece em dois arquivos, um prevalece e o outro engana: escolhe-se um e apaga-se o outro (como o tamanho e a entrelinha do texto, que desde 2026-11-25 estão só em `_brand.yml`).
- **Cores do livro e cores de teste.** A paleta tem as cores do livro, as únicas que os papéis usam, e as cores de teste, que são as paletas comparadas no JSX-quarto. As de teste servem aos applets de teste e não chegam aos capítulos.
- **Novas cores no livro ou outro modelo de cor** entram por decisão, depois de medir o contraste e conferir com simulação de daltonismo (§24, §32). Uma cor de teste passa a ser do livro só por essa decisão.

## 7. Nomes e endereços

- **Públicos:** nomes dos arquivos de capítulo (são as URLs), labels (`#def-…`, `#fig-…`), ids e títulos de seção (são âncoras). Ficam estáveis a partir da divulgação (§26; regra fundamental 12); antes dela, renomear sai barato, mas mudar a estrutura do livro continua sendo decisão do autor. Para renomear um capítulo publicado, o cabeçalho do arquivo novo recebe o nome antigo em `aliases`, e o Quarto cria uma página que redireciona o endereço antigo, mantendo a âncora (testado no Quarto 1.9.35):

  ```yaml
  ---
  aliases:
    - nome-antigo.html
  ---
  ```

  Labels só mudam por decisão, junto com todas as referências `@…`.
- **Linguagem de autoria** (classes `.objective`, `.note`, `.hint`, `.solution`, `.annotated`, `.figure-note`; o bloco `.applet` e as partes `.board`, `.controls` e `.live`): mudar um nome exige ajustar, na mesma mudança, todos os capítulos, os modelos e o guia.
- **Internos** (código de `src/` e `applets/`, `_interno/`, classes que os capítulos não usam): podem mudar quando houver ganho, dentro de um plano, com todas as referências ajustadas.

## 8. Verificação e publicação

- **Antes de integrar uma mudança:** os comandos do `guia-editorial.md`, §8 (render, verificações, laboratório, `git diff`); numa mudança de applet, estilo ou código de `src/`, também os testes do navegador.
- **As verificações** são três, vindas do `livro-base`: os testes de unidade (`tests/unit/`), a das fontes e do site gerado (`tests/check-site.mjs`) e a do navegador (`tests/browser.mjs`). As duas primeiras separam erros, que bloqueiam a publicação, de avisos, que não bloqueiam. O que cada uma confere está em `arquitetura.md`. Passar nelas sem erros é fundamental (regra 7); as regras delas, como as outras, são provisórias (§2.4).
- **Publicação:** o GitHub Actions publica a cada push na `main`, depois dos testes de unidade, do render, das verificações do livro e do laboratório e dos testes do navegador. Um erro interrompe a publicação, e o site anterior continua no ar.
- **Branch:** cada mudança num branch, integrada à `main` depois de verificada, de preferência por pull request. Num pull request para a `main`, o GitHub Actions faz as mesmas verificações, sem publicar, e mostra o resultado na página do pull request; integre só com o resultado verde.
- **Commits:** mensagem curta, no imperativo, um assunto por commit.

## 9. Assistentes de IA

O `AGENTS.md` resume estas diretrizes para os assistentes. O ponto central é o tipo de mudança:

| Tipo | Exemplos | O assistente |
|---|---|---|
| Conteúdo matemático | enunciados, definições, demonstrações, resoluções, valores, fórmulas, contas dos applets, notação nova | propõe; só altera com aprovação do autor |
| Texto didático | explicações, instruções, perguntas, legendas, textos alternativos | propõe; só altera com aprovação do autor |
| Forma prevista nas diretrizes | escrita à mão trocada pela macro equivalente, erro evidente de digitação, link quebrado, classe ou bloco no formato do guia | num capítulo, altera e mostra no diff; nos capítulos antigos (§1.4), não |
| Técnica | código, estilos, configuração, verificações, documentação técnica | altera dentro do plano combinado e explica as decisões em linguagem simples (§2.1) |
| Estrutura do livro | ordem e divisão de capítulos e tópicos, renomeação de capítulos e labels | só por decisão do autor |
