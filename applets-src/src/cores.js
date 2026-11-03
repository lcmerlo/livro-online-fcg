// applets-src/src/cores.js
//
// Ponte entre o CSS do livro e os applets: lê as variáveis --cor-… definidas
// em :root (assets/css/custom.scss, a partir da paleta de _brand.yml), para
// que os applets usem as mesmas cores do texto. Fora do livro (npm run dev),
// as variáveis vêm do :root de applets-src/index.html.

// Devolve o valor da variável CSS `nome` (ex.: "--cor-texto") ou `fallback`,
// se ela não estiver definida na página.
export function cor(nome, fallback = "#000000") {
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nome)
    .trim();

  return valor || fallback;
}

// Cores dos applets, por papel didático (mesmos nomes da seção "Objetos
// matemáticos" de custom.scss). Cada papel tem três tons: Suave, base e Forte.
// Os valores são lidos uma única vez, quando o bundle é carregado.
export const CORES = {
  // Texto e superfície (fundo de pontos fixos, por exemplo)
  texto: cor("--cor-texto"),
  superf: cor("--cor-superf"),

  // Objeto principal: aquilo que o applet estuda
  objPrincSuave: cor("--cor-obj-princ-suave"),
  objPrinc: cor("--cor-obj-princ"),
  objPrincForte: cor("--cor-obj-princ-forte"),

  // Objetos manipuláveis: o que o leitor pode arrastar
  objManipSuave: cor("--cor-manip-suave"),
  objManip: cor("--cor-manip"),
  objManipForte: cor("--cor-manip-forte"),

  // Construções: objetos obtidos a partir de outros
  objConstrSuave: cor("--cor-constr-suave"),
  objConstr: cor("--cor-constr"),
  objConstrForte: cor("--cor-constr-forte"),

  // Auxiliares: guias, projeções, linhas de apoio
  objAuxSuave: cor("--cor-aux-suave"),
  objAux: cor("--cor-aux"),
  objAuxForte: cor("--cor-aux-forte"),

  // Invariantes: o que se mantém quando os objetos se movem
  objInvarSuave: cor("--cor-invar-suave"),
  objInvar: cor("--cor-invar"),
  objInvarForte: cor("--cor-invar-forte"),

  // Erro: contraexemplos e situações inválidas
  erroSuave: cor("--cor-erro-suave"),
  erro: cor("--cor-erro"),
  erroForte: cor("--cor-erro-forte"),
};
