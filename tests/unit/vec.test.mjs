import assert from 'node:assert/strict';
import { test } from 'node:test';
import { add, angle, coordsInBasis, cross, det, dot, norm, perp, projection, projectionFactor, scale, unit } from '../../src/math/vec.js';

test('operações básicas', () => {
  assert.deepEqual(add([1, 2], [3, 4], [5, 6]), [9, 12]);
  assert.deepEqual(scale(2, [1, -1]), [2, -2]);
  assert.equal(dot([1, 2], [3, 4]), 11);
  assert.equal(norm([3, 4]), 5);
  assert.deepEqual(perp([1, 0]), [-0, 1]);
  assert.equal(det([1, 0], [0, 1]), 1);
  assert.deepEqual(cross([1, 0, 0], [0, 1, 0]), [0, 0, 1]);
});

test('o que não é definido é NaN, nunca um 0 enganoso', () => {
  assert.ok(unit([0, 0]).every(Number.isNaN));
  assert.ok(Number.isNaN(angle([0, 0], [1, 0])));
  assert.ok(Number.isNaN(projectionFactor([1, 1], [0, 0])));
  assert.ok(projection([1, 1], [0, 0]).every(Number.isNaN));
  assert.ok(coordsInBasis([1, 0], [2, 0], [1, 1]).every(Number.isNaN));
});

test('w = a·u + b·v', () => {
  const [a, b] = coordsInBasis([1, 0], [0, 2], [3, 4]);
  assert.equal(a, 3);
  assert.equal(b, 2);
});

test('o ângulo continua definido nos limites do arredondamento', () => {
  assert.equal(angle([1, 0], [2, 0]), 0);
  assert.ok(Math.abs(angle([1, 0], [0, 1]) - Math.PI / 2) < 1e-12);
  assert.ok(Math.abs(angle([1, 1e-9], [-1, 0]) - Math.PI) < 1e-6);
});
