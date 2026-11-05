// applets-src/src/cores.js
//
// Ponte entre o CSS do livro e os applets: lê as variáveis --cor-… definidas
// em :root (assets/css/custom.scss, a partir da paleta de _brand.yml), para
// que os applets usem as mesmas cores do texto. Fora do livro (npm run dev),
// as variáveis vêm do :root de applets-src/index.html.

// Valores já lidos: as cores não mudam enquanto a página está aberta.
const lidas = new Map();

// Devolve o valor da variável CSS `nome` (ex.: "--cor-texto") ou `fallback`,
// se ela não estiver definida na página. A falta é avisada no console: sem
// o aviso, o objeto apareceria preto sem explicação.
export function cor(nome, fallback = "#000000") {
  if (!lidas.has(nome)) {
    const valor = getComputedStyle(document.documentElement)
      .getPropertyValue(nome)
      .trim();

    if (!valor) {
      console.warn(`[AppletsLivro] Cor não encontrada: ${nome}`);
    }

    lidas.set(nome, valor || fallback);
  }

  return lidas.get(nome);
}

// Cor da paleta de _brand.yml pelo nome, para testes: paleta("blue-oi"),
// paleta("laranja-2"). O Quarto cria uma variável --brand-<nome> para cada
// cor da paleta. Num applet publicado, a cor vem do papel didático (CORES,
// abaixo); o verificador avisa se um applet usado no livro chamar paleta().
export function paleta(nome) {
  return cor(`--brand-${nome}`);
}

// Cores dos applets, por papel didático (mesmos nomes da seção "Objetos
// matemáticos" de custom.scss): três papéis, um tom cada. Dois objetos do
// mesmo papel (u e v) se distinguem pelo nome junto a eles; a forma do ponto
// diz o que se move (tools/styles.js); erro ou contraexemplo não tem cor
// própria (ESTILOS.alerta). Os valores são lidos uma única vez, quando o
// bundle é carregado.
export const CORES = {
  // Texto e superfícies. superfSuave é o fundo do quadro (o do .bloco-applet,
  // que fica atrás dele) e preenche o miolo dos pontos abertos. A cor do
  // texto serve também a nomes, à origem e a pontos de referência.
  texto: cor("--cor-texto"),
  superf: cor("--cor-superf"),
  superfSuave: cor("--cor-superf-suave"),

  // Dado: o que o estudante controla ou o que o enunciado fornece
  dado: cor("--cor-dado"),

  // Resultado: o que o applet calcula a partir dos dados; o foco da ideia
  resultado: cor("--cor-resultado"),

  // Apoio: construções que ajudam a ler (cópias, projeções, linhas de chamada)
  apoio: cor("--cor-apoio"),
};
