// applets-src/src/tools/styles.js
//
// Aparências prontas para objetos JSXGraph, alinhadas ao código de cores do
// livro (ver cores.js). Cada estilo é um objeto de atributos do JSXGraph,
// espalhado na criação do objeto, podendo ser complementado:
//   board.create("point", [1, 1], { name: "A", ...ESTILOS.pontoManip });
//
// Os atributos highlight* repetem as cores normais para que o objeto não
// mude de cor quando o mouse passa sobre ele (comportamento padrão do JSXGraph).

import { CORES } from "../cores.js";

export const ESTILOS = {
  // Ponto que o leitor pode arrastar (mouse, toque ou teclado)
  pontoManip: {
    size: 5,
    strokeWidth: 2,
    strokeColor: CORES.objManip,
    fillColor: CORES.objManip,
    highlightStrokeColor: CORES.objManip,
    highlightFillColor: CORES.objManip,
    fixed: false,
    // Entra na ordem de foco do Tab; com foco, move-se pelas setas.
    tabindex: 0,
  },

  // Ponto dado, que não se move: contorno na cor do texto, miolo vazado
  pontoFixo: {
    size: 4,
    strokeWidth: 2,
    strokeColor: CORES.texto,
    fillColor: CORES.superf,
    highlightStrokeColor: CORES.texto,
    highlightFillColor: CORES.superf,
    fixed: true,
  },

  // Reta, segmento ou curva que é o objeto principal da ideia
  retaPrinc: {
    strokeColor: CORES.objPrinc,
    strokeWidth: 3,
    highlightStrokeColor: CORES.objPrinc,
  },

  // Elemento auxiliar: fino e tracejado (dash 2 = tracejado médio)
  objAux: {
    strokeColor: CORES.objAux,
    strokeWidth: 1.5,
    dash: 2,
    highlightStrokeColor: CORES.objAux,
  },

  // Construção derivada de outros objetos
  objConstr: {
    strokeColor: CORES.objConstr,
    strokeWidth: 2.5,
    highlightStrokeColor: CORES.objConstr,
  },

  // Invariante: o que permanece constante quando os objetos se movem
  invar: {
    strokeColor: CORES.objInvar,
    fillColor: CORES.objInvar,
    strokeWidth: 2.5,
    highlightStrokeColor: CORES.objInvar,
  },

  // Erro ou contraexemplo: traço grosso e tracejado curto (dash 1)
  erro: {
    strokeColor: CORES.erro,
    fillColor: CORES.erro,
    strokeWidth: 3,
    dash: 1,
    highlightStrokeColor: CORES.erro,
  },
};
