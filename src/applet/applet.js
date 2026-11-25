// O que o arquivo de um applet recebe. Tudo se liga aqui, e por isso um applet só diz
// o que é dele: os boards de um applet são ligados entre si, o state os redesenha, e
// o reset, o status e as alternativas ao arraste vêm prontos.
//   export default function ({ addBoard, makeState, addSlider, addLive, addStatus }) { ... }
// Os nomes seguem o glossário do livro-base (_interno/glossario.md): add… põe uma
// parte na página; make… constrói um objeto sem pôr nada nela.

import { linkBoards, createBoard, shareScale } from './board.js';
import { createAnimation, createState } from './state.js';
import { createControls } from './controls.js';
import { iconButton } from './icons.js';
import { drawSteady } from './tex.js';
import { enableTapMove, fieldsPanel } from './access.js';
import { isOn } from '../site/prefs.js';
import { keepReachable } from '../site/scrollers.js';
import { openSettings } from '../site/settings.js';

const statusDelay = 400; // ms depois do último movimento, para não narrar cada passo
const steadyInterval = 120; // ms entre duas escritas de um número durante uma animação
const settleDelay = 600; // ms sem mexer até uma expressão voltar ao tamanho do conteúdo

export function createApplet(block, JXG, customElements) {
  const controller = new AbortController();
  const { signal } = controller;
  const boards = [];
  const animations = [];
  const created = [];
  const changeListeners = new Set();
  // Sem nenhuma parte no capítulo, o applet se arruma sozinho.
  const auto = !block.querySelector('.board, .controls');
  let currentState = null;
  let describe = null;

  // O que o leitor escolheu no painel de acessibilidade. No laboratório, show="fields"
  // no bloco mostra uma alternativa sem mexer nas preferências de quem está lendo.
  const wants = (key) => isOn(key) || (block.dataset.show ?? '').split(' ').includes(key);

  const notifyChange = () => changeListeners.forEach((listener) => listener());
  // Uma mudança na figura ou no state. Montado o applet e fora de uma animação, quem
  // mudou foi o leitor: as expressões seguram a largura até ele parar (stir, abaixo).
  let listening = false;
  const changed = () => {
    if (listening && !animations.some((animation) => animation.playing)) stir();
    notifyChange();
  };
  const redraw = () => boards[0]?.update();

  // As partes que o capítulo não pôs vão para o fim, dentro das colunas se houver.
  function addPart(className, part) {
    const element = document.createElement('div');
    element.className = className;
    if (part) element.dataset.part = part;
    (className === 'board' ? block.querySelector(':scope > .cols-scope > .cols') ?? block : block).append(element);
    created.push(element);
    return element;
  }

  // Cada board fica num .board-frame com, logo acima dele, os botões de reiniciar e de
  // acessibilidade (decisão E5 do livro-base, revista em 2026-11-13). O frame toma o
  // lugar do board no arranjo: a largura, o centro, o lado do texto que o contorna. O de
  // um board escrito no capítulo fica de uma montagem para a outra; o de um board que o
  // applet pôs sai com ele.
  function frame(element) {
    if (element.parentElement?.classList.contains('board-frame')) return element.parentElement;
    const made = document.createElement('div');
    made.className = 'board-frame';
    for (const name of ['center', 'float-right', 'float-left']) {
      if (element.classList.contains(name)) made.classList.add(name);
    }
    const width = element.style.getPropertyValue('--board-width');
    if (width) made.style.setProperty('--board-width', width);
    element.before(made);
    made.append(element);
    if (created.includes(element)) created.push(made);
    return made;
  }

  function boardElement(name, spoken, optional) {
    const element =
      block.querySelector(`.board[data-part="${name}"]`) ??
      block.querySelector('.board:not([data-part])') ??
      (auto && !optional ? addPart('board', name) : null);
    if (element) {
      element.dataset.part = name;
      if (spoken && !element.hasAttribute('aria-label')) element.setAttribute('aria-label', spoken);
      frame(element);
    }
    return element;
  }

  // addBoard('vectors', { region: [...] }) -> um board do JSXGraph, ou null quando o
  // capítulo preferiu não mostrar essa parte. Um board opcional só aparece se o
  // capítulo o pedir. spoken é o nome que o leitor de tela diz; o spoken="..."
  // do capítulo, se houver, fica no lugar dele.
  function addBoard(name, { spoken, optional = false, ...options }) {
    const element = boardElement(name, spoken, optional);
    if (!element) return null;
    const made = createBoard(JXG, element, customElements, signal, options);
    made.on('update', changed);
    boards.push(made);
    return made;
  }

  function makeState(initial) {
    currentState = createState(initial, redraw);
    currentState.on(changed);
    return currentState;
  }

  function makeAnimation(key, options) {
    const animation = createAnimation(currentState, key, { reduced: () => isOn('reduceMotion'), ...options });
    // Ao começar e ao parar, a espera de stir acaba: parada a animação, os números
    // voltam à escrita de sempre e a caixa ao tamanho do conteúdo, sem esperar.
    animation.on(() => {
      settle();
      notifyChange();
    });
    animations.push(animation);
    return animation;
  }

  // ---- Números durante uma animação ----

  // A figura se move a cada frame, mas um número que muda 60 vezes por segundo é só
  // um borrão. Enquanto uma animação roda, cada expressão é escrita no máximo a cada
  // steadyInterval; fora dela, no frame seguinte à mudança.
  const isSteady = () => animations.some((animation) => animation.steady);

  function pace(draw) {
    let scheduled = false;
    let last = 0;
    const run = () => {
      scheduled = false;
      if (signal.aborted) return;
      last = performance.now();
      draw();
    };
    return () => {
      if (scheduled) return;
      scheduled = true;
      const wait = isSteady() ? steadyInterval - (performance.now() - last) : 0;
      if (wait > 0) setTimeout(run, wait);
      else requestAnimationFrame(run);
    };
  }

  // ---- Expressões que não empurram o texto ----

  // Enquanto o leitor mexe (arrasta um ponto, move uma faixa, aperta as setas) ou uma
  // animação roda, a caixa de uma expressão só cresce: o que vem depois dela na frase
  // não é empurrado para lá e para cá quando 2 vira \tfrac{5}{2} ou o sinal aparece, e
  // uma expressão em destaque não muda de lugar a cada valor. A expressão acompanha a
  // figura a cada passo; o que espera é só a caixa, que volta ao tamanho do conteúdo
  // quando nada mexe por settleDelay, ou logo que a animação para.
  let pressed = false; // um botão do mouse ou um dedo apertado dentro do applet
  let recent = false; // houve mudança há menos de settleDelay
  let settleTimer;
  const kept = new Set(); // as caixas que podem estar seguras
  const widest = new Map();
  const isHolding = () => isSteady() || pressed || recent;

  function release() {
    if (isHolding()) return;
    for (const target of kept) {
      const box = boxOf(target);
      if (box) box.style.minWidth = '';
      target.classList.remove('is-steady');
    }
    widest.clear();
  }

  function settle() {
    clearTimeout(settleTimer);
    recent = false;
    release();
  }

  function stir() {
    recent = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, settleDelay);
  }

  // Um botão é um toque só, e não um arraste: o de animar e o de pausar, por exemplo.
  block.addEventListener(
    'pointerdown',
    (event) => {
      if (!event.target.closest('button')) pressed = true;
    },
    { capture: true, signal },
  );
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(
      type,
      () => {
        if (!pressed) return;
        pressed = false;
        stir();
      },
      { capture: true, signal },
    );
  }
  signal.addEventListener('abort', () => clearTimeout(settleTimer));

  const boxOf = (target) => (target.tagName === 'DIV' ? target.querySelector('.katex-display > .katex') : target);

  // keepWidth(target, draw): desenha e, se for o caso, segura a caixa na maior largura
  // que ela teve desde que o leitor começou a mexer, contando a de antes desta escrita.
  // Vale para as expressões ([nome]{.live}) e para o valor ao lado de uma faixa.
  function keepWidth(target, draw) {
    const holding = isHolding();
    let before = 0;
    if (holding && boxOf(target)) {
      // Medida com a classe, que deixa a caixa do tamanho do conteúdo.
      target.classList.add('is-steady');
      before = boxOf(target).getBoundingClientRect().width;
    }
    draw();
    const box = boxOf(target);
    if (!box) return;
    kept.add(target);
    box.style.minWidth = '';
    target.classList.toggle('is-steady', holding);
    if (!holding) {
      widest.delete(target);
      return;
    }
    const width = Math.max(widest.get(target) ?? 0, before, box.getBoundingClientRect().width);
    widest.set(target, width);
    box.style.minWidth = `${width}px`;
  }

  // ---- Controles ----

  // Para onde vai um controle: a parte que ele nomeia, o primeiro .controls do
  // capítulo ou, para que um capítulo não os perca por descuido, logo abaixo dos
  // boards. controls="none" no bloco esconde todos.
  function place(part) {
    if (block.dataset.controls === 'none') return document.createElement('div');
    const wanted = part && block.querySelector(`.controls[data-part="${part}"]`);
    if (part && !wanted) console.warn(`[applet] controls part not found: ${part}`);
    return wanted || block.querySelector('.controls') || addPart('controls');
  }

  let madeControls = null;
  const controls = () => (madeControls ??= createControls({ state: currentState ?? makeState({}), place, signal, pace, keepWidth, fields: wants('fields') }));

  // addLive('w', () => tex): escreve a expressão onde o texto tiver [w]{.live}. A altura
  // dela só cresce (tex.js: drawSteady): a linha não muda de altura quando um número
  // vira fração ou raiz, e o texto em volta não pula. A largura, enquanto o leitor
  // mexe (keepWidth).
  function addLive(name, code) {
    const targets = [...block.querySelectorAll('.live'), ...(block.outsideLive ?? [])].filter((el) => el.dataset.part === name);
    if (targets.length === 0) return;
    let last = null;
    const draw = () => {
      const written = code();
      if (written === last) return;
      last = written;
      for (const target of targets) {
        keepWidth(target, () => drawSteady(target, written, { displayMode: target.tagName === 'DIV' }));
        keepReachable(target);
      }
    };
    changeListeners.add(pace(draw));
    draw();
  }

  // addStatus(() => texto): o que a figura mostra, em palavras. O leitor de tela sempre
  // o recebe; à vista, só para quem pediu no painel de acessibilidade. Um só por
  // applet: o segundo troca o primeiro.
  function addStatus(code) {
    describe = code;
  }

  // ---- Reiniciar ----

  const handles = () => boards.flatMap((b) => b.handles);

  // Volta tudo ao início: os handles de todos os boards e os valores do state.
  function reset() {
    for (const handle of handles()) handle.setPositionDirectly(JXG.COORDS_BY_USER, handle.start);
    currentState?.reset();
    redraw();
  }

  // Logo acima de cada board, sempre os mesmos dois botões, nesta ordem: reiniciar
  // e abrir as opções de acessibilidade (decisão E5 do livro-base, revista em
  // 2026-11-13). Num applet de vários boards, mexer em um muda os outros: o botão de
  // reiniciar de qualquer board reinicia todos, e fica perto de onde o leitor está. Um
  // applet sem nada que se mova não tem o que reiniciar, e fica sem eles.
  function addBoardTools() {
    if (handles().length === 0 && !currentState) return;
    const several = boards.length > 1;
    for (const b of boards) {
      const resetButton = iconButton('reset', several ? 'Reiniciar todos os quadros' : 'Reiniciar', 'applet-reset');
      resetButton.addEventListener('click', reset, { signal });

      // O painel fica a um toque de quem está com dificuldade neste applet.
      const settings = iconButton('access', 'Opções de acessibilidade', 'applet-settings');
      settings.addEventListener('click', openSettings, { signal });

      const tools = document.createElement('div');
      tools.className = 'board-tools';
      tools.append(resetButton, settings);
      // Antes do board, e não só desenhado acima dele: a ordem do Tab segue a da tela.
      b.containerObj.parentElement.prepend(tools);
      created.push(tools);
    }
  }

  // Embaixo do applet, o que o leitor pediu no painel: os campos, a dica do toque e o
  // status (este sempre existe, para o leitor de tela).
  function buildFoot() {
    const foot = document.createElement('div');
    foot.className = 'applet-foot';

    const movable = handles();
    if (wants('fields') && movable.length > 0) foot.append(fieldsPanel(JXG, movable, signal));

    if (wants('tapMove') && movable.length > 0) {
      const hint = document.createElement('p');
      hint.className = 'applet-hint';
      hint.setAttribute('aria-live', 'polite');
      foot.append(hint);
      for (const b of boards) if (b.handles.length > 0) enableTapMove(JXG, b, b.containerObj, hint, signal);
    }

    if (describe) {
      const paragraph = document.createElement('p');
      paragraph.className = 'applet-status';
      paragraph.setAttribute('role', 'status');
      foot.append(paragraph);
      let timer;
      const write = () => {
        paragraph.textContent = describe();
      };
      changeListeners.add(() => {
        clearTimeout(timer);
        timer = setTimeout(write, statusDelay);
      });
      signal.addEventListener('abort', () => clearTimeout(timer));
      write();
    }

    if (foot.childElementCount === 0) return;
    block.append(foot);
    created.push(foot);
  }

  // O que o applet recebe. Nenhum nome antigo (board, state, slider...) continua como
  // apelido: um nome, uma coisa (regra 6 do glossário do livro-base).
  const api = {
    addBoard,
    // shareScale(a, b, c): boards que mostram o mesmo plano, com a mesma escala; a
    // região de cada um passa a ser o mínimo que ele mostra (a função de mesmo nome,
    // em board.js). Um board que o capítulo não pôs (null) fica de fora.
    shareScale: (...shared) => shareScale(shared.filter(Boolean), signal),
    makeState,
    makeAnimation,
    addLive,
    addStatus,
    onChange: (listener) => changeListeners.add(listener),
    addSlider: (...args) => controls().addSlider(...args),
    addCheckbox: (...args) => controls().addCheckbox(...args),
    addRadio: (...args) => controls().addRadio(...args),
    addNumberField: (...args) => controls().addNumberField(...args),
    addButton: (...args) => controls().addButton(...args),
    addPlayButton: (...args) => controls().addPlayButton(...args),
    JXG,
  };

  return {
    api,
    boards,
    get state() {
      return currentState;
    },
    finish() {
      if (boards.length > 1) linkBoards(boards);
      addBoardTools();
      buildFoot();
      notifyChange();
      listening = true;
    },
    snapshot: () => ({
      state: currentState?.snapshot(),
      handles: handles().map((handle) => [handle.X(), handle.Y()]),
    }),
    // Remontado o applet (outra preferência no painel), a figura volta como estava.
    restore(saved) {
      listening = false;
      handles().forEach((handle, i) => {
        if (saved.handles[i]) handle.setPositionDirectly(JXG.COORDS_BY_USER, saved.handles[i]);
      });
      if (saved.state) currentState?.restore(saved.state);
      redraw();
      listening = true;
    },
    destroy() {
      controller.abort();
      animations.forEach((animation) => animation.pause());
      boards.forEach((b) => JXG.JSXGraph.freeBoard(b));
      created.forEach((element) => element.remove());
      block.querySelectorAll('.controls').forEach((element) => element.replaceChildren());
    },
  };
}
