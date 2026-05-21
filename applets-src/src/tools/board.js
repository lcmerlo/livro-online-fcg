export function criarBoard(id, opcoes = {}) {
  const configuracaoPadrao = {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    grid: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
  };

  return JXG.JSXGraph.initBoard(id, {
    ...configuracaoPadrao,
    ...opcoes,
  });
}

export function limparBoard(board) {
  if (!board) return;

  try {
    JXG.JSXGraph.freeBoard(board);
  } catch (erro) {
    console.warn("Não foi possível limpar o board JSXGraph:", erro);
  }
}

export function atualizarBoard(board) {
  if (board && typeof board.update === "function") {
    board.update();
  }
}