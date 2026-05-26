import {
  estiloPontoManipulavel,
  estiloRetaPrincipal,
} from "../tools/styles.js";

export function criarSegmento({ id, JXG }) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`[AppletsLivro] Elemento não encontrado: ${id}`);
    return null;
  }

  elemento.innerHTML = "";

  const board = JXG.JSXGraph.initBoard(id, {
    boundingbox: [-1, 5, 7, -1],
    axis: true,
    grid: true,
    showCopyright: false,
    showNavigation: false,
    keepAspectRatio: true,
  });

  const A0 = [1, 1];
  const B0 = [5, 3];

  const A = board.create("point", A0, {
    name: "A",
    ...estiloPontoManipulavel,
  });

  const B = board.create("point", B0, {
    name: "B",
    ...estiloPontoManipulavel,
  });

  const segmento = board.create("segment", [A, B], {
    name: "AB",
    ...estiloRetaPrincipal,
  });

  function reset() {
    A.moveTo(A0);
    B.moveTo(B0);
    board.update();
  }

  return {
    board,
    objetos: { A, B, segmento },
    reset,
  };
}