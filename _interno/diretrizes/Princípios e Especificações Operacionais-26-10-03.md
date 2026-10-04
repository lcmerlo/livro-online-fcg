# Princípios e Especificações Operacionais para o Livro Online Interativo de Revisão Matemática

## Introdução

Este documento estabelece princípios pedagógicos, cognitivos, visuais e tecnológicos para orientar a construção de um livro online interativo de revisão matemática. O material destina-se a um público heterogêneo, incluindo estudantes com fragilidades em pré-requisitos matemáticos, diferentes graus de autonomia e distintas condições de acesso e uso.

As orientações são organizadas em duas partes com funções distintas. A primeira apresenta **princípios**, isto é, critérios relativamente estáveis para avaliar decisões de projeto. A segunda apresenta **especificações operacionais**, isto é, decisões concretas para orientar a construção do sistema neste estágio de desenvolvimento.

Essa distinção é importante porque princípios de aprendizagem não determinam diretamente uma única solução de interface. Uma recomendação como reduzir carga cognitiva estranha pode ser concretizada de diferentes maneiras, dependendo do conteúdo, do conhecimento prévio dos estudantes, do dispositivo utilizado e das características da atividade. Da mesma forma, uma decisão técnica adequada à fase inicial não deve ser confundida com uma regra pedagógica permanente.

Neste estágio, a prioridade é estabelecer uma arquitetura global simples, consistente e extensível. Recursos mais sofisticados — como adaptação automática, telemetria detalhada, sistemas de recomendação, feedback dinâmico complexo ou personalização baseada em dados — devem ser incorporados posteriormente, quando houver uma base estável e evidências de que sua inclusão responde a necessidades pedagógicas reais.

### Nota sobre fontes e documentos relacionados

Este documento cita um "relatório revisto", uma "versão revista", uma "revisão anterior" e uma "proposta anterior" (§20, §22, §32, §33, §40 e §41). O único relatório versionado é `relatorio-design-pedagogico-26-05-14.qmd`, e ele sustenta apenas parte dessas passagens:

| § | Passagem | Em `relatorio-design-pedagogico-26-05-14.qmd` |
|---|---|---|
| 20 | Limitar a stack e atribuir funções distintas às ferramentas | Sim (comparação JSXGraph, GeoGebra, CindyJS e Desmos) |
| 33 | Contraste, teclado e conteúdo dinâmico como requisitos | Sim |
| 22 | Proposta de três blocos | Não encontrada |
| 32 | Problemas de rolagem e toque em applets | Não encontrada |
| 40 | Testes tecnológicos, pilotagem e avaliação de dados | Não encontrada |
| 41 | Telemetria | Não encontrada |

As passagens sem correspondência remetem, provavelmente, a uma versão revista do relatório que não está no repositório. Até que essa versão seja localizada e versionada, elas valem como registro de contexto, não como referência verificável.

Documentos relacionados, todos nesta pasta:

- `guia-editorial.md`: regras curtas para quem escreve capítulos (§37);
- `relatorio-design-pedagogico-26-05-14.qmd`, `biblioteca-estruturas-site-diretrizes.qmd`, `blocos-proposicoes.qmd` e `proposta.qmd`: material de apoio anterior a este documento.

# Parte 1 — Princípios

## 1. A aprendizagem deve orientar o design

O valor de uma decisão visual ou tecnológica deve ser avaliado prioritariamente por sua contribuição para a aprendizagem. Aparência, novidade tecnológica ou quantidade de recursos interativos não constituem objetivos independentes.

Cada elemento deve desempenhar uma função identificável, como:

- orientar a atenção;
- representar uma relação matemática;
- reduzir ambiguidade;
- apoiar compreensão conceitual;
- modelar um procedimento;
- favorecer recuperação de conhecimentos;
- permitir comparação entre casos;
- promover explicação ou previsão;
- oferecer feedback;
- facilitar orientação e navegação.

Elementos cuja função não seja clara devem ser tratados com cautela, particularmente quando aumentarem densidade visual, número de escolhas ou complexidade de interação.

## 2. A complexidade do conteúdo e a complexidade da interface devem ser tratadas separadamente

Matemática pode ser cognitivamente exigente por sua própria natureza. O material não deve aumentar essa dificuldade por meio de navegação confusa, excesso de controles, terminologia desnecessária, representações mal alinhadas ou organização visual inconsistente.

A prioridade é minimizar esforço que não contribua para a construção do conhecimento. Isso inclui reduzir procura visual desnecessária, manter instruções próximas aos elementos aos quais se referem, evitar mudanças arbitrárias de convenções e limitar o número de decisões simultâneas exigidas do estudante.

Reduzir carga cognitiva estranha não significa eliminar esforço intelectual. Comparar, justificar, recuperar da memória, formular previsões e resolver problemas podem exigir esforço considerável e, ainda assim, constituir atividades produtivas.

## 3. O conhecimento prévio deve orientar o grau de apoio

Estudantes iniciantes e estudantes mais experientes não se beneficiam necessariamente das mesmas formas de instrução.

Quando os pré-requisitos são frágeis, convém oferecer:

- objetivos claros;
- ativação ou revisão de pré-requisitos;
- exemplos resolvidos;
- segmentação de procedimentos;
- orientação explícita da atenção;
- tarefas inicialmente delimitadas;
- pistas e feedback formativo.

À medida que o domínio aumenta, o apoio pode ser progressivamente reduzido e substituído por recuperação ativa, resolução independente, comparação de estratégias e problemas de maior abertura.

O apoio deve funcionar como andaime temporário, e não como substituto permanente do raciocínio do estudante.

## 4. A organização do material deve tornar sua estrutura mentalmente recuperável

Um material extenso não deve ser apenas uma sequência de páginas. O estudante precisa conseguir formar um mapa mental do conteúdo e compreender:

- onde está;
- o que está estudando;
- como o tópico atual se relaciona aos anteriores;
- quais conhecimentos são pré-requisitos;
- onde pode revisar uma dificuldade;
- como retornar ao percurso principal.

Hierarquia de títulos, navegação, breadcrumbs quando pertinentes, sumários, referências internas e padrões de página devem trabalhar conjuntamente para produzir orientação espacial e conceitual.

Consistência estrutural é especialmente importante em materiais de revisão, pois reduz a necessidade de reaprender a interface a cada tópico.

## 5. A estrutura deve ser previsível sem ser rígida

A previsibilidade reduz esforço de navegação, mas um único modelo obrigatório para todas as lições pode produzir páginas artificiais e desnecessariamente longas.

O sistema deve, portanto, utilizar uma **arquitetura modular**.

Alguns elementos são recorrentes — objetivo, pré-requisitos, explicação, exemplo, prática e verificação —, mas sua presença, ordem e extensão podem variar conforme a natureza do conteúdo.

Uma lição conceitualmente simples não precisa conter todos os recursos disponíveis. Da mesma forma, um tópico difícil pode requerer mais de um exemplo, representações adicionais ou etapas específicas de remediação.

Os componentes devem constituir um repertório editorial, não uma lista burocrática a ser preenchida.

## 6. Representações relacionadas devem ser integradas

Aprender matemática frequentemente exige relacionar linguagem verbal, notação simbólica, gráficos, diagramas, tabelas e movimentos.

Quando duas representações precisam ser processadas conjuntamente, devem ser espacial e conceitualmente aproximadas. Deve-se evitar obrigar o estudante a memorizar uma informação de uma região da página enquanto procura sua correspondência em outra.

Sempre que possível, mudanças em uma representação devem ser explicitamente relacionadas às mudanças nas demais.

Essa integração é especialmente importante em tópicos como funções, geometria analítica, trigonometria e cálculo.

## 7. A sinalização visual deve orientar, não decorar

Tipografia, cor, espaçamento, bordas, destaque e movimento devem estabelecer hierarquia e indicar relações relevantes.

A sinalização é útil quando responde a perguntas como:

- qual informação é central?
- qual objeto pode ser manipulado?
- qual elemento depende de outro?
- o que mudou?
- o que permaneceu invariável?
- qual etapa está sendo executada?

O excesso de destaque reduz o valor do próprio destaque. Cores saturadas, múltiplas caixas, ícones ou animações concorrentes devem ser evitados.

A identidade visual deve ser estável, mas subordinada à legibilidade e à função didática.

## 8. Exemplos devem tornar o raciocínio visível

Exemplos resolvidos são particularmente importantes quando os estudantes ainda não dominam estratégias de resolução.

Um bom exemplo não mostra apenas operações. Deve tornar explícitos:

- o objetivo;
- os dados relevantes;
- a estratégia adotada;
- as justificativas de cada transformação;
- relações entre representações;
- decisões que um especialista pode realizar implicitamente.

Sempre que adequado, o exemplo deve incluir solicitações breves de autoexplicação.

Nos tópicos posteriores ou nos exemplos subsequentes, partes da solução podem ser progressivamente omitidas para transferir responsabilidade ao estudante.

## 9. Interatividade deve produzir atividade cognitiva, não apenas atividade motora

Mover pontos, alterar sliders ou clicar em botões não é, por si só, evidência de aprendizagem.

A interatividade é justificável quando torna perceptível uma relação difícil de observar de outro modo ou quando permite que o estudante teste uma previsão, compare casos, investigue invariantes ou relacione representações.

Um padrão especialmente útil é:

**prever → manipular → observar → comparar → explicar → verificar.**

Nem todas as atividades precisam conter todas essas etapas, mas o applet deve ter uma função cognitiva identificável.

Sempre que uma imagem estática ou uma sequência curta de exemplos comunicar a ideia de forma igualmente eficaz, a solução mais simples deve ser considerada.

## 10. Exploração deve ser proporcional à preparação do estudante

Exploração aberta pode ser produtiva quando o estudante já compreende os objetos envolvidos e sabe que relações investigar. Para estudantes com conhecimento frágil, liberdade prematura pode transformar-se em procura aleatória.

A progressão pode passar, conforme o conteúdo, por:

1. observação de uma representação;
2. demonstração controlada;
3. manipulação guiada;
4. comparação orientada;
5. investigação com autonomia crescente.

Essa progressão não deve ser entendida como sequência obrigatória para todos os tópicos.

## 11. Recuperação e prática devem complementar a explicação

Compreender uma explicação durante a leitura não garante retenção.

O material deve oferecer oportunidades para recuperar conhecimentos sem acesso imediato à resposta, aplicar conceitos em situações ligeiramente diferentes e reencontrar ideias importantes após algum intervalo.

Ao longo do desenvolvimento do livro, deve-se favorecer, quando pertinente:

- recuperação ativa;
- prática distribuída;
- retomada de conhecimentos anteriores;
- intercalação de tipos de problema;
- transferência entre representações e contextos.

Essas práticas devem ser integradas à progressão curricular, evitando transformar cada página em uma acumulação de exercícios.

## 12. Feedback deve ajudar o estudante a continuar pensando

Feedback limitado a “correto” ou “incorreto” possui valor formativo restrito.

Quando possível, o feedback deve ajudar o estudante a identificar:

- que aspecto de seu raciocínio precisa ser revisto;
- qual relação matemática é relevante;
- que representação pode ajudar;
- qual etapa anterior merece ser reconsiderada.

Pistas progressivas são preferíveis a apresentar imediatamente a solução completa quando ainda houver possibilidade de esforço produtivo.

Sistemas sofisticados de feedback adaptativo podem ser incorporados futuramente, mas a qualidade pedagógica do feedback deve ser estabelecida antes de sua automatização.

## 13. Erros devem ser tratados como informação sobre o raciocínio

Erros frequentes podem ser utilizados para produzir contrastes conceituais produtivos.

Em vez de apenas sinalizar a resposta incorreta, o material pode comparar raciocínios próximos, explicitar por que uma estratégia falha ou mostrar em que condições determinada regra é válida.

A exposição a erros deve ser cuidadosamente desenhada para não reforçar procedimentos incorretos ou aumentar desnecessariamente a ansiedade.

## 14. A percepção de competência deve ser considerada

Estudantes com histórico de dificuldade em matemática podem interpretar obstáculos comuns como evidência de incapacidade pessoal.

O material deve combinar desafio com progressão compreensível e feedback informativo. O objetivo não é tornar tudo fácil, mas tornar o esforço interpretável.

Devem-se evitar linguagem punitiva, ironia, excesso de marcação de erros e sequências longas de fracasso sem orientação.

Ao mesmo tempo, elogios genéricos não substituem feedback específico sobre estratégias, progresso ou compreensão.

## 15. Acessibilidade deve ser incorporada à arquitetura

A acessibilidade não deve ser tratada como etapa final de correção.

Desde o início, o sistema deve permitir:

- estrutura semântica adequada;
- navegação por teclado;
- foco perceptível;
- reflow em telas estreitas;
- contraste suficiente;
- ampliação;
- interpretação sem dependência exclusiva de cor;
- alternativas para interações baseadas em precisão motora;
- descrição ou representação alternativa de informação visual relevante.

Em matemática interativa, a alternativa acessível deve procurar preservar a função da atividade, e não apenas fornecer uma transcrição superficial dos elementos visuais.

## 16. O sistema deve funcionar em diferentes tamanhos de tela e modalidades de entrada

O projeto não deve presumir uso exclusivo em computador com mouse.

Texto, equações, tabelas, controles e applets devem permanecer utilizáveis em smartphones e tablets.

Tamanho dos alvos, conflitos entre arraste e rolagem, orientação de tela, teclado virtual e precisão limitada do toque devem ser considerados desde a estrutura inicial.

Soluções específicas para esses problemas devem ser testadas empiricamente em vez de estabelecidas apenas por convenção.

## 17. Tecnologia deve ser escolhida pela função pedagógica e pelo custo de manutenção

O número de ferramentas utilizadas deve ser mantido pequeno.

Cada nova biblioteca, framework ou serviço introduz custos de:

- aprendizagem pela equipe;
- integração;
- consistência visual;
- manutenção;
- acessibilidade;
- desempenho;
- atualização;
- licenciamento.

Uma ferramenta adicional deve ser adotada apenas quando oferecer uma capacidade pedagogicamente relevante que não possa ser obtida de modo satisfatório com a infraestrutura existente.

## 18. Decisões devem ser testáveis e revisáveis

Nem todas as recomendações de design possuem o mesmo grau de evidência.

É útil distinguir:

- princípios apoiados por pesquisa consolidada;
- boas práticas de design;
- convenções adotadas para garantir consistência;
- hipóteses específicas deste projeto.

As últimas devem ser avaliadas por testes de uso e evidências de aprendizagem.

O projeto deve favorecer ciclos progressivos de construção, uso, observação e revisão, evitando consolidar prematuramente soluções cuja eficácia ainda não foi avaliada.

---

# Parte 2 — Especificações Operacionais

## 19. Objetivo da fase inicial

A primeira fase de desenvolvimento deve produzir uma infraestrutura editorial e tecnológica capaz de sustentar o crescimento do livro sem exigir reconstruções frequentes.

A prioridade não é implementar o máximo de recursos possível, mas estabilizar:

1. arquitetura de informação;
2. estrutura dos arquivos e conteúdos;
3. sistema de navegação;
4. componentes editoriais reutilizáveis;
5. identidade visual;
6. comportamento responsivo;
7. acessibilidade estrutural;
8. convenções para matemática;
9. mecanismo padrão para applets;
10. processo de validação e publicação.

Recursos mais sofisticados devem ser acrescentados sobre essa base.

## 20. Arquitetura tecnológica básica

A plataforma principal deve permanecer baseada em:

**Quarto + HTML5 + CSS/SCSS + JavaScript.**

Essa combinação deve constituir a camada estrutural do livro.

A primeira fase deve minimizar dependências externas e evitar múltiplas soluções concorrentes para a mesma função.

Para interatividade matemática customizada, recomenda-se manter **JSXGraph como solução principal**, especialmente quando houver necessidade de integração direta ao HTML, controle visual, versionamento e desenvolvimento de componentes próprios.

Ferramentas externas adicionais, como Desmos, podem ser incorporadas posteriormente ou em situações claramente justificadas pela natureza da representação matemática. A revisão anterior (ver Nota sobre fontes) já apontava a vantagem de limitar a stack e atribuir funções distintas às ferramentas.

Nesta fase, GeoGebra, CindyJS ou outras plataformas não devem integrar o padrão de publicação sem necessidade demonstrada.

**Estado em outubro de 2026.** Os capítulos publicados incorporam 15 applets do GeoGebra por `<iframe>` e apenas um applet JSXGraph próprio (capítulo 2). Os applets, as figuras, o texto e a nomenclatura são provisórios. O uso do GeoGebra é, portanto, transitório e **não** constitui o padrão de publicação: a decisão de manter cada applet, substituí-lo por JSXGraph ou trocá-lo por figura estática deve ser tomada caso a caso, conforme sua função pedagógica (§9). Enquanto isso, todo iframe deve ter `title`, `loading="lazy"` e um link alternativo (`{{< geogebra >}}`, ver `guia-editorial.md`).

## 21. Estrutura global do livro

O conteúdo deve ser organizado hierarquicamente:

**Livro → Unidade/Capítulo → Tópico → Página ou Lição → Componentes.**

Cada nível deve possuir função clara.

### Livro

Deve conter:

- apresentação;
- orientação de uso;
- estrutura geral do percurso;
- mecanismos globais de busca e navegação;
- convenções de notação e interação quando necessárias.

### Unidade ou capítulo

Deve apresentar:

- objetivo geral;
- relação com unidades anteriores;
- tópicos componentes;
- pré-requisitos relevantes;
- síntese ou atividade de consolidação quando pertinente.

### Tópico ou lição

Constitui a principal unidade de aprendizagem e deve permanecer suficientemente curta para manter coerência temática.

Não é necessário que cada tópico corresponda a uma única página física de HTML, mas deve representar uma unidade conceitual identificável.

## 22. Modelo modular de lição

Em vez de uma sequência rígida de etapas, o sistema deve disponibilizar componentes combináveis.

### Componentes de núcleo

Normalmente visíveis no fluxo principal:

- objetivo;
- pré-requisitos quando necessários;
- ideia central;
- uma ou mais representações;
- exemplo ou demonstração;
- oportunidade de prática ou verificação.

### Componentes de apoio

Inseridos quando contribuírem para o tópico:

- erro comum;
- nota de notação;
- interpretação geométrica;
- segundo exemplo;
- comparação de casos;
- applet;
- dica;
- síntese parcial.

### Componentes complementares

Podem permanecer fora do fluxo principal ou em estruturas expansíveis:

- remediação de pré-requisitos;
- demonstração mais detalhada;
- aprofundamento;
- desafio;
- material complementar.

A organização modular preserva a vantagem da proposta de três blocos do relatório revisto (ver Nota sobre fontes) sem transformar esses blocos em estrutura obrigatória para todos os conteúdos.

## 23. Tipos de página

Na fase inicial, deve-se limitar o número de modelos.

Recomenda-se estabelecer inicialmente quatro tipos:

### Página de conteúdo

Para introdução ou revisão conceitual.

### Página de exemplo e prática

Para modelagem de procedimento seguida de atividade do estudante.

### Página de exploração

Para tópicos nos quais uma representação dinâmica possui função central.

### Página de síntese

Para revisão, recuperação e integração de conteúdos.

Esses modelos devem reutilizar os mesmos componentes básicos. Novos tipos só devem ser criados quando houver necessidade recorrente.

## 24. Sistema de componentes

Todos os elementos recorrentes devem ser implementados como componentes ou classes reutilizáveis, evitando formatação manual página a página.

O conjunto inicial deve contemplar:

- objetivo;
- pré-requisito;
- ideia central;
- exemplo;
- definição;
- observação;
- erro comum;
- dica;
- applet;
- checkpoint;
- solução;
- remediação;
- desafio.

Cada componente deve possuir:

- função editorial definida;
- estilo visual consistente;
- semântica HTML adequada;
- comportamento responsivo;
- regras de uso documentadas.

O sistema deve permitir alteração global de aparência sem modificação individual de centenas de páginas.

## 25. Design tokens e identidade visual

Cores, tipografia, espaçamento, larguras, raios, bordas e estilos de foco não devem ser definidos arbitrariamente em cada página.

Devem ser centralizados em `_brand.yml`, SCSS ou variáveis CSS.

O sistema inicial deve definir pelo menos:

- família tipográfica de texto;
- família tipográfica de títulos, se diferente;
- escala tipográfica;
- largura máxima da coluna de leitura;
- escala de espaçamento;
- cores de texto e fundo;
- cor primária;
- cores semânticas;
- estilo de links;
- estilo de foco;
- estilo dos componentes didáticos.

A paleta deve permanecer relativamente pequena. Expansões posteriores devem reutilizar os papéis semânticos definidos inicialmente.

## 26. Layout principal

A página de conteúdo deve utilizar predominantemente uma coluna de leitura.

Elementos necessários à compreensão conjunta — fórmula, gráfico, legenda, instrução, exemplo ou controle — devem permanecer visualmente próximos.

Colunas laterais permanentes devem ser utilizadas apenas quando sua função justificar a redução do espaço disponível ao conteúdo principal.

Em telas estreitas, o conteúdo deve reorganizar-se naturalmente em uma única coluna.

A largura de leitura deve ser controlada como um parâmetro global e ajustada por testes de legibilidade, e não por formatação local.

## 27. Navegação

A primeira versão deve garantir navegação simples e previsível antes da implementação de mecanismos personalizados.

Devem existir:

- sumário global;
- indicação clara da unidade atual;
- navegação anterior/próxima;
- links consistentes para pré-requisitos;
- retorno fácil ao percurso principal;
- busca, quando tecnicamente disponível de forma estável;
- URLs persistentes para tópicos importantes.

O sistema de títulos e âncoras deve permitir referências internas precisas.

Mudanças posteriores na organização do conteúdo devem procurar preservar URLs sempre que possível.

## 28. Convenções matemáticas

O livro deve adotar convenções estáveis para:

- símbolos;
- variáveis;
- vetores;
- intervalos;
- conjuntos;
- coordenadas;
- unidades;
- casas decimais;
- terminologia.

A notação deve ser introduzida antes de uso intensivo.

Fórmulas não devem ser utilizadas como imagens salvo necessidade excepcional.

Representações matemáticas devem permanecer legíveis em zoom e em telas estreitas.

As convenções devem ser documentadas em um guia editorial curto para evitar divergências entre capítulos.

## 29. Imagens, gráficos e diagramas

Todo recurso visual deve possuir função identificável.

Na fase inicial, deve-se privilegiar:

- gráficos simples;
- diagramas limpos;
- consistência entre representação textual e visual;
- proximidade entre legenda e objeto;
- ausência de ornamentação irrelevante;
- versões responsivas quando necessário.

Figuras que contenham informação essencial devem possuir descrição textual adequada ao objetivo pedagógico.

Diagramas complexos devem ser testados em tamanho de tela reduzido antes de sua consolidação como padrão.

## 30. Padrão inicial para applets

Applets devem ser tratados como componentes especiais, e não como código independente inserido informalmente em páginas.

Cada applet deve possuir uma estrutura mínima:

1. título ou identificação;
2. breve objetivo;
3. instrução de interação;
4. área interativa;
5. mecanismo de reinicialização quando necessário;
6. representação textual do estado ou resultado relevante quando apropriado;
7. atividade ou pergunta associada.

O applet deve iniciar em um estado compreensível e com poucos controles.

Na primeira fase, deve-se priorizar applets pequenos, independentes e pedagogicamente claros. Applets multifuncionais devem ser evitados.

## 31. Arquitetura técnica dos applets

Os applets devem compartilhar uma convenção de implementação.

Recomenda-se separar:

- configuração matemática;
- estado;
- renderização;
- controles;
- textos de interface;
- estilos.

Identificadores, nomes de classes e estrutura de pastas devem seguir convenções estáveis.

Deve ser possível atualizar estilos, mensagens e comportamentos comuns sem alterar manualmente cada applet.

A arquitetura deve reservar pontos de extensão para futuras funcionalidades — como registro de eventos ou feedback adaptativo — sem implementar essas funcionalidades prematuramente.

## 32. Interação móvel

Responsividade deve ser requisito da primeira fase, porque corrigir posteriormente estruturas incompatíveis com toque tende a exigir alterações profundas.

Cada componente deve ser verificado em largura reduzida.

Para applets, devem ser avaliados desde o início:

- tamanho dos controles;
- espaço para toque;
- conflito entre arraste e scroll;
- necessidade de precisão;
- orientação do dispositivo;
- legibilidade de rótulos.

Soluções específicas, como bloqueio temporário de rolagem ou controles de incremento, podem ser introduzidas quando testes mostrarem sua necessidade. O relatório revisto (ver Nota sobre fontes) identifica corretamente esses problemas como relevantes para a experiência móvel, mas as soluções concretas devem permanecer sujeitas a validação.

## 33. Acessibilidade estrutural mínima

A primeira versão deve estabelecer requisitos que seriam caros de adicionar retroativamente.

São requisitos desde o início:

- HTML semanticamente estruturado;
- hierarquia correta de títulos;
- navegação básica por teclado;
- foco visível;
- contraste adequado;
- zoom e reflow;
- não utilização exclusiva de cor para transmitir informação;
- rótulos associados a controles;
- alternativas para ações que dependam exclusivamente de arraste;
- descrição textual de conteúdo visual relevante.

O objetivo deve ser compatibilidade progressiva com WCAG 2.2 AA. Para que os requisitos acima sejam verificáveis, adotam-se os seguintes valores (critérios de sucesso da WCAG 2.2):

| Requisito | Valor mínimo | Critério |
|---|---|---|
| Contraste de texto | 4,5:1 (3:1 para texto grande) | 1.4.3 |
| Contraste de elementos gráficos e de interface (bordas de blocos, pontos e objetos dos applets, foco) | 3:1 | 1.4.11 |
| Reflow | sem rolagem horizontal em 320 px de largura (exceto equações largas, tabelas e applets, que devem ter rolagem própria) | 1.4.10 |
| Ampliação do texto | utilizável a 200%, sem perda de conteúdo | 1.4.4 |
| Alvo de toque ou clique | 24 × 24 px CSS | 2.5.8 |
| Arraste | toda ação por arraste deve ter alternativa com um único ponteiro, sem arrastar (por exemplo, botões de incremento) | 2.5.7 |
| Teclado | toda funcionalidade, inclusive dos applets, operável por teclado | 2.1.1 |
| Foco | visível e não totalmente encoberto por outros elementos | 2.4.7, 2.4.11 |
| Imagem informativa | texto alternativo (`alt`) que preserve a função pedagógica | 1.1.1 |
| Iframe | `title` descritivo | 4.1.2 |

Os pares de cores da paleta atual (texto, links, bordas dos blocos e cores dos objetos matemáticos sobre o fundo claro) foram calculados em 04/10/2026 e atendem a esses valores; a menor razão encontrada é 3,99:1, na borda de "pré-requisitos" (`azul-5`), que satisfaz o critério de 3:1 para elementos gráficos, mas não serviria para texto. O tema escuro gerado a partir de `_brand.yml` ainda não foi medido.

Recursos mais sofisticados de acessibilidade dinâmica, como anúncios contextuais complexos por regiões ARIA, devem ser adicionados e testados conforme o comportamento dos componentes interativos exigir.

A versão revista (ver Nota sobre fontes) já estabelece contraste, controle por teclado e tratamento explícito de conteúdo dinâmico como requisitos importantes.

## 34. Desempenho e robustez

O livro deve permanecer funcional em conexões e dispositivos modestos.

Na fase inicial, isso implica:

- limitar bibliotecas;
- evitar carregamento de scripts não utilizados;
- otimizar imagens;
- carregar componentes interativos somente quando necessários;
- reduzir dependências externas;
- evitar vídeos ou animações automáticas pesadas;
- testar páginas representativas em dispositivos reais.

A simplicidade da stack é, portanto, tanto uma decisão de manutenção quanto uma decisão de experiência do usuário.

## 35. Organização do código e dos arquivos

A estrutura do projeto deve refletir funções, e não apenas capítulos.

Uma organização possível é:

```text
livro/
  _quarto.yml
  _brand.yml
  styles/
  scripts/
  components/
  applets/
  assets/
    images/
    data/
  chapters/
  references/
  tests/
```

Essa organização é uma referência de funções, **não** uma instrução para renomear pastas: renomear alteraria URLs (§27) e referências. Correspondência com a estrutura atual do repositório:

| Função (§35) | Local atual |
|---|---|
| `_quarto.yml`, `_brand.yml` | idem, na raiz |
| `styles/` | `assets/css/custom.scss` |
| `scripts/` e `applets/` (código-fonte) | `applets-src/` (Vite), com bundle gerado em `assets/js/applets-dist/` |
| `components/` | `components/` (filtros e shortcodes Lua) |
| `assets/images/` | `assets/img/` |
| `chapters/` | `capitulos/` e `index.qmd` |
| `references/` | `_interno/rascunhos/references.*` (bibliografia ainda não ativada) |
| `tests/` | `tests/` |
| documentação interna | `_interno/diretrizes/` e `_interno/rascunhos/` |

Dentro de `applets-src/src/applets/`, deve-se adotar convenção clara de nomes e, quando necessário, separar código reutilizável de implementações específicas.

Arquivos CSS e JavaScript globais devem permanecer centralizados.

Código exclusivo de uma página deve ser mantido próximo ao conteúdo correspondente ou claramente identificado.

## 36. Separação entre conteúdo e apresentação

O texto matemático deve permanecer o mais independente possível de detalhes de estilo.

Autores não devem precisar inserir repetidamente cores, margens, tamanhos ou código de interface para produzir conteúdo comum.

Isso permite:

- manutenção centralizada;
- reformulação visual;
- geração de formatos alternativos;
- maior consistência;
- menor probabilidade de erro.

A infraestrutura deve tornar o comportamento desejado o caminho mais simples para quem produz conteúdo.

## 37. Convenções editoriais

Deve ser criado um guia curto, versionado junto ao projeto, contendo:

- estrutura recomendada para novos tópicos;
- nomenclatura dos componentes;
- convenções matemáticas;
- regras para imagens;
- regras para applets;
- diretrizes de acessibilidade;
- processo de revisão;
- exemplos de implementação correta.

Esse documento deve ser breve o suficiente para ser efetivamente utilizado pela equipe.

## 38. Página-modelo de referência

Antes de produzir grande quantidade de conteúdo, deve ser construída uma página-modelo que represente o sistema pretendido.

Ela deve incluir:

- título e navegação;
- objetivo;
- texto matemático;
- fórmula;
- imagem ou gráfico;
- exemplo;
- componente de erro ou observação;
- applet simples;
- checkpoint;
- elemento expansível;
- navegação anterior/próxima.

Essa página funcionará como teste integrado de layout, tipografia, responsividade, acessibilidade, componentes e infraestrutura.

Somente depois de sua estabilização deve-se ampliar a produção em escala.

## 39. Critérios de aceitação da primeira fase

A estrutura global pode ser considerada suficientemente madura quando:

- páginas diferentes apresentam identidade e hierarquia consistentes;
- novos conteúdos podem ser produzidos sem criação frequente de CSS ou JavaScript específico;
- a navegação permanece compreensível;
- componentes funcionam em desktop e mobile;
- páginas básicas são navegáveis por teclado;
- matemática permanece legível em diferentes larguras;
- applets simples seguem uma estrutura comum;
- erros de estilo podem ser corrigidos globalmente;
- a equipe consegue identificar claramente onde adicionar novas funcionalidades.

## 40. Validação inicial

A primeira rodada de testes deve privilegiar falhas estruturais.

Devem ser testados:

- compreensão da navegação;
- legibilidade;
- densidade de informação;
- comportamento responsivo;
- foco e teclado;
- clareza dos componentes;
- desempenho;
- funcionamento dos applets básicos.

Testes de acessibilidade automatizados podem auxiliar, mas não substituem inspeção manual.

Sempre que possível, um pequeno número de estudantes do público-alvo deve utilizar páginas representativas. Nesta fase, o objetivo principal é detectar obstáculos recorrentes, e não produzir conclusões estatísticas sobre eficácia pedagógica.

A proposta anterior (ver Nota sobre fontes) de combinar testes tecnológicos, pilotagem com estudantes e avaliação posterior de dados oferece uma boa lógica de progressão, desde que essas fases não sejam confundidas entre si.

## 41. Recursos deliberadamente adiados

Para preservar foco na arquitetura fundamental, não devem constituir requisitos da primeira fase:

- telemetria detalhada de comportamento;
- xAPI ou Learning Record Store;
- dashboards de aprendizagem;
- perfis individuais;
- recomendação automática de conteúdo;
- adaptação algorítmica de percurso;
- feedback gerado dinamicamente a partir de modelos complexos;
- gamificação;
- sistemas avançados de conquistas;
- grande variedade de bibliotecas de applets;
- animações decorativas;
- personalização extensa da interface.

Isso não implica rejeição desses recursos. Significa apenas que sua implementação deve ocorrer quando houver infraestrutura, necessidade pedagógica e capacidade de avaliação suficientes.

A telemetria proposta no relatório revisto (ver Nota sobre fontes), por exemplo, pode ser útil em fases posteriores, mas eventos como tempo de interação, quantidade de movimentos ou acionamento de reset não devem ser tratados isoladamente como indicadores de aprendizagem.

## 42. Preparação para fases posteriores

Embora recursos avançados não sejam implementados inicialmente, a arquitetura deve evitar bloqueá-los.

Isso implica:

- identificadores consistentes para páginas, componentes e applets;
- componentes reutilizáveis;
- separação entre lógica e apresentação;
- eventos JavaScript padronizáveis;
- metadados básicos de conteúdo;
- estrutura que permita posteriormente adicionar checkpoints persistentes;
- possibilidade de registrar eventos sem reescrever os applets;
- versionamento do conteúdo e do código.

A diferença é fundamental: **preparar a arquitetura para uma funcionalidade futura não significa implementá-la agora**.

## 43. Ordem recomendada de desenvolvimento

A sequência inicial recomendada é:

**1. Arquitetura de informação**
Definir livro, capítulos, tópicos, URLs e navegação.

**2. Sistema visual básico**
Definir tipografia, largura, cores, espaçamentos e responsividade.

**3. Componentes editoriais**
Criar e documentar componentes recorrentes.

**4. Página-modelo**
Testar o sistema completo em um tópico representativo.

**5. Acessibilidade e mobile estrutural**
Corrigir problemas antes da expansão.

**6. Padrão de applets**
Construir poucos applets representativos e estabilizar sua arquitetura.

**7. Produção de conteúdo em escala**
Expandir capítulos reutilizando os padrões.

**8. Pilotagem**
Observar uso real e revisar decisões.

**9. Funcionalidades avançadas**
Somente então avaliar telemetria, personalização, feedback adaptativo e outras extensões.

## 44. Licenças e atribuições

O repositório ainda não define a licença do conteúdo nem do código (o README registra "definir antes da publicação pública"). Essa decisão precisa ser tomada antes da publicação aberta e deve distinguir texto, figuras e código.

Materiais de terceiros presentes hoje, a verificar antes da publicação:

- **GeoGebra:** 15 applets incorporados por iframe. Os termos de uso do GeoGebra e a licença escolhida por cada autor de material continuam valendo. Registrar, para cada applet, o autor e o endereço de origem.
- **JSXGraph:** distribuído com licença dupla (LGPL e MIT, conforme os arquivos de licença do pacote). O bundle gerado (`applets-livro.iife.js`) hoje **não** contém o aviso de licença, que a minificação remove; incluí-lo antes da publicação aberta.
- **Fontes (Atkinson Hyperlegible e Source Serif 4):** declaradas em `_brand.yml` com origem Google Fonts. Confirmar a licença de cada fonte, se o site de fato as carrega e se a publicação precisa de aviso.
- **Figuras:** muitas imagens vieram de exportações de ferramentas externas (nomes como `Untitled.png` e `material-xxxx.png`). Registrar a origem de cada uma ao substituí-la ou reescrevê-la.

## 45. Registro de decisões

Decisões que alteram a arquitetura devem ser registradas em uma linha, com data, decisão e motivo, em `_interno/diretrizes/decisoes.md`. O registro evita rediscutir escolhas já feitas e permite revê-las quando surgir evidência nova (§18).

## Conclusão

A qualidade do livro online dependerá menos da quantidade inicial de recursos disponíveis do que da solidez de sua arquitetura pedagógica, editorial e tecnológica.

A primeira fase deve produzir um ambiente previsível, legível, acessível, responsivo e fácil de manter. O estudante deve poder concentrar seus recursos cognitivos na matemática, enquanto a equipe deve poder produzir e revisar conteúdo sem multiplicar soluções particulares.

A arquitetura deve ser suficientemente consistente para reduzir complexidade e suficientemente modular para admitir diferenças reais entre conteúdos.

Sobre essa base, recursos interativos, mecanismos de feedback, práticas de recuperação, adaptações de percurso e sistemas de análise podem ser progressivamente incorporados e avaliados.

O princípio de desenvolvimento é, portanto:

**primeiro consolidar estrutura, consistência e clareza; depois acrescentar sofisticação onde houver benefício pedagógico demonstrável.**