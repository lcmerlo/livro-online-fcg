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
// matemáticos" de custom.scss). Cada papel tem três tons: Suave, base e Forte.
// Os valores são lidos uma única vez, quando o bundle é carregado.
export const CORES = {
  // Texto e superfícies. superfSuave é o fundo do quadro (o do .bloco-applet,
  // que fica atrás dele) e preenche o miolo dos pontos abertos.
  texto: cor("--cor-texto"),
  superf: cor("--cor-superf"),
  superfSuave: cor("--cor-superf-suave"),

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
