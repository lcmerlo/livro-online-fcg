// Fórmulas comentadas (filters/annotations.lua). A página chega como uma lista: a
// fórmula, com cada parte marcada numa caixa colorida, e os comentários embaixo, cada
// um com o seu rótulo (o número, na cor da parte) e começando pela parte a que se
// refere. Lê-se bem em qualquer lugar: no celular, sem JavaScript, no leitor de tela.
// Este módulo, que vem do livro-base, acrescenta, em cada forma (decisões do
// livro-base E1, de 2026-11-12: linha e cor juntas; E18, de 2026-11-17: as formas
// .beside e .legend):
//   .annotated            onde os comentários cabem em volta da fórmula, cada um vai
//                         para perto da sua parte, ligado à caixa dela por uma linha
//                         da mesma cor, e o conjunto (fórmula e comentários) fica no
//                         centro da coluna; onde não cabem, fica a lista
//   .annotated .beside    a lista ao lado da fórmula, onde couber, com uma linha de
//                         cada caixa até o rótulo do seu comentário; senão, embaixo
//   .annotated .legend    em volta da fórmula ficam só os rótulos, cada um ligado por
//                         uma linha às suas caixas; os comentários ficam na lista de
//                         sempre, embaixo, com o mesmo rótulo
// O módulo só põe o texto no lugar; nunca o muda. Não há realce ao passar o cursor
// (pedido do autor, 2026-11-17).

const svgNs = 'http://www.w3.org/2000/svg';

// Uma fileira de comentários, da esquerda para a direita: cada um tão centrado na
// sua parte quanto der, sem sobreposição e dentro de [0, width]. Falso quando eles
// não cabem lado a lado.
export function spread(row, width, gap) {
  const needed = row.reduce((sum, note) => sum + note.width, 0) + gap * Math.max(0, row.length - 1);
  if (needed > width) return false;
  const ordered = [...row].sort((a, b) => a.x - b.x);
  let edge = 0;
  for (const note of ordered) {
    note.left = Math.max(note.x - note.width / 2, edge);
    edge = note.left + note.width + gap;
  }
  edge = width;
  for (const note of ordered.reverse()) {
    note.left = Math.min(note.left, edge - note.width);
    edge = note.left - gap;
  }
  return true;
}

// O deslocamento que põe no centro de [0, width] o trecho [left, right]: a fórmula e
// os comentários juntos, e não só a fórmula.
export const centering = (left, right, width) => (width - (right - left)) / 2 - left;

// Por onde uma linha sai da caixa: no meio da borda dela, ou, se o fim ficasse a menos
// de `want` desse meio (a linha seria reta), mais para o lado oposto ao do fim, até o
// que a borda permitir (`room` de cada lado do meio). Vale para uma posição na borda
// de baixo ou de cima (x) e na borda da direita (y).
export function bendStart(middle, end, want, room) {
  const apart = Math.abs(end - middle);
  if (apart >= want) return middle;
  return middle + (end > middle ? -1 : 1) * Math.min(want - apart, room);
}

// Onde chegam as linhas de um comentário que vale para `count` partes: no meio dele e
// perto umas das outras, na ordem das partes (para que não se cruzem). `step` é a
// distância entre duas chegadas, ou menos, se o comentário for estreito.
export function converge(count, left, width, step) {
  const margin = Math.min(8, width / 4);
  const gap = count > 1 ? Math.min(step, (width - 2 * margin) / (count - 1)) : 0;
  const middle = left + width / 2;
  return Array.from({ length: count }, (_, i) => middle + (i - (count - 1) / 2) * gap);
}

const noteItems = (block) => [...block.querySelectorAll(':scope > ol > li')];
const partsOf = (block, n) => [...block.querySelectorAll(`.katex-html [data-note="${n}"]`)];
const fontSize = (block) => parseFloat(getComputedStyle(block).fontSize);

// As caixas, medidas a partir do canto do bloco.
function boxer(block) {
  const origin = block.getBoundingClientRect();
  return (rect) => {
    const r = rect instanceof Element ? rect.getBoundingClientRect() : rect;
    return { left: r.left - origin.left, right: r.right - origin.left, top: r.top - origin.top, bottom: r.bottom - origin.top, width: r.width, height: r.height };
  };
}

// O que a fórmula mostra na tela, pedaço por pedaço: as letras e os traços (a caixa
// de um pedaço do KaTeX pode ser bem maior, com os suportes invisíveis dele).
function glyphs(formula) {
  const found = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(formula, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent.trim()) continue;
    range.selectNode(walker.currentNode);
    found.push({ node: walker.currentNode.parentElement, rect: range.getBoundingClientRect() });
  }
  for (const drawn of formula.querySelectorAll('svg, .frac-line, .overline-line, .underline-line, .katex-rule')) {
    found.push({ node: drawn, rect: drawn.getBoundingClientRect() });
  }
  return found.filter(({ rect }) => rect.width > 0 && rect.height > 0);
}

function union(rects) {
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

// Por onde uma linha sai de uma parte sem atravessar a fórmula: para cima, de um
// numerador; para baixo, de um denominador ou de dentro de uma raiz. O resto pode ir
// para qualquer lado.
function freeSide(part) {
  const fraction = part.parentElement.closest('.mfrac');
  const bar = fraction && [...fraction.querySelectorAll('.frac-line')].find((line) => line.closest('.mfrac') === fraction);
  if (bar) {
    const box = part.getBoundingClientRect();
    return (box.top + box.bottom) / 2 < bar.getBoundingClientRect().top ? 'above' : 'below';
  }
  return part.parentElement.closest('.sqrt') ? 'below' : 'either';
}

function newLines(block) {
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('class', 'annotated-lines');
  svg.setAttribute('aria-hidden', 'true');
  block.append(svg);
  return (n, d) => {
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', d);
    path.setAttribute('data-note', n);
    svg.append(path);
  };
}

// O filho do bloco que traz a fórmula (um parágrafo).
function formulaHolder(block) {
  let holder = block.querySelector('.katex-display');
  while (holder && holder.parentElement !== block) holder = holder.parentElement;
  return holder;
}

function reset(block) {
  block.classList.remove('is-drawn', 'is-labeled', 'is-beside');
  block.style.paddingTop = block.style.paddingBottom = '';
  block.querySelector(':scope > .annotated-lines')?.remove();
  for (const label of block.querySelectorAll(':scope > .note-label')) label.remove();
  const holder = formulaHolder(block);
  if (holder) holder.style.paddingBottom = '';
  const display = block.querySelector('.katex-display');
  if (display) display.style.paddingLeft = display.style.paddingRight = '';
  for (const item of noteItems(block)) item.style.left = item.style.top = '';
}

// ---- Em volta da fórmula ----

// Comentários que podem ir para qualquer lado: primeiro todos embaixo, depois
// alternados, depois todos em cima.
const plans = [() => 'below', (i) => (i % 2 ? 'above' : 'below'), () => 'above'];

// Os rótulos que vão em volta da fórmula, na forma .legend: uma cópia do número de
// cada comentário, na cor dele. Quem lê pela lista não os vê nem os ouve (a lista
// repete o número e a parte).
function addLabels(block) {
  return noteItems(block).map((item, i) => {
    const label = document.createElement('span');
    label.className = 'note-label';
    label.dataset.note = String(i + 1);
    label.setAttribute('aria-hidden', 'true');
    label.textContent = String(i + 1);
    block.append(label);
    return label;
  });
}

// Em volta da fórmula vão os comentários (.annotated) ou, na forma .legend, só os
// rótulos deles, e a lista fica embaixo.
function layoutAround(block, legend) {
  reset(block);
  const display = block.querySelector('.katex-display');
  const formula = display?.querySelector('.katex-html');
  if (!formula) return;

  block.classList.add(legend ? 'is-labeled' : 'is-drawn');
  const box = boxer(block);
  const size = fontSize(block);
  const items = legend ? addLabels(block) : noteItems(block);
  const fits = () => {
    // Uma fórmula mais larga que a coluna rola: as linhas, fora dela, não a seguiriam.
    if (display.scrollWidth > display.clientWidth + 1) return null;
    const drawn = union(glyphs(formula).map(({ rect }) => box(rect)));
    const notes = items.map((item, i) => ({ item, n: i + 1, parts: partsOf(block, i + 1) })).filter((note) => note.parts.length);
    for (const note of notes) {
      const boxes = note.parts.map(box);
      const sides = new Set(note.parts.map(freeSide));
      sides.delete('either');
      note.free = sides.size === 1 ? [...sides][0] : 'either';
      note.x = boxes.reduce((sum, b) => sum + (b.left + b.right) / 2, 0) / boxes.length;
      // Um comentário bem embaixo (ou em cima) da sua única caixa teria uma linha reta:
      // ele anda um pouco para o lado do meio da fórmula, e a linha faz sempre um S.
      // Com mais de uma caixa, as linhas já chegam inclinadas.
      if (boxes.length === 1) note.x += (note.x > (drawn.left + drawn.right) / 2 ? -1 : 1) * size;
      ({ width: note.width, height: note.height } = box(note.item));
    }
    const width = block.clientWidth;
    const gap = size * 0.75;
    const either = notes.filter((note) => note.free === 'either').sort((a, b) => a.x - b.x);
    for (const plan of plans) {
      for (const note of notes) note.side = note.free;
      either.forEach((note, i) => (note.side = plan(i)));
      const row = (side) => notes.filter((note) => note.side === side);
      if (spread(row('above'), width, gap) && spread(row('below'), width, gap)) return notes;
    }
    return null;
  };

  const notes = fits();
  if (!notes) {
    reset(block);
    return;
  }

  // O conjunto no centro: a fórmula anda com um recuo de um lado só (um recuo de 2d
  // leva o centro dela d para o lado), e os comentários andam junto.
  const drawn = union(glyphs(formula).map(({ rect }) => box(rect)));
  // Um recuo de menos de 1 px não se vê, e numa fórmula que quase enche a coluna
  // bastaria para fazê-la rolar.
  const centered = centering(Math.min(drawn.left, ...notes.map((note) => note.left)), Math.max(drawn.right, ...notes.map((note) => note.left + note.width)), block.clientWidth);
  const shift = Math.abs(centered) < 1 ? 0 : centered;
  if (shift > 0) display.style.paddingLeft = `${2 * shift}px`;
  else if (shift < 0) display.style.paddingRight = `${-2 * shift}px`;
  for (const note of notes) note.left += shift;
  // O recuo estreitou a fórmula: se ela passou a rolar, as linhas não a seguiriam.
  if (display.scrollWidth > display.clientWidth + 1) {
    reset(block);
    return;
  }

  // Lugar para os comentários acima e abaixo da fórmula, com espaço para as linhas.
  const rise = size * (legend ? 1.2 : 1.5);
  const tallest = (side) => Math.max(0, ...notes.filter((note) => note.side === side).map((note) => note.height));
  const [above, below] = [tallest('above'), tallest('below')];
  let area = box(formula);
  // O que sobra embaixo da fórmula, medido antes de o espaço de cima aumentar o bloco.
  const roomBelow = block.clientHeight - area.bottom;
  const holder = formulaHolder(block);
  const roomBelowHolder = box(holder).bottom - area.bottom;
  if (above) block.style.paddingTop = `${Math.max(0, above + rise - area.top)}px`;
  if (below && legend) {
    // Os rótulos ficam entre a fórmula e a lista: o espaço vai para o parágrafo da fórmula.
    holder.style.paddingBottom = `${Math.max(0, below + rise + 0.5 * size - roomBelowHolder)}px`;
  } else if (below) {
    block.style.paddingBottom = `${Math.max(0, below + rise - roomBelow)}px`;
  }
  area = box(formula);

  const line = newLines(block);
  for (const note of notes) {
    const down = note.side === 'below';
    note.top = down ? area.bottom + rise : area.top - rise - note.height;
    note.item.style.left = `${note.left}px`;
    note.item.style.top = `${note.top}px`;

    // Da borda da caixa, no meio dela, uma curva suave até o comentário. As linhas de
    // um mesmo comentário chegam juntas, no meio dele.
    const target = down ? note.top - 3 : note.top + note.height + 3;
    const boxes = note.parts.map(box).sort((a, b) => a.left + a.right - (b.left + b.right));
    const ends = converge(boxes.length, note.left, note.width, size * 0.6);
    boxes.forEach((b, i) => {
      const edge = down ? b.bottom + 1 : b.top - 1;
      const from = bendStart((b.left + b.right) / 2, ends[i], size * 0.5, b.width / 2 - 3);
      const bend = (edge + target) / 2;
      line(note.n, `M${from} ${edge}C${from} ${bend} ${ends[i]} ${bend} ${ends[i]} ${target}`);
    });
  }
}

// ---- A lista ao lado da fórmula ----

// Cada linha sai da caixa para a direita, se nada da fórmula estiver à direita dela;
// senão, por cima ou por baixo do resto da fórmula, numa lane só dela. Para que as
// linhas não se cruzem, uma parte que vem antes (na lista) do que está à direita sai
// por cima, e uma que vem depois, por baixo; quanto mais acima o rótulo, mais alta a
// lane. Perto da lista, todas fazem a mesma curva até o rótulo, e por isso também
// ali não se cruzam.
function layoutBeside(block) {
  reset(block);
  const display = block.querySelector('.katex-display');
  const formula = display?.querySelector('.katex-html');
  const list = block.querySelector(':scope > ol');
  if (!formula || !list) return;

  block.classList.add('is-beside');
  const size = fontSize(block);
  if (display.scrollWidth > display.clientWidth + 1 || list.getBoundingClientRect().width < 12 * size) {
    reset(block);
    return;
  }

  const lane = size * 0.6;
  const route = () => {
    const box = boxer(block);
    const pieces = glyphs(formula).map(({ node, rect }) => ({ node, ...box(rect) }));
    const drawn = union(pieces);
    const parts = noteItems(block).flatMap((item, i) => partsOf(block, i + 1).map((part) => ({ part, n: i + 1, item, ...box(part) })));
    for (const p of parts) {
      const besides = pieces.filter((g) => !p.part.contains(g.node) && g.left >= p.right - 1 && g.bottom > p.top + 1 && g.top < p.bottom - 1);
      if (besides.length === 0) {
        p.exit = 'right';
        continue;
      }
      const later = parts.filter((q) => q.left >= p.right - 1).map((q) => q.n);
      p.exit = later.length && p.n > Math.max(...later) ? 'below' : 'above';
    }
    // As lanes: o rótulo mais alto, a lane mais longe da fórmula.
    const lanes = (exit) => [...new Set(parts.filter((p) => p.exit === exit).map((p) => p.n))].sort((a, b) => a - b);
    const above = lanes('above');
    const below = lanes('below');
    return { box, drawn, parts, above, below };
  };

  // Lugar para as lanes acima e abaixo da fórmula.
  let { drawn, above, below } = route();
  const needAbove = above.length ? (above.length + 0.5) * lane : 0;
  const needBelow = below.length ? (below.length + 0.5) * lane : 0;
  if (needAbove > drawn.top) block.style.paddingTop = `${needAbove - drawn.top}px`;
  if (needBelow > block.clientHeight - drawn.bottom) block.style.paddingBottom = `${needBelow - (block.clientHeight - drawn.bottom)}px`;

  let box;
  let parts;
  ({ box, drawn, parts, above, below } = route());
  const start = drawn.right + 0.75 * size;
  const line = newLines(block);
  for (const p of parts) {
    const label = box(p.item.querySelector('.note-label') ?? p.item);
    const end = label.left - 4;
    const y = (label.top + label.bottom) / 2;
    const curve = (from) => `H${start}C${(start + end) / 2} ${from} ${(start + end) / 2} ${y} ${end} ${y}`;
    if (p.exit === 'right') {
      // Nem aqui a linha é reta: se o rótulo estivesse na altura da caixa, ela sai
      // um pouco mais acima ou abaixo, na borda.
      const from = bendStart((p.top + p.bottom) / 2, y, size * 0.5, (p.bottom - p.top) / 2 - 3);
      line(p.n, `M${p.right + 1} ${from}${curve(from)}`);
      continue;
    }
    const x = (p.left + p.right) / 2;
    const up = p.exit === 'above';
    const rank = up ? above.length - above.indexOf(p.n) : below.indexOf(p.n) + 1;
    const level = up ? drawn.top - rank * lane : drawn.bottom + rank * lane;
    const r = Math.min(lane / 2, 6);
    const edge = up ? p.top - 1 : p.bottom + 1;
    line(p.n, `M${x} ${edge}V${up ? level + r : level - r}Q${x} ${level} ${x + r} ${level}${curve(level)}`);
  }
}

const layout = (block) => (block.classList.contains('beside') ? layoutBeside(block) : layoutAround(block, block.classList.contains('legend')));

export function drawAnnotations() {
  const blocks = [...document.querySelectorAll('.annotated')];

  const widths = new WeakMap();
  // Só uma largura nova pede um arranjo novo; o próprio arranjo muda a altura.
  const observer = new ResizeObserver((entries) => {
    for (const { target, contentRect } of entries) {
      if (widths.get(target) === contentRect.width) continue;
      widths.set(target, contentRect.width);
      layout(target);
    }
  });
  blocks.forEach((block) => observer.observe(block));
  const redo = () => blocks.forEach(layout);
  // O tamanho do texto e o espaçamento mudam os comentários, não a largura. Quem
  // avisa é o painel de acessibilidade, que chega na fase 6 da migração.
  document.addEventListener('prefs-change', () => requestAnimationFrame(redo));
  document.fonts?.ready.then(redo);
}
