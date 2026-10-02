// applets-src/src/cores.js

export function cor(nome, fallback = "#000000") {
  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nome)
    .trim();

  return valor || fallback;
}

export const CORES = {
  texto: cor("--cor-texto"),
  superf: cor("--cor-superf"),

  objPrincSuave: cor("--cor-obj-princ-suave"),
  objPrinc: cor("--cor-obj-princ"),
  objPrincForte: cor("--cor-obj-princ-forte"),

  objManipSuave: cor("--cor-manip-suave"),
  objManip: cor("--cor-manip"),
  objManipForte: cor("--cor-manip-forte"),

  objConstrSuave: cor("--cor-constr-suave"),
  objConstr: cor("--cor-constr"),
  objConstrForte: cor("--cor-constr-forte"),

  objAuxSuave: cor("--cor-aux-suave"),
  objAux: cor("--cor-aux"),
  objAuxForte: cor("--cor-aux-forte"),

  objInvarSuave: cor("--cor-invar-suave"),
  objInvar: cor("--cor-invar"),
  objInvarForte: cor("--cor-invar-forte"),

  erroSuave: cor("--cor-erro-suave"),
  erro: cor("--cor-erro"),
  erroForte: cor("--cor-erro-forte"),
};