// O vetor u, com a ponta arrastável, e o vetor a·u, com um slider para o número a,
// uma checkbox que mostra a reta de u e uma animação.
// Partes: `plane`; `number`, um segundo board, opcional, com a na reta numérica; as
// expressões `product` e `a`; e os controles.

import { expr, tex, text } from '../src/math/format.js';
import { norm, scale } from '../src/math/vec.js';

export default function ({ addBoard, makeState, makeAnimation, addSlider, addCheckbox, addPlayButton, addLive, addStatus }) {
  const s = makeState({ a: 1.5, showLine: false });

  const plane = addBoard('plane', {
    spoken: 'Os vetores u e a vezes u, com a ponta de u arrastável',
    region: [-5, 4, 5, -4],
    axis: true,
    grid: true,
  });
  // Presa aos inteiros: u fica simples, e a·u se lê de cabeça.
  const U = plane.create('handle', [2, 1], { arrowTip: true, spoken: 'ponta de u', caption: '$\\vec{u}$', snapToGrid: true });
  const u = () => [U.X(), U.Y()];
  const au = () => scale(s.a, u());
  const isNull = () => norm(u()) === 0;

  plane.create('point', [0, 0]);
  plane.create('line', [[0, 0], U], { role: 'support', visible: () => s.showLine && !isNull() });
  plane.create('vector', [[0, 0], au], { role: 'result', name: 'a\\vec{u}', side: 'right' });
  plane.create('vector', [[0, 0], U], { name: '\\vec{u}' });

  const line = addBoard('number', {
    spoken: 'O número a na reta numérica',
    optional: true,
    region: [-2.5, 1, 2.5, -1],
    axis: { y: { ticks: false } },
  });
  if (line) {
    line.defaultAxes.y.setAttribute({ visible: false });
    line.create('point', [() => s.a, 0], { color: 'given', name: 'a', withLabel: true });
  }

  addSlider('a', { min: -2, max: 2, step: 0.1 });
  addCheckbox('showLine', { caption: 'mostrar a reta de $\\vec{u}$' });
  addPlayButton(makeAnimation('a', { min: -2, max: 2, speed: 1 }));

  // a·u com o número no lugar de a e o vetor pelo nome, e as coordenadas só no
  // resultado: "a\vec{u} = 1.5\vec{u} = (3, 1.5)" (pedido de 2026-11-12). Com a = 1,
  // "\vec{u}"; com a = 0, "0\vec{u}", que diz de onde vem o vetor nulo.
  const multiple = () => (Math.abs(s.a) < 0.005 ? '0\\vec{u}' : expr.write(expr.times(s.a, '\\vec{u}')));
  addLive('product', () => `a\\vec{u} = ${multiple()} = ${tex.point(au())}`);
  addLive('a', () => tex.number(s.a));

  addStatus(() =>
    isNull()
      ? `a = ${text.number(s.a)}; u é o vetor nulo, e a vezes u também.`
      : `a = ${text.number(s.a)}, u = ${text.point(u())} e a vezes u = ${text.point(au())}.${s.showLine ? ' A reta de u está visível.' : ''}`,
  );
}
