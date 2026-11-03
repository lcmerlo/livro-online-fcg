# Diretrizes técnicas

Orientações para desenvolver o livro: applets, código, estilos, verificação e publicação, e o modo de tomar e aplicar decisões. Servem a quem escreve, a quem programa e aos assistentes de IA, para quem o `AGENTS.md` resume este documento.

O projeto está em fase de testes. Por isso, estas diretrizes **orientam sem engessar**: dizem aonde se quer chegar e qual é o caminho conhecido hoje, e explicam como mudar esse caminho quando aparecer um melhor. A justificativa pedagógica está no documento de Princípios (§ entre parênteses); a escrita de capítulos, no `guia-editorial.md`.

## 1. Como usar estas diretrizes

### 1.1 Três tipos de orientação

Cada orientação é de um destes tipos, que correspondem às distinções do §18 dos Princípios:

| Tipo | O que é | Quando se pode fazer diferente |
|---|---|---|
| **Requisito** | Protege o estudante ou o livro publicado: matemática correta, acessibilidade, site funcionando. | Não se faz diferente. Se não puder ser cumprido agora, o caso vai para `pendencias.md`, com o motivo. |
| **Padrão** | A forma adotada hoje para algo que se repete: ferramentas, nomes, organização do código. | Quando outra solução trouxer ganho real (§1.3). O desvio é explicado num comentário curto ou numa decisão. |
| **Hipótese** | Uma escolha ainda não testada. | É testada; o resultado vira decisão. |

O tipo aparece entre parênteses quando não é óbvio. Sem indicação, a orientação é um padrão.

### 1.2 Documentos

| Documento | Responde a | Muda quando |
|---|---|---|
| `Princípios e Especificações Operacionais-26-10-03.md` | Por que (aprendizagem, acessibilidade) e o que a fase inicial deve alcançar | o autor revê um princípio ou uma meta da fase |
| `guia-editorial.md` | Como escrever e revisar um capítulo | muda um componente ou uma convenção de escrita |
| `diretrizes-tecnicas.md` (este) | Como desenvolver e como decidir | muda uma ferramenta, um padrão ou o processo |
| `arquitetura.md` | Como o projeto é hoje: arquivos, dependências, fluxos | o código muda (o mapa acompanha) |
| `decisoes.md` | O que foi decidido, quando e por quê | a cada decisão |
| `pendencias.md` | O que está em aberto: requisitos não cumpridos, decisões a tomar, applets a reescrever | algo é descoberto ou resolvido |
| `AGENTS.md`, `.github/copilot-instructions.md` | Resumo para assistentes de IA | estas diretrizes mudam |
| `README.md` | Apresentação do projeto e comandos | comandos ou estrutura mudam |

Material de referência, que não orienta o trabalho atual: `relatorio-design-pedagogico-26-05-14.qmd` (fonte dos Princípios) e `biblioteca-estruturas-site-diretrizes.qmd` (padrões anteriores a outubro de 2026).

**Quando dois documentos divergem**, a divergência é um defeito: corrija-a na mesma mudança em que ela for notada ou registre-a em `pendencias.md`. Até a correção:

- a decisão mais recente de `decisoes.md` vale sobre o texto mais antigo;
- os princípios pedagógicos (Parte 1 dos Princípios) orientam todas as decisões; uma decisão que se afaste deles diz isso e ajusta o texto;
- sobre como o projeto é, o código é o fato, e `arquitetura.md` é corrigido para acompanhá-lo.

### 1.3 Ganho real

Um padrão vale até que outra solução mostre ganho real. O mesmo critério vale para mudar código que já funciona. Conta como ganho o que se pode mostrar:

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

Mudanças que não criam nem alteram padrão ou requisito (corrigir um erro, ajustar um texto) não precisam de registro: bastam o commit e sua mensagem.

### 2.3 Aplicar a todo o material

**Uma decisão só está concluída quando todo o material do projeto estiver de acordo com ela** (requisito). Na mesma mudança:

1. Procure o que a decisão afeta, pelo termo antigo: `git grep -n -i "termo"`.
2. Ajuste cada lugar. Onde procurar:
   - diretrizes (`_interno/diretrizes/`), `README.md`, `AGENTS.md`, `.github/copilot-instructions.md`;
   - modelos de capítulo (`_interno/oficina/testes/`);
   - capítulos (`capitulos/`, `index.qmd`);
   - componentes (`components/`), estilos (`_brand.yml`, `assets/css/custom.scss`) e applets (`applets-src/`);
   - verificações (`tests/verificar-site.mjs`, `.github/workflows/publish.yml`) e o dicionário do corretor (`cspell.json`).
3. Registre em `decisoes.md` o que foi ajustado.

Quando o ajuste não cabe numa mudança só (reescrever dezenas de applets, por exemplo), a decisão diz isso e o trabalho restante vai para `pendencias.md`, com a lista do que falta. Assim a diferença fica registrada, e não escondida.

### 2.4 Quando uma orientação atrapalha

Não a contorne: mostre o ganho (§1.3) e proponha a mudança (§2.1). Se for aceita, registre-a e aplique-a (§2.2, §2.3).

Isso vale também para as verificações automáticas. Se o verificador acusa algo de que o livro realmente precisa, muda-se o verificador, com o motivo num comentário, em vez de disfarçar o código para passar.

## 3. Ferramentas e dependências

- **Base:** Quarto (livro HTML publicado no GitHub Pages), SCSS e JavaScript; applets em JSXGraph, empacotados pelo Vite; fórmulas com MathJax.
- **Versões:** o CI fixa a versão do Quarto (`.github/workflows/publish.yml`). O JSXGraph tem a mesma versão em todos os projetos JSXGraph do autor e, quando muda, muda em todos juntos.
- **Dependências de execução**, que chegam ao navegador do estudante (bibliotecas, fontes, serviços externos), pesam no desempenho, na acessibilidade e na licença (§17, §33). Entram por decisão registrada, com o ganho mostrado.
- **Dependências de desenvolvimento**, que só rodam no computador de quem desenvolve ou no CI (testes, verificadores, formatadores), não chegam ao estudante. Entram quando automatizam uma verificação útil, com versão fixada e uma linha em `decisoes.md`.
- **Outras ferramentas de applets** (Desmos, CindyJS…): só por decisão, quando uma representação não puder ser feita bem com JSXGraph (§20).

## 4. Applets

### 4.1 Aonde se quer chegar

Todos os applets do livro serão applets JSXGraph próprios, escritos neste projeto. Os applets GeoGebra que hoje estão nos capítulos vieram de projetos anteriores e ficam ali só até serem substituídos; a lista está em `pendencias.md`, §5. Um applet GeoGebra novo só entra num capítulo por decisão do autor, como solução provisória.

### 4.2 O GeoGebra é inspiração, não modelo (requisito)

- O applet GeoGebra mostra a ideia matemática e a intenção didática. Ele não é uma especificação a reproduzir.
- O applet novo é escrito do zero, no modo próprio do JSXGraph e de acordo com estas diretrizes. Não ficam rastros do GeoGebra: nem nomes, ids ou textos (`A1`, `texto1`, `material-…`), nem cores, tamanhos em pixels, posições na tela ou ordem de construção, nem funções de compatibilidade (como o `ggb2jsx.js` do JSX-quarto).
- Expressões e comandos do GeoGebra que o autor use num pedido ("um `Vector(A, B)`", "um controle deslizante de 0 a 2") são lidos pela intenção e escritos com a construção equivalente do JSXGraph. Imitar o GeoGebra só quando o autor pedir explicitamente; nesse caso, o motivo fica num comentário no código.
- O applet novo pode e deve ser melhor que o original: trata casos especiais, funciona no celular e no teclado, usa as cores, a notação e os textos do livro.

### 4.3 Do GeoGebra ao capítulo

1. **Função pedagógica.** O que o estudante deve perceber com o applet (§9)? Se uma figura ou uma sequência de exemplos bastar, proponha isso ao autor.
2. **Especificação curta.** Objetos, o que se move, o que se calcula, os casos especiais e o que o applet mostra em cada um, o texto de estado e a pergunta associada.
3. **O que já existe.** Se o JSX-quarto já tem um applet migrado do mesmo material (`pendencias.md`, §5), parta da ideia e da estrutura dele, adaptadas ao livro (§4.7). O original `.ggb` serve para conferir objetos, valores iniciais e casos especiais.
4. **Escrever e testar** o applet (§4.5) com `npm run dev`.
5. **Ficha de aceitação** (§4.6).
6. **Trocar no capítulo** o shortcode `{{< geogebra … >}}` pelo `{{< applet … >}}`, revendo a instrução e a pergunta para o applet novo. É mudança de texto didático: o autor aprova.
7. **Atualizar** `pendencias.md` (o applet sai da lista) e o que mais a troca afetar (§2.3).

Para ler o `.ggb` e decidir o destino de cada objeto, a referência de método é o manual de migração do JSX-quarto (`migracao/manual.qmd` e `migracao/dicionario.qmd`): inventariar, classificar cada objeto (estado, derivado, auxiliar, apresentação), modelar antes de desenhar, desenhar e ligar, limpar e verificar. Onde o livro e o JSX-quarto diferem, valem estas diretrizes (§4.7).

### 4.4 O que todo applet garante (requisitos)

| Garantia | Na prática |
|---|---|
| Matemática correta | A figura, o texto de estado e os números mostrados vêm da mesma conta, escrita uma vez. As contas do applet são conteúdo matemático: o autor aprova. |
| Casos especiais decididos | Cada caso especial (pontos coincidentes, vetores paralelos, divisão por zero) tem um comportamento escolhido e visível; nunca aparece um número enganoso (0, `NaN`, valores enormes). Se o caso importa para a aula, o estudante consegue alcançá-lo, por exemplo com encaixe na grade. |
| Teclado e alternativa ao arraste | Tudo funciona pelo teclado, e toda ação de arraste tem alternativa sem arraste, como campos numéricos ou botões (§32). |
| Estado em texto | O que muda na figura aparece em texto no parágrafo `<id>-status`, com atraso para não anunciar cada passo do arraste. |
| Cor não é a única informação | Forma, rótulo ou texto também distinguem os objetos; contraste de pelo menos 3:1 com o fundo (§32). |
| Tela estreita e toque | Funciona a 320 px de largura e com toque; o quadro acompanha a largura da coluna e aparece no tamanho certo também quando começa escondido (aba ou bloco recolhido). |
| Reinício | O botão "Reiniciar applet" volta pontos, parâmetros e animações ao estado inicial. |
| Movimento | Animação não começa sozinha e pode ser pausada; com a preferência por menos movimento ativada no sistema, não há movimento automático. |
| Texto no lugar certo | Instruções, títulos e perguntas ficam no `.qmd`; na figura, só nomes e medidas presos aos objetos. |
| Notação do livro | Mesmos símbolos, macros e formato de números do texto (§5). |
| Sem rastros do GeoGebra | §4.2. |

### 4.5 Como se escreve um applet hoje

- **Arquivo e registro.** Um arquivo por applet em `applets-src/src/applets/<nome>.js`, cuja exportação padrão é uma função `criar<Nome>({ id, JXG, dataset })` que devolve um objeto com `reset()`. O registro é automático: o nome do arquivo é o nome usado no shortcode. O passo a passo está em `arquitetura.md`, §7, e `segmento.js` é o exemplo.
- **Janela pela matemática.** O quadro é definido pela região do plano que mostra (`boundingbox`), com números simples; nada é posicionado em pixels de tela. Afastamentos pequenos a partir de um objeto, como o rótulo ao lado do ponto, são aceitos.
- **Tamanho do quadro.** O quadro ocupa a largura da coluna, até 640 px (`.applet-jxg`, em `custom.scss`), e o applet define a proporção dele (`aspect-ratio`) pela região, para mostrar a mesma região em qualquer largura; `segmento.js` é o exemplo. O JSXGraph redimensiona o quadro quando a largura muda ou quando ele aparece depois de escondido.
- **Cores e estilos.** Sempre pelos estilos de `src/tools/styles.js` e pelas cores de `src/cores.js`, que vêm das variáveis `--cor-…` do livro; nunca cores escritas no applet. O modelo atual atribui cor pelo papel didático (manipulável, objeto principal, construção…); cor por identidade do objeto, como no JSX-quarto, é hipótese a testar (`pendencias.md`, §2).
- **Nomes.** Objetos com o nome que o estudante lê no texto (`A`, `B`, `u`, `v`); o resto do código em português descritivo, como o código atual.
- **Comentários** explicam o porquê, em português.
- **Código compartilhado.** Uma construção usada por dois applets vai para um módulo comum (hoje, `src/tools/`); a de um applet só fica no próprio arquivo.
- **Applets com várias partes** (dois quadros, controles separados): o shortcode ainda não os prevê. O primeiro caso propõe a extensão (`pendencias.md`, §3).

### 4.6 Ficha de aceitação

Antes de um applet entrar num capítulo:

- [ ] Console do navegador sem erros (no Chrome: Ver > Programador > Ferramentas do programador).
- [ ] Cada garantia de §4.4, em especial:
  - [ ] **320 px:** modo de dispositivo das ferramentas do programador, com largura 320, e também num celular;
  - [ ] **teclado:** só com Tab, setas e Enter, sem mouse;
  - [ ] **sem arraste:** a mesma tarefa sem arrastar nada;
  - [ ] **leitor de tela:** o VoiceOver (Cmd+F5 no Mac) lê o rótulo e o estado;
  - [ ] **casos especiais:** cada um da especificação (§4.3, passo 2);
  - [ ] **reinício**, depois de mexer em tudo;
  - [ ] **menos movimento:** Ajustes do Sistema > Acessibilidade > Tela > Reduzir movimento;
  - [ ] **daltonismo:** ferramentas do programador > Rendering > Emulate vision deficiencies;
  - [ ] **toque:** num celular, rolar a página passando o dedo sobre o quadro.
- [ ] Sem rastros do GeoGebra: `git grep -n -i -E "geogebra|ggb|material-" applets-src/src` não acusa nada no applet novo.
- [ ] `npm run build` e `node tests/verificar-site.mjs` sem erros.
- [ ] Desvios de padrão explicados em comentário; `pendencias.md` e `decisoes.md` atualizados, se for o caso.

### 4.7 Relação com o JSX-quarto

O JSX-quarto (<https://github.com/lcmerlo/JSX-quarto>) é o laboratório dos applets: lá se testam elementos, cores, arranjos e a migração do GeoGebra. O livro adota, por decisão, o que foi testado lá. Aproveitar código do JSX-quarto é desejável quando poupa trabalho, desde que adaptado aos padrões do livro.

Diferenças atuais:

| Assunto | Livro | JSX-quarto | Situação |
|---|---|---|---|
| Carregamento | bundle do Vite, só nas páginas com applet | módulos ES, JSXGraph do CDN | padrão do livro: não depende de CDN e a versão fica fixada |
| Fórmulas | MathJax | KaTeX | hipótese a testar no piloto |
| Cores | por papel didático | por identidade do objeto | hipótese a testar no piloto |
| Código comum | `src/tools/` | biblioteca `lib/` | hipótese: portar a parte da `lib/` que o piloto usar |
| Largura mínima | 320 px (WCAG 1.4.10, §32) | 360 px | padrão do livro |

## 5. Notação matemática

- A notação é definida num só lugar: hoje, as macros de `components/macros.html`, para o MathJax. Se o motor de fórmulas mudar ou surgir outro formato (PDF), a definição continua única e vale também para os textos dos applets.
- Números, no texto e nos applets, levam ponto decimal e vírgula entre coordenadas, como `(2.5, 3)`. A convenção é provisória e será reavaliada (`pendencias.md`, §2).
- Vetores usam, por enquanto, dois comandos: `\vec{u}` para nome de uma só letra e a macro `\vet{AB}` para nome formado por dois pontos. O objetivo é um só comando com bom resultado nos dois casos (`pendencias.md`, §2).
- Os símbolos e as macros estão no `guia-editorial.md`, §4.

## 6. Aparência

- **Valores definidos uma vez:** cores na paleta de `_brand.yml`; papéis de cor como variáveis `--cor-…` em `assets/css/custom.scss`. Applets e capítulos usam esses nomes, nunca cores literais (§24, §35).
- **Cada valor num lugar só.** Quando um valor aparece em dois arquivos, um prevalece e o outro engana: escolha um e apague o outro (caso pendente: o tamanho da fonte, `pendencias.md`, §2).
- **Novas cores ou outro modelo de cor** entram por decisão, depois de medir o contraste e conferir com simulação de daltonismo (§24, §32).

## 7. Nomes e endereços

- **Públicos:** nomes dos arquivos de capítulo (são as URLs), labels (`#def-…`, `#fig-…`), ids e títulos de seção (são âncoras). Ficam estáveis (§26). Para renomear um capítulo publicado, o cabeçalho do arquivo novo recebe o nome antigo em `aliases`, e o Quarto cria uma página que redireciona o endereço antigo, mantendo a âncora (testado no Quarto 1.9.35):

  ```yaml
  ---
  aliases:
    - nome-antigo.html
  ---
  ```

  Labels só mudam por decisão, junto com todas as referências `@…`.
- **Linguagem de autoria** (classes `.bloco-…`, `.dica`, `.solucao`, `.resposta`, shortcodes): mudar um nome exige ajustar, na mesma mudança, todos os capítulos, os modelos e o guia.
- **Internos** (código de `applets-src/`, `_interno/`, classes que os capítulos não usam): podem mudar quando houver ganho, dentro de um plano, com todas as referências ajustadas.

## 8. Verificação e publicação

- **Antes de integrar uma mudança:** os comandos do `guia-editorial.md`, §8 (bundle, render, verificador, `git diff`).
- **O verificador** (`tests/verificar-site.mjs`) separa erros, que bloqueiam a publicação, de avisos, que não bloqueiam. O que ele confere está em `arquitetura.md`, §4.6. Suas regras são padrões como os outros (§2.4).
- **Publicação:** o GitHub Actions publica a cada push na `main`, depois do build, do render, do verificador e da conferência de links. Um erro interrompe a publicação, e o site anterior continua no ar.
- **Branch:** cada mudança num branch, integrada à `main` depois de verificada, de preferência por pull request. Num pull request para a `main`, o GitHub Actions faz as mesmas verificações, sem publicar, e mostra o resultado na página do pull request; integre só com o resultado verde.
- **Commits:** mensagem curta, no imperativo, um assunto por commit.

## 9. Assistentes de IA

O `AGENTS.md` resume estas diretrizes para os assistentes. O ponto central é o tipo de mudança:

| Tipo | Exemplos | O assistente |
|---|---|---|
| Conteúdo matemático | enunciados, definições, demonstrações, resoluções, valores, fórmulas, contas dos applets, notação nova | propõe; só altera com aprovação do autor |
| Texto didático | explicações, instruções, perguntas, legendas, textos alternativos | propõe; só altera com aprovação do autor |
| Forma prevista nas diretrizes | escrita à mão trocada pela macro equivalente, erro evidente de digitação, link quebrado, classe ou shortcode no formato do guia | altera e mostra no diff |
| Técnica | código, estilos, configuração, verificações, documentação técnica | altera dentro do plano combinado e explica as decisões em linguagem simples (§2.1) |
| Estrutura do livro | ordem e divisão de capítulos e tópicos, renomeação de capítulos e labels | só por decisão do autor |
