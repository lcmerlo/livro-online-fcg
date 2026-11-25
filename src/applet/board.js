// Um board do JSXGraph com o que todo board do livro precisa. O plano faz parte da
// matemática, e por isso fica sem pan e sem zoom; o dedo fora dos pontos rola a
// página; um ponto arrastado fica dentro da região mostrada.
//   region   [xMin, yMax, xMax, yMin], em números simples; com shareScale (applet.js),
//            é o mínimo que o board mostra
//   ratio    '3 / 1' solta as escalas (gráficos de função); sem ele, os dois eixos têm
//            a mesma escala, e a altura segue a região
//   axis     true ou { x: {...}, y: {...} }; grid: true ou { step, essential }
// O resto vai direto para JXG.JSXGraph.initBoard.

import { createTheme, styleNative } from './theme.js';

export function createBoard(JXG, element, customElements, signal, { region, ratio, axis = false, grid = false, ...attributes }) {
  const theme = createTheme(element);
  const [xMin, yMax, xMax, yMin] = region;
  const givenRatio = ratio ?? element.dataset.ratio;

  element.classList.add('jxgbox');
  element.classList.toggle('free-scale', Boolean(givenRatio));
  element.style.aspectRatio = givenRatio ?? `${xMax - xMin} / ${yMax - yMin}`;

  const board = JXG.JSXGraph.initBoard(element, {
    boundingbox: region,
    keepAspectRatio: !givenRatio,
    title: element.getAttribute('aria-label') ?? '',
    axis: false,
    showCopyright: false,
    showNavigation: false,
    showInfobox: false,
    pan: { enabled: false },
    zoom: { enabled: false },
    keyboard: { enabled: true, dx: 10, dy: 10, panShift: false },
    ...attributes,
  });

  board.theme = theme;
  board.handles = [];
  board.region = region;
  board.freeScale = Boolean(givenRatio);

  // Os objetos nativos nascem parados, a não ser os handles e as figuras com
  // translatable, e usam as mesmas palavras do livro.
  Object.assign(board.options.elements, { fixed: true, highlight: false });
  Object.assign(board.options.point, { ...theme.point(), fixed: true, highlight: false, withLabel: false });
  for (const kind of ['text', 'label']) {
    Object.assign(board.options[kind], {
      useKatex: true,
      fontSize: theme.measure('label-size') * theme.measure('text-scale'),
      strokeColor: theme.color('text'),
      highlightStrokeColor: theme.color('text'),
    });
  }

  // O mesmo create() para tudo: os objetos nativos também entendem role, color e
  // translatable (com spoken, o nome lido da figura), e o face de um ponto ganha o
  // tamanho acertado. As partes que o próprio JSXGraph cria por dentro de um objeto
  // nativo (o ponto de um glider, por exemplo) ficam como ele as pede: elas também
  // trazem face, e não são do applet.
  const nativeCreate = board.create.bind(board);
  let building = 0; // > 0 enquanto o JSXGraph monta um objeto nativo
  const buildNative = (type, parents, attrs) => {
    building += 1;
    try {
      return nativeCreate(type, parents, attrs);
    } finally {
      building -= 1;
    }
  };
  board.create = (type, parents, attrs = {}) => {
    if (building > 0 || customElements.has(type.toLowerCase())) return nativeCreate(type, parents, attrs);
    const { translatable, spoken, ...rest } = attrs;
    const style = styleNative(theme, type, rest);
    if (!translatable) return buildNative(type, parents, style);
    return makeTranslatable(board, JXG, buildNative(type, parents, { ...style, ...theme.movable() }), spoken);
  };

  keepHandlesInside(board, JXG);
  pickNearestHandle(board, element, signal);
  allowPageScroll(board, element, signal);
  watchTextSizes(board, JXG, signal);

  if (grid) board.create('grid', [], theme.grid(grid === true ? {} : grid));
  if (axis) {
    const { x, y } = axis === true ? {} : axis;
    board.defaultAxes = {
      x: board.create('axis', [[0, 0], [1, 0]], theme.axis({ dir: 'x', ...x })),
      y: board.create('axis', [[0, 0], [0, 1]], theme.axis({ dir: 'y', ...y })),
    };
  }
  return board;
}

// Uma figura que o leitor arrasta inteira (translatable: true): um vetor, um segmento,
// um polígono, um círculo. Arrastar pela figura move juntos os pontos que a definem,
// e por isso eles precisam ser handles; arrastar por um ponto move só o ponto. O
// teclado vale também: Tab até a figura, e as setas. O reset e as alternativas ao
// arraste já vêm dos handles.
function makeTranslatable(board, JXG, figure, spoken = 'figura') {
  const points = figure.vertices ? figure.vertices.slice(0, -1) : [figure.point1, figure.point2, figure.center].filter(Boolean);

  // Empurrada contra a borda, a figura para inteira, sem se deformar.
  figure.on('drag', () => {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    const xs = points.map((p) => p.X());
    const ys = points.map((p) => p.Y());
    const dx = Math.max(xMin - Math.min(...xs), 0) + Math.min(xMax - Math.max(...xs), 0);
    const dy = Math.max(yMin - Math.min(...ys), 0) + Math.min(yMax - Math.max(...ys), 0);
    if (dx === 0 && dy === 0) return;
    for (const p of points) p.setPositionDirectly(JXG.COORDS_BY_USER, [p.X() + dx, p.Y() + dy]);
  });

  // A cada updateRenderer, o JSXGraph reinsere no DOM uma linha com ponta de seta, e
  // ela perde o foco do teclado: a segunda tecla já não chegaria à figura. O foco
  // perdido durante o updateRenderer da própria figura é devolvido a ela.
  const draw = figure.updateRenderer.bind(figure);
  figure.updateRenderer = () => {
    const hadFocus = document.activeElement === figure.rendNode;
    const result = draw();
    if (hadFocus && document.activeElement !== figure.rendNode) figure.rendNode.focus({ preventScroll: true });
    return result;
  };

  // A strokewidth de partida, para o CSS engrossar o traço a partir dela.
  figure.rendNode?.style.setProperty('--movable-width', figure.evalVisProp('strokewidth'));
  figure.rendNode?.setAttribute('role', 'application');
  figure.rendNode?.setAttribute('aria-roledescription', 'figura móvel');
  figure.rendNode?.setAttribute('aria-label', `${spoken}. Use as setas para mover a figura inteira.`);
  return figure;
}

// Depois de cada update, um handle que saiu da região volta para a borda.
function keepHandlesInside(board, JXG) {
  board.on('update', () => {
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    for (const handle of board.handles) {
      if (!handle.visPropCalc.visible || handle.type !== JXG.OBJECT_TYPE_POINT) continue;
      const x = Math.min(Math.max(handle.X(), xMin), xMax);
      const y = Math.min(Math.max(handle.Y(), yMin), yMax);
      if (x !== handle.X() || y !== handle.Y()) handle.moveTo([x, y]);
    }
  });
}

// Com áreas de captura generosas, dois handles podem estar ao alcance de um toque, e
// o JSXGraph escolheria o último arrastado. Antes de ele decidir (capture: true), o
// handle mais próximo passa a ser "o último arrastado" (lastDragTime).
function pickNearestHandle(board, element, signal) {
  element.addEventListener('pointerdown', (event) => {
    const box = element.getBoundingClientRect();
    let nearest = null;
    let smallest = Infinity;
    for (const handle of board.handles) {
      if (!handle.visPropCalc.visible) continue;
      const [, x, y] = handle.coords.scrCoords;
      const distance = Math.hypot(x - (event.clientX - box.left), y - (event.clientY - box.top));
      if (distance < smallest) [nearest, smallest] = [handle, distance];
    }
    if (nearest) nearest.lastDragTime = new Date();
  }, { capture: true, signal });
}

// O CSS deixa o dedo rolar a página sobre o board. Quando o dedo pega um ponto, o
// JSXGraph já está arrastando na hora do touchstart, e cancelar esse touchstart
// impede a rolagem só nesse gesto.
function allowPageScroll(board, element, signal) {
  element.addEventListener('touchstart', (event) => {
    if (board.mode === board.BOARD_MODE_DRAG) event.preventDefault();
  }, { passive: false, signal });
}

// O nome de um vetor guarda distância da seta usando o tamanho do texto. Quando um
// texto muda de tamanho (um valor novo, ou as fontes do KaTeX chegando), o JSXGraph o
// posiciona antes de medir de novo; conferir logo depois de cada update corrige isso
// com, no máximo, um board.update() a mais.
function watchTextSizes(board, JXG, signal) {
  const seen = new Map();
  let scheduled = false;
  let ownUpdate = false;

  function check() {
    scheduled = false;
    if (ownUpdate) {
      ownUpdate = false;
      return;
    }
    let changed = false;
    for (const object of board.objectsList) {
      const node = object.type === JXG.OBJECT_TYPE_TEXT && object.visPropCalc.visible && object.rendNode;
      if (!node?.offsetWidth) continue;
      const size = [node.offsetWidth, node.offsetHeight];
      const before = seen.get(object);
      if (before?.[0] === size[0] && before?.[1] === size[1]) continue;
      seen.set(object, size);
      object.size = size;
      changed = true;
    }
    if (changed) {
      ownUpdate = true;
      board.update();
    }
  }

  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      setTimeout(check);
    }
  };
  board.on('update', schedule);
  document.fonts?.addEventListener('loadingdone', schedule, { signal });
}

// Boards ligados: mexer em algo num deles redesenha os outros.
export function linkBoards(boards) {
  for (const a of boards) for (const b of boards) if (a !== b) a.addChild(b);
}

// Boards com a mesma escala: um vetor tem o mesmo tamanho em todos eles, qualquer que
// seja o arranjo do capítulo e a largura da tela (decisão E9 do livro-base, de
// 2026-11-15). Sozinho, cada board mostraria a sua região inteira, e a escala seria a
// largura dele dividida pela largura da região. Aqui a região de cada um é o mínimo que
// ele mostra; a escala é a maior em que todos mostram a sua, e um board maior mostra
// mais plano em volta, com o mesmo centro. Um board de escalas livres fica de fora.
export function shareScale(boards, signal) {
  const shared = boards.filter((board) => !board.freeScale);
  if (shared.length < boards.length) console.warn('[applet] shareScale: boards with a ratio keep their own scales');
  if (shared.length < 2) return;

  // O JSXGraph refaz cada board quando o tamanho dele muda, mantendo a região. Estes
  // são refeitos juntos, por fit(). Ao entrar e ao sair da impressão, ele os refaz
  // mesmo assim, pela região guardada no board (attr.boundingbox, no JSXGraph 1.14.3):
  // por isso fit() guarda nele a região comum, com setAttribute.
  for (const board of shared) {
    board.stopResizeObserver();
    board.attr.resize.enabled = false;
  }

  let measured = '';
  function fit() {
    const sizes = shared.map((board) => [board.containerObj.clientWidth, board.containerObj.clientHeight]);
    if (String(sizes) === measured) return;
    measured = String(sizes);
    const visible = (i) => sizes[i][0] > 0 && sizes[i][1] > 0;
    // Em px por unidade. Um board escondido não conta; ao aparecer, é medido de novo.
    const units = shared.map((board, i) => {
      const [xMin, yMax, xMax, yMin] = board.region;
      return visible(i) ? Math.min(sizes[i][0] / (xMax - xMin), sizes[i][1] / (yMax - yMin)) : Infinity;
    });
    const unit = Math.min(...units);
    if (!Number.isFinite(unit)) return;

    shared.forEach((board, i) => {
      if (!visible(i)) return;
      const [width, height] = sizes[i];
      if (width !== board.canvasWidth || height !== board.canvasHeight) board.resizeContainer(width, height, true, true);
      const [xMin, yMax, xMax, yMin] = board.region;
      const [x, y] = [(xMin + xMax) / 2, (yMin + yMax) / 2];
      const [halfWidth, halfHeight] = [width / unit / 2, height / unit / 2];
      board.setAttribute({ boundingBox: [x - halfWidth, y + halfHeight, x + halfWidth, y - halfHeight] });
    });
  }

  fit();

  // No frame seguinte ao aviso, e não dentro dele: refazer um board durante o aviso de
  // tamanho faria o navegador avisar de novo.
  let frame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  });
  for (const board of shared) observer.observe(board.containerObj);
  signal.addEventListener('abort', () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  });
}
