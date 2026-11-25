// Setas com um nome que não encosta na linha, em qualquer inclinação.
//   vector      seta de A a B (pontos, pares, ou funções que devolvem um par)
//   freevector  um vetor com as duas pontas móveis; na ponta, a seta faz o papel do ponto
//   vectorcopy  um vetor (ou k vezes ele) desenhado a partir de outra origem
// Atributos: name (TeX, ou uma função que o devolve), side ('left' | 'right' da
// direção, ou uma função), at (fração do comprimento em que o nome fica), role, color,
// weight. No freevector, translatable: true deixa arrastar a seta inteira: o vetor muda
// de lugar e continua o mesmo; snapToGrid, snapSizeX e snapSizeY valem para as duas
// pontas (sem eles, a malha dos décimos, como todo handle). O resto vai direto para o
// JSXGraph.

import { plain } from '../math/format.js';
import { asPoint, componentsOf, evaluate, positionOf } from './common.js';

const labelGap = 4; // px entre a caixa do nome e a linha

// O deslocamento do nome, em px, com y para cima: a caixa dele fica a labelGap da
// seta, do lado pedido. (A distância do próprio JSXGraph cresce com o texto; um nome
// estreito numa seta íngreme encostaria nela.)
function clearOfLine(arrow) {
  if (!arrow.label) return [0, 0]; // Também é chamada enquanto o nome está sendo criado.
  const [, x1, y1] = arrow.point1.coords.scrCoords;
  const [, x2, y2] = arrow.point2.coords.scrCoords;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const sideSign = String(arrow.label.evalVisProp('position')).includes('right') ? -1 : 1;
  const [nx, ny] = [(sideSign * (y2 - y1)) / length, (sideSign * (x2 - x1)) / length];
  const [width, height] = arrow.label.size;
  const distance = (Math.abs(nx) * width + Math.abs(ny) * height) / 2 + labelGap;
  return [nx * distance, ny * distance];
}

export function registerVectors(register) {
  register('vector', (board, [from, to], { name = '', side = 'left', at = 0.5, nameVisible, role = 'given', color, weight, ...attributes }) => {
    const { theme } = board;
    const isDynamic = typeof name === 'function';
    const arrow = board.create('arrow', [asPoint(board, from), asPoint(board, to)], {
      ...theme.stroke({ role, color, weight }),
      lastArrow: { type: 2, size: 5 },
      name: isDynamic ? ' ' : name,
      withLabel: Boolean(name),
      label: {
        fontSize: theme.measure('vector-label-size') * theme.measure('text-scale'),
        position: () => `${evaluate(at)}fr ${evaluate(side)}`,
        anchorX: 'middle',
        anchorY: 'middle',
        distance: 0,
        offset: clearOfLine,
        ...(nameVisible && { visible: nameVisible }),
      },
      ...attributes,
    });
    if (isDynamic) arrow.label.setText(name);
    arrow.look = { role, color, weight };
    return arrow;
  });

  // parents: as posições [start, end]. fixedOrigin deixa a origem parada; sem ele,
  // as duas pontas são móveis. Um vetor nulo não tem seta que carregue o nome, e
  // então o label da origem o mostra.
  register('freevector', (board, [start, end], { name = '', spoken, color, fixedOrigin = false, translatable = false, step, snapToGrid, snapSizeX, snapSizeY, ...attributes }) => {
    const said = spoken ?? plain(typeof name === 'function' ? '' : name);
    // O nome à vista antes dos campos das coordenadas: "ponta de u", com o u em TeX.
    const shown = typeof name === 'function' || !name ? said : `$${name}$`;
    const visibility = attributes.visible === undefined ? {} : { visible: attributes.visible };
    // A malha das pontas é a dos handles (os décimos), a não ser que o applet escolha outra.
    const grid = Object.fromEntries(Object.entries({ snapToGrid, snapSizeX, snapSizeY }).filter(([, value]) => value !== undefined));
    let tip = null;
    let origin = null;
    const isNull = () => tip !== null && Math.hypot(tip.X() - origin.X(), tip.Y() - origin.Y()) < 1e-9;

    origin = fixedOrigin
      ? board.create('point', start, { color: color ?? 'given', ...visibility })
      : board.create('handle', start, {
          color,
          step,
          spoken: `origem de ${said}`,
          caption: `origem de ${shown}`,
          name: typeof name === 'function' ? '' : name,
          label: { fontSize: board.theme.measure('vector-label-size') * board.theme.measure('text-scale'), offset: [12, 12], visible: isNull },
          ...grid,
          ...visibility,
        });
    tip = board.create('handle', end, {
      color,
      step,
      arrowTip: true,
      spoken: `ponta de ${said}`,
      // Com a origem parada na origem do plano, as coordenadas da ponta são as do vetor.
      caption: fixedOrigin && Number(start[0]) === 0 && Number(start[1]) === 0 ? shown : `ponta de ${shown}`,
      ...grid,
      ...visibility,
    });

    // A seta inteira só se arrasta se as duas pontas se movem.
    const whole = translatable && !fixedOrigin ? { translatable: true, spoken: `vetor ${said}` } : {};
    const arrow = board.create('vector', [origin, tip], { name, color, ...whole, ...attributes });
    return Object.assign(arrow, { origin, tip });
  });

  // parents: [vector, origin, k = 1]. Mantém a aparência do original, a não ser que se diga outra.
  register('vectorcopy', (board, [vector, origin, k = 1], attributes) => {
    const start = asPoint(board, origin);
    const end = () => {
      const [x, y] = positionOf(start);
      const [dx, dy] = componentsOf(vector);
      const factor = evaluate(k);
      return [x + factor * dx, y + factor * dy];
    };
    return board.create('vector', [start, end], { ...vector?.look, ...attributes });
  });
}
