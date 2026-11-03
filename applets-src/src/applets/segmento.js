// applets-src/src/applets/segmento.js
//
// Applet do capítulo Segmentos: dois pontos manipuláveis, A e B, e o
// segmento AB. Uso no .qmd:
//   {{< applet segmento id="jxg-segmento-1" rotulo="Descrição acessível" >}}

import { ESTILOS } from "../tools/styles.js";

// Chamada por main.js com o id do contêiner e a biblioteca JSXGraph.
// Devolve { board, objetos, reset } ou null, se o contêiner não existir.
export function criarSegmento({ id, JXG }) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`[AppletsLivro] Elemento não encontrado: ${id}`);
    return null;
  }

  // O rótulo acessível vem do aria-label gerado pelo shortcode.
  const titulo = elemento.getAttribute("aria-label") ?? "";

  // Contêiner vazio antes de o JSXGraph desenhar o quadro.
  elemento.innerHTML = "";

  const board = JXG.JSXGraph.initBoard(id, {
    title: titulo,
    // Janela visível: [x mín., y máx., x máx., y mín.]
    boundingbox: [-1, 5, 7, -1],
    axis: true,
    grid: true,
    showCopyright: false,
    showNavigation: false,
    // Mesma escala nos dois eixos, para que distâncias não apareçam
    // distorcidas.
    keepAspectRatio: true,
  });

  // Posições iniciais, reaproveitadas pelo reset().
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

  // Segmento definido pelos próprios pontos: acompanha A e B ao arrastar.
  const segmento = board.create("segment", [A, B], {
    name: "AB",
    ...ESTILOS.retaPrinc,
  });

  // Descrição textual do estado, lida por leitores de tela (role="status").
  // Atualizada com atraso para não anunciar cada passo do arraste.
  const status = document.getElementById(`${id}-status`);
  // Números com ponto decimal e até 2 casas (convenção provisória do livro,
  // diretrizes-tecnicas.md, §5). Number() tira os zeros à direita e o "-0".
  const numero = (x) => String(Number(x.toFixed(2)));
  // Temporizador do atraso (debounce) entre o arraste e o anúncio.
  let espera;

  function descrever() {
    const [xA, yA] = [A.X(), A.Y()];
    const [xB, yB] = [B.X(), B.Y()];
    const d = Math.hypot(xB - xA, yB - yA);
    const pontos = `A = (${numero(xA)}, ${numero(yA)}) e B = (${numero(xB)}, ${numero(yB)})`;

    // Tolerância em vez de d === 0, por causa do arredondamento em ponto
    // flutuante.
    status.textContent = d < 1e-9
      ? `${pontos}: os pontos coincidem; o segmento é degenerado e d(A, B) = 0.`
      : `${pontos}; comprimento d(A, B) ≈ ${numero(d)}.`;
  }

  // Sem o parágrafo de estado na página, o applet funciona sem descrição.
  if (status) {
    descrever();
    // A cada atualização do quadro, reinicia a contagem: o texto só é
    // refeito 400 ms depois do último movimento.
    board.on("update", () => {
      clearTimeout(espera);
      espera = setTimeout(descrever, 400);
    });
  }

  // Volta A e B às posições iniciais. O board.update() redesenha o quadro
  // e dispara o evento "update", que também atualiza a descrição.
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
