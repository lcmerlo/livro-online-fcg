// applets-src/src/tools/quadro.js
//
// Cria o quadro de um applet com os padrões que todo applet do livro segue
// (diretrizes-tecnicas.md, §4.4 e §4.5):
//   - a janela é uma região do plano, e a altura do quadro segue a proporção
//     dessa região, para mostrar a mesma região em qualquer largura;
//   - o plano não se desloca nem muda de escala: nem com o mouse, nem com os
//     dedos, nem com Shift + setas. A região mostrada faz parte da matemática;
//   - no toque, um dedo fora dos pontos rola a página, como no resto do
//     livro; sobre um ponto que se arrasta, arrasta o ponto;
//   - o ponto arrastado não sai da região mostrada;
//   - os nomes dos objetos são TeX ("\\vec{u}", "A"), desenhados pelo KaTeX
//     da página, com as macros do livro, como as fórmulas do texto.
//
// Uso, dentro da função de criação de um applet:
//   const board = criarQuadro({ JXG, id, regiao: [-1, 5, 7, -1], eixos: true });
//   if (!board) return null;
// Os demais atributos vão direto para o JSXGraph (JXG.JSXGraph.initBoard).
// Num applet com várias partes, o id é o da parte: criarQuadro({ JXG,
// id: partes.figura, … }); ligarQuadros, no fim do arquivo, liga os quadros.

import { CORES } from "../cores.js";

// regiao: [x mín., y máx., x máx., y mín.], com números simples.
// eixos e grade: true para mostrar (só quando o estudante precisa ler valores).
// Devolve o quadro, ou null se o contêiner não existir na página.
export function criarQuadro({ JXG, id, regiao, eixos = false, grade = false, ...atributos }) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`[AppletsLivro] Elemento não encontrado: ${id}`);
    return null;
  }

  // Só um contêiner de quadro (.applet-jxg, do shortcode ou de uma parte
  // .quadro do bloco): desenhar no bloco inteiro apagaria o texto de estado
  // e o botão "Reiniciar".
  if (!elemento.classList.contains("applet-jxg")) {
    console.warn(`[AppletsLivro] ${id} não é um quadro (.applet-jxg)`);
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

  // Um ponto arrastado não sai da região mostrada (com o mouse, o dedo ou as
  // setas): a cada atualização, o ponto livre e visível que saiu volta para a
  // borda. Pontos ocultos ficam de fora, porque podem estar longe de propósito.
  board.on("update", () => {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();

    for (const objeto of board.objectsList) {
      if (
        objeto.type === JXG.OBJECT_TYPE_POINT &&
        objeto.isDraggable &&
        !objeto.evalVisProp("fixed") &&
        objeto.visPropCalc.visible
      ) {
        const x = Math.min(Math.max(objeto.X(), xMin), xMax);
        const y = Math.min(Math.max(objeto.Y(), yMin), yMax);

        // moveTo atualiza o quadro de novo; nessa segunda vez, nada sai.
        if (x !== objeto.X() || y !== objeto.Y()) {
          objeto.moveTo([x, y]);
        }
      }
    }
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

  // Nomes dos objetos (o name de pontos, setas, retas…) em TeX, desenhados
  // pelo KaTeX da página com as macros do livro, em 16 px e na cor do texto,
  // como no JSX-quarto. Vale para os objetos criados depois daqui: os números
  // dos eixos, criados com o quadro, continuam em texto simples.
  Object.assign(board.options.label, {
    useKatex: true,
    fontSize: 16,
    strokeColor: CORES.texto,
    highlightStrokeColor: CORES.texto,
  });
  conferirTextos(board, JXG);

  return board;
}

// O nome de uma seta se afasta do traço pela largura do nome (seta, em
// tools/styles.js). Quando um texto muda de tamanho (outro valor, ou as
// fontes do KaTeX, que chegam depois da página), o JSXGraph o posiciona antes
// de medi-lo de novo, e o nome fica perto demais até a próxima atualização.
// Logo depois de cada atualização, os tamanhos são conferidos, e o quadro é
// redesenhado uma vez se algum mudou. (Adaptado de lib/core.js do JSX-quarto.)
function conferirTextos(board, JXG) {
  const vistos = new Map();
  let agendado = false;
  let propria = false;

  function conferir() {
    agendado = false;

    // A atualização pedida daqui não pede outra.
    if (propria) {
      propria = false;
      return;
    }

    let mudou = false;

    for (const objeto of board.objectsList) {
      const no = objeto.type === JXG.OBJECT_TYPE_TEXT && objeto.visPropCalc.visible && objeto.rendNode;

      if (!no?.offsetWidth) {
        continue;
      }

      const tamanho = [no.offsetWidth, no.offsetHeight];
      const antes = vistos.get(objeto);

      if (antes && antes[0] === tamanho[0] && antes[1] === tamanho[1]) {
        continue;
      }

      // Compara com o último tamanho visto aqui, e não com objeto.size: o
      // próprio JSXGraph o acerta depois de posicionar o texto.
      vistos.set(objeto, tamanho);
      objeto.size = tamanho;
      mudou = true;
    }

    if (mudou) {
      propria = true;
      board.update();
    }
  }

  function agendar() {
    if (!agendado) {
      agendado = true;
      setTimeout(conferir);
    }
  }

  board.on("update", agendar);
  document.fonts?.addEventListener("loadingdone", agendar);
}

// Quadros ligados: mexer num redesenha os outros. Serve ao applet com dois
// ou mais quadros em que um mostra o que depende do outro, onde quer que o
// capítulo os tenha posto.
//   const [vetores, soma] = ligarQuadros(quadroVetores, quadroSoma);
export function ligarQuadros(...quadros) {
  for (const a of quadros) {
    for (const b of quadros) {
      if (a !== b) {
        a.addChild(b);
      }
    }
  }

  return quadros;
}
