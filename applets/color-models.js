// Applet de teste, para nenhum capítulo: a mesma soma de vetores em vários modelos de
// cor, lado a lado, para comparar a olho e com simulação de daltonismo. O primeiro é o
// modelo do livro (papéis enxutos, decisoes.md, 2026-11-04); os outros, alternativas.
// Mover a ponta de u ou de v num board (com o mouse, o dedo, o teclado ou os campos)
// move a mesma ponta nos outros, para que todos mostrem sempre a mesma situação.
// Página: laboratorio/teste-cores.qmd.
// Partes: os boards `book`, `highlight` e `okabe`, todos opcionais: um modelo que o
// capítulo não pôs fica de fora.

import { text } from '../src/math/format.js';
import { add } from '../src/math/vec.js';

// O papel (role) dá o traço de cada elemento; nas alternativas, a cor vem pelo nome da
// paleta de _brand.yml, o que só vale no laboratório. Num capítulo, a cor é a do papel.
const models = [
  { name: 'book', spoken: 'Modelo 1, o do livro', colors: {} },
  { name: 'highlight', spoken: 'Modelo 2, neutro com um destaque', colors: { u: 'graphite-2', v: 'graphite-2', sum: 'orange-2', support: 'gray-5' } },
  { name: 'okabe', spoken: 'Modelo 3, uma cor por elemento', colors: { u: 'blue-oi', v: 'red-oi', sum: 'teal-oi', support: 'gray-5' } },
];

export default function ({ addBoard, addStatus, JXG }) {
  const start = { u: [1, 2], v: [3, 1] };
  const drawn = [];

  for (const { name, spoken, colors } of models) {
    const board = addBoard(name, { spoken, optional: true, region: [-1, 4, 5, -1], axis: true, grid: true });
    if (!board) continue;

    const U = board.create('handle', start.u, { arrowTip: true, color: colors.u ?? 'given', spoken: 'ponta de u', caption: '$\\vec{u}$', snapToGrid: true });
    const V = board.create('handle', start.v, { arrowTip: true, color: colors.v ?? 'given', spoken: 'ponta de v', caption: '$\\vec{v}$', snapToGrid: true });
    // A ponta de u + v, escondida: as cópias de u e v que fecham o paralelogramo
    // partem dela.
    const S = board.create('point', [() => U.X() + V.X(), () => U.Y() + V.Y()], { visible: false, withLabel: false });

    board.create('point', [0, 0]);
    board.create('segment', [U, S], { role: 'support', color: colors.support });
    board.create('segment', [V, S], { role: 'support', color: colors.support });
    board.create('vector', [[0, 0], S], { role: 'result', color: colors.sum, name: '\\vec{u} + \\vec{v}' });
    board.create('vector', [[0, 0], U], { color: colors.u, name: '\\vec{u}' });
    board.create('vector', [[0, 0], V], { color: colors.v, name: '\\vec{v}', side: 'right' });

    drawn.push({ U, V });
  }
  if (drawn.length === 0) return;

  // A mesma ponta em todos os boards. O drag vem também do teclado, dos campos e do
  // toque no destino (src/applet/access.js).
  for (const tips of drawn) {
    for (const key of ['U', 'V']) {
      tips[key].on('drag', () => {
        const where = [tips[key].X(), tips[key].Y()];
        for (const other of drawn) {
          if (other !== tips) other[key].setPositionDirectly(JXG.COORDS_BY_USER, where);
        }
      });
    }
  }

  const [{ U, V }] = drawn;
  const u = () => [U.X(), U.Y()];
  const v = () => [V.X(), V.Y()];
  addStatus(() => `Em todos os quadros, u = ${text.point(u())}, v = ${text.point(v())} e u + v = ${text.point(add(u(), v()))}.`);
}
