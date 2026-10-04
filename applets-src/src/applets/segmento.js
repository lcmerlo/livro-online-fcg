import { ESTILOS } from "../tools/styles.js";

export function criarSegmento({ id, JXG }) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`[AppletsLivro] Elemento não encontrado: ${id}`);
    return null;
  }

  const titulo = elemento.getAttribute("aria-label") ?? "";

  elemento.innerHTML = "";

  const board = JXG.JSXGraph.initBoard(id, {
    title: titulo,
    boundingbox: [-1, 5, 7, -1],
    axis: true,
    grid: true,
    showCopyright: false,
    showNavigation: false,
    keepAspectRatio: true,
  });

  const A0 = [1, 1];
  const B0 = [5, 3];

  // Coordenadas inteiras: permitem fazer A e B coincidirem (segmento
  // degenerado) com o mouse e com as setas do teclado.
  const A = board.create("point", A0, {
    name: "A",
    ...ESTILOS.pontoManip,
    snapToGrid: true,
  });

  const B = board.create("point", B0, {
    name: "B",
    ...ESTILOS.pontoManip,
    snapToGrid: true,
  });

  const segmento = board.create("segment", [A, B], {
    name: "AB",
    ...ESTILOS.retaPrinc,
  });

  // Descrição textual do estado, lida por leitores de tela (role="status").
  // Atualizada com atraso para não anunciar cada passo do arraste.
  const status = document.getElementById(`${id}-status`);
  const numero = (x) => x.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  let espera;

  function descrever() {
    const [xA, yA] = [A.X(), A.Y()];
    const [xB, yB] = [B.X(), B.Y()];
    const d = Math.hypot(xB - xA, yB - yA);
    const pontos = `A = (${numero(xA)}, ${numero(yA)}) e B = (${numero(xB)}, ${numero(yB)})`;

    status.textContent = d < 1e-9
      ? `${pontos}: os pontos coincidem; o segmento é degenerado e d(A, B) = 0.`
      : `${pontos}; comprimento d(A, B) ≈ ${numero(d)}.`;
  }

  if (status) {
    descrever();
    board.on("update", () => {
      clearTimeout(espera);
      espera = setTimeout(descrever, 400);
    });
  }

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