// applets-src/src/cores.js
export function cor(nome, fallback = "#000000") {
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nome)
    .trim();

  return valor || fallback;
}

export const CORES = {
  objPrincipalA: cor("--cor-obj-principal-a"),
  objPrincipalB: cor("--cor-obj-principal-b"),
  objPrincipalC: cor("--cor-obj-principal-c"),

  manipulavelA: cor("--cor-manipulavel-a"),
  manipulavelB: cor("--cor-manipulavel-b"),
  manipulavelC: cor("--cor-manipulavel-c"),

  construidoA: cor("--cor-construido-a"),
  construidoB: cor("--cor-construido-b"),
  construidoC: cor("--cor-construido-c"),

  auxiliarA: cor("--cor-auxiliar-a"),
  auxiliarB: cor("--cor-auxiliar-b"),
  auxiliarC: cor("--cor-auxiliar-c"),

  invarianteA: cor("--cor-invariante-a"),
  invarianteB: cor("--cor-invariante-b"),
  invarianteC: cor("--cor-invariante-c"),

  erroA: cor("--cor-erro-a"),
  erroB: cor("--cor-erro-b"),
  erroC: cor("--cor-erro-c"),
};