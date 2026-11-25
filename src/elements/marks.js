// Marcas que explicam uma figura.
//   rightangle  a marca de 90° em V, entre VA e VC; some quando o ângulo não existe
//   measure     um texto em TeX (tex) preso a objetos, em unidades de tela, iguais em
//               qualquer escala:
//                 [P]        ao lado do ponto (offset: [dx, dy] px)
//                 [A, B]     ao lado do meio de AB (side, distance)
//                 [A, V, C]  na bissetriz do ângulo em V (distance)
//   leaders     linhas tracejadas de um ponto até os eixos, com marcas e, se pedidos, valores,
//               escritos por tex(valor); para escrever os dois de jeitos diferentes, dois
//               leaders, um com y: false e outro com x: false

import { tex as texFormat } from '../math/format.js';
import { asPoint, evaluate, visibleWith } from './common.js';

const near = (P, Q) => Math.hypot(P.X() - Q.X(), P.Y() - Q.Y()) < 1e-9;

export function registerMarks(register) {
  register('rightangle', (board, parents, { size = 14, role = 'support', color, ...attributes }) => {
    const [A, V, C] = parents.map((p) => asPoint(board, p));
    return board.create('nonreflexangle', [A, V, C], {
      ...board.theme.stroke({ role, color, weight: 'thin' }),
      dash: 0,
      orthoType: 'square',
      radius: () => size / board.unitX,
      withLabel: false,
      fillOpacity: 0,
      highlightFillOpacity: 0,
      ...attributes,
      ...visibleWith(attributes, () => !near(A, V) && !near(C, V)),
    });
  });

  register('measure', (board, parents, { tex = '', color = 'text', distance, side = 'left', offset = [10, 12], ...attributes }) => {
    const points = parents.map((p) => asPoint(board, p));
    let label = null;

    function besidePoint([P]) {
      return [P.X() + offset[0] / board.unitX, P.Y() + offset[1] / board.unitY];
    }
    function besideSegment([A, B]) {
      const [ux, uy] = [board.unitX, board.unitY];
      const [dx, dy] = [(B.X() - A.X()) * ux, (B.Y() - A.Y()) * uy];
      const length = Math.hypot(dx, dy) || 1;
      const sign = evaluate(side) === 'right' ? -1 : 1;
      const [nx, ny] = [(-sign * dy) / length, (sign * dx) / length];
      const [width, height] = label?.size ?? [0, 0];
      const gap = (evaluate(distance) ?? 4) + (Math.abs(nx) * width + Math.abs(ny) * height) / 2;
      return [(A.X() + B.X()) / 2 + (gap * nx) / ux, (A.Y() + B.Y()) / 2 + (gap * ny) / uy];
    }
    function onBisector([A, V, C]) {
      const [ux, uy] = [board.unitX, board.unitY];
      const a = [(A.X() - V.X()) * ux, (A.Y() - V.Y()) * uy];
      const c = [(C.X() - V.X()) * ux, (C.Y() - V.Y()) * uy];
      const [la, lc] = [Math.hypot(...a) || 1, Math.hypot(...c) || 1];
      let m = [a[0] / la + c[0] / lc, a[1] / la + c[1] / lc];
      if (Math.hypot(...m) < 1e-9) m = [-a[1] / la, a[0] / la]; // Ângulo raso: a normal.
      const length = Math.hypot(...m);
      const gap = evaluate(distance) ?? 14;
      return [V.X() + (gap * m[0]) / length / ux, V.Y() + (gap * m[1]) / length / uy];
    }

    const place = [besidePoint, besideSegment, onBisector][points.length - 1];
    label = board.create('text', [() => place(points)[0], () => place(points)[1], tex], {
      anchorX: 'middle',
      anchorY: 'middle',
      strokeColor: board.theme.color(color),
      fontSize: 14 * board.theme.measure('text-scale'),
      ...attributes,
    });
    return label;
  });

  register('leaders', (board, [source], { x = true, y = true, values = true, tex = (v) => texFormat.number(v), color = 'support', ...attributes }) => {
    const { theme } = board;
    const P = asPoint(board, source);
    const shown = visibleWith(attributes);
    const line = { ...theme.stroke({ role: 'support' }), ...shown };
    const label = { fontSize: 13 * theme.measure('text-scale'), ...shown };
    const parts = [];

    if (x) {
      const foot = board.create('point', [() => P.X(), 0], { color, face: '|', ...shown });
      parts.push(foot, board.create('segment', [P, foot], line));
      if (values) parts.push(board.create('text', [() => P.X(), () => -8 / board.unitY, () => tex(P.X())], { anchorX: 'middle', anchorY: 'top', ...label }));
    }
    if (y) {
      const foot = board.create('point', [0, () => P.Y()], { color, face: '-', ...shown });
      parts.push(foot, board.create('segment', [P, foot], line));
      if (values) parts.push(board.create('text', [() => -8 / board.unitX, () => P.Y(), () => tex(P.Y())], { anchorX: 'right', anchorY: 'middle', ...label }));
    }
    return { parts };
  });
}
