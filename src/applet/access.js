// Alternativas ao arraste dos pontos, só para quem as escolheu no painel de
// acessibilidade. São montadas a partir dos handles, e por isso todo applet as tem
// sem uma linha própria: campos com ▲ e ▼ para as coordenadas, e tocar no ponto e
// depois no destino. (O campo dos sliders está em controls.js.)

import { text } from '../math/format.js';
import { stepper } from './controls.js';
import { drawTex, writeCaption } from './tex.js';

// O passo de ▲ e ▼: o step do handle, a malha a que ele se prende, se houver, ou um
// número redondo perto de 1/40 da região mostrada.
function stepOf(handle, index) {
  if (handle.step) return handle.step;
  if (handle.evalVisProp('snaptogrid')) return handle.evalVisProp(index === 0 ? 'snapsizex' : 'snapsizey') || 1;
  const [xMin, , xMax] = handle.board.getBoundingBox();
  const rough = (xMax - xMin) / 40;
  return [0.05, 0.1, 0.25, 0.5, 1, 2, 5].find((step) => step >= rough) ?? 10;
}

function moveHandle(JXG, handle, coords) {
  handle.setPositionDirectly(JXG.COORDS_BY_USER, coords);
  handle.board.update();
  // Um applet pode reagir ao movimento (um encaixe, por exemplo), venha ele de onde vier.
  handle.triggerEventHandlers(['drag'], [{}]);
  handle.board.update();
}

// "x da ponta de u", "x de P": o nome lido de cada campo.
const of = (name) => `${/^(ponta|origem|extremidade)\b/.test(name) ? 'da' : 'de'} ${name}`;

// Uma coordenada: o campo com ▲ e ▼. O leitor de tela ouve "x de P"; à vista, a
// ordem do par diz qual é qual.
function coordinateField(JXG, handle, axis, index, signal) {
  const step = stepOf(handle, index);
  const read = () => (index === 0 ? handle.X() : handle.Y());
  const write = (value) => {
    const coords = [handle.X(), handle.Y()];
    coords[index] = value;
    moveHandle(JXG, handle, coords);
  };
  return stepper({
    said: `${axis} ${of(handle.spokenName)}`,
    shown: () => text.number(read()),
    nudge: (direction) => write(read() + direction * step),
    enter: write,
    watch: (show) => handle.board.on('update', show),
    signal,
  });
}

// Um sinal da escrita do par ("=", "(", ",", ")"), desenhado pelo KaTeX; o leitor de
// tela não o ouve.
function sign(code) {
  const element = document.createElement('span');
  element.className = 'field-sign';
  element.setAttribute('aria-hidden', 'true');
  drawTex(element, code);
  return element;
}

// As coordenadas de cada ponto, uma fileira por ponto, escritas como um par: "P = (",
// o campo de x, ",", o campo de y e ")" (pedido de 2026-11-13; antes, "coordenadas de
// P", "x =" e "y ="). O nome à vista vem de `caption`, no handle; o legend fica para o
// leitor de tela. As fileiras ficam num bloco só (.field-rows), que o estilo alinha
// como uma tabela quando há espaço (styles/applet.scss).
export function fieldsPanel(JXG, handles, signal) {
  const panel = document.createElement('fieldset');
  panel.className = 'applet-fields';
  panel.innerHTML = '<legend>Mover os pontos</legend><div class="field-rows"></div>';
  const rows = panel.querySelector('.field-rows');
  for (const handle of handles) {
    const row = document.createElement('div');
    row.className = 'field-row';
    const name = document.createElement('span');
    name.className = 'field-name';
    name.setAttribute('aria-hidden', 'true');
    writeCaption(name, handle.caption ?? handle.spokenName);
    const pair = document.createElement('span');
    pair.className = 'field-pair';
    pair.append(sign('('), coordinateField(JXG, handle, 'x', 0, signal), sign(','), coordinateField(JXG, handle, 'y', 1, signal), sign(')'));
    row.append(name, sign('='), pair);
    rows.append(row);
  }
  return panel;
}

// Tocar num ponto e, depois, no lugar para onde ele vai. O JSXGraph não vê esses
// gestos, e nada é arrastado; as setas do teclado continuam valendo, e a página
// continua rolando.
export function enableTapMove(JXG, board, element, hint, signal) {
  const idle = 'Toque em um ponto para escolhê-lo.';
  let selected = null;
  let press = null;

  const say = (message) => {
    hint.textContent = message;
  };

  function select(handle) {
    selected?.setAttribute({ strokeOpacity: board.theme.measure('ring-opacity') });
    selected = handle;
    handle?.setAttribute({ strokeOpacity: 0.95 });
    say(handle ? `${handle.spokenName} escolhido: toque no destino.` : idle);
    board.update();
  }

  const position = (event) => {
    const box = element.getBoundingClientRect();
    return [event.clientX - box.left, event.clientY - box.top];
  };

  function handleAt([x, y], touch) {
    const reach = board.theme.measure('capture-radius') * (touch ? 2.5 : 1);
    let found = null;
    let smallest = reach;
    for (const handle of board.handles) {
      if (!handle.visPropCalc.visible) continue;
      const [, px, py] = handle.coords.scrCoords;
      const distance = Math.hypot(px - x, py - y);
      if (distance <= smallest) [found, smallest] = [handle, distance];
    }
    return found;
  }

  element.addEventListener('pointerdown', (event) => {
    press = { x: event.clientX, y: event.clientY };
    event.stopImmediatePropagation();
  }, { capture: true, signal });

  element.addEventListener('pointerup', (event) => {
    event.stopImmediatePropagation();
    // Um movimento longo é a página rolando, não um toque.
    if (!press || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) return;
    const where = position(event);
    const hit = handleAt(where, event.pointerType === 'touch');
    if (hit) return select(hit === selected ? null : hit);
    if (!selected) return;
    const moved = selected;
    const { usrCoords } = new JXG.Coords(JXG.COORDS_BY_SCREEN, where, board);
    select(null);
    moveHandle(JXG, moved, usrCoords.slice(1));
    say(`${moved.spokenName} movido. ${idle}`);
  }, { capture: true, signal });

  say(idle);
}
