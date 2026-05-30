import { CORES } from "../cores.js";

export const ESTILOS = {
  pontoManip: {
    size: 5,
    strokeWidth: 2,
    strokeColor: CORES.objManip,
    fillColor: CORES.objManip,
    highlightStrokeColor: CORES.objManip,
    highlightFillColor: CORES.objManip,
    fixed: false,
  },

  pontoFixo: {
    size: 4,
    strokeWidth: 2,
    strokeColor: CORES.texto,
    fillColor: CORES.superf,
    highlightStrokeColor: CORES.texto,
    highlightFillColor: CORES.superf,
    fixed: true,
  },

  retaPrinc: {
    strokeColor: CORES.objPrinc,
    strokeWidth: 3,
    highlightStrokeColor: CORES.objPrinc,
  },

  objAux: {
    strokeColor: CORES.objAux,
    strokeWidth: 1.5,
    dash: 2,
    highlightStrokeColor: CORES.objAux,
  },

  objConstr: {
    strokeColor: CORES.objConstr,
    strokeWidth: 2.5,
    highlightStrokeColor: CORES.objConstr,
  },

  invar: {
    strokeColor: CORES.objInvar,
    fillColor: CORES.objInvar,
    strokeWidth: 2.5,
    highlightStrokeColor: CORES.objInvar,
  },

  erro: {
    strokeColor: CORES.erro,
    fillColor: CORES.erro,
    strokeWidth: 3,
    dash: 1,
    highlightStrokeColor: CORES.erro,
  },
};

