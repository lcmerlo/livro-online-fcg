// applets-src/src/tools/quadro.js
//
// Cria o quadro de um applet com os padrões que todo applet do livro segue
// (diretrizes-tecnicas.md, §4.4 e §4.5):
//   - a janela é uma região do plano, e a altura do quadro segue a proporção
//     dessa região, para mostrar a mesma região em qualquer largura;
//   - o plano não se desloca nem muda de escala: nem com o mouse, nem com os
//     dedos, nem com Shift + setas. A região mostrada faz parte da matemática;
//   - no toque, um dedo fora dos pontos rola a página, como no resto do
//     livro; sobre um ponto que se arrasta, arrasta o ponto.
//
// Uso, dentro da função de criação de um applet:
//   const board = criarQuadro({ JXG, id, regiao: [-1, 5, 7, -1], eixos: true });
//   if (!board) return null;
// Os demais atributos vão direto para o JSXGraph (JXG.JSXGraph.initBoard).

// regiao: [x mín., y máx., x máx., y mín.], com números simples.
// eixos e grade: true para mostrar (só quando o estudante precisa ler valores).
// Devolve o quadro, ou null se o contêiner não existir na página.
export function criarQuadro({ JXG, id, regiao, eixos = false, grade = false, ...atributos }) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`[AppletsLivro] Elemento não encontrado: ${id}`);
    return null;
  }

  // Contêiner vazio antes de o JSXGraph desenhar o quadro.
  elemento.innerHTML = "";

  // A altura segue a região (largura/altura = Δx/Δy); a largura vem do CSS
  // (.applet-jxg, em custom.scss).
  const [xMin, yMax, xMax, yMin] = regiao;
  elemento.style.aspectRatio = `${xMax - xMin} / ${yMax - yMin}`;

  const board = JXG.JSXGraph.initBoard(id, {
    // Nome acessível do quadro: o aria-label gerado pelo shortcode.
    title: elemento.getAttribute("aria-label") ?? "",
    boundingbox: regiao,
    // Mesma escala nos dois eixos, para que distâncias e ângulos não
    // apareçam distorcidos.
    keepAspectRatio: true,
    axis: eixos,
    grid: grade,
    showCopyright: false,
    showNavigation: false,
    // O padrão do JSXGraph desloca o plano com um dedo (ou Shift + arrastar)
    // e muda a escala com dois dedos (ou Shift + roda). Aqui, nada disso.
    pan: { enabled: false },
    zoom: { enabled: false },
    // Com o foco num ponto, Shift + setas deslocaria o plano; as setas sem
    // Shift continuam movendo o ponto.
    keyboard: { panShift: false },
    ...atributos,
  });

  // Com a área de captura maior (tools/styles.js), dois pontos próximos podem
  // estar ao alcance do mesmo toque, e o JSXGraph escolheria o último
  // arrastado, mesmo com o dedo bem em cima do outro. Antes dele (fase de
  // captura do evento), o ponto arrastável mais próximo passa a contar como o
  // último arrastado e é o escolhido.
  elemento.addEventListener(
    "pointerdown",
    (evento) => {
      const caixa = elemento.getBoundingClientRect();
      const x = evento.clientX - caixa.left;
      const y = evento.clientY - caixa.top;
      let maisProximo = null;
      let menorDistancia = Infinity;

      for (const objeto of board.objectsList) {
        if (JXG.isPoint(objeto) && objeto.isDraggable && !objeto.evalVisProp("fixed") && objeto.visPropCalc.visible) {
          const [, px, py] = objeto.coords.scrCoords;
          const distancia = Math.hypot(px - x, py - y);

          if (distancia < menorDistancia) {
            menorDistancia = distancia;
            maisProximo = objeto;
          }
        }
      }

      if (maisProximo) {
        maisProximo.lastDragTime = new Date();
      }
    },
    { capture: true },
  );

  // Toque: o CSS (.applet-jxg, em custom.scss) deixa a página rolar com o
  // dedo sobre o quadro. Quando o dedo pega um ponto, o JSXGraph já entrou no
  // modo de arraste no pointerdown, que vem antes do touchstart; cancelar o
  // touchstart impede a rolagem durante esse toque. (O browserPan do JSXGraph
  // faz essa escolha com um toque de atraso: conferido no Chrome em 2026-11-03.)
  elemento.addEventListener(
    "touchstart",
    (evento) => {
      if (board.mode === board.BOARD_MODE_DRAG) {
        evento.preventDefault();
      }
    },
    { passive: false },
  );

  return board;
}
