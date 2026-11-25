// Valores exatos: reconhecer frações, raízes e múltiplos de pi, e escrevê-los.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recognize, root, toFraction } from '../../src/math/exact.js';
import { holdSteady, notation, tex, text } from '../../src/math/format.js';

test('uma fração simples é reconhecida, apesar do arredondamento da máquina', () => {
  assert.deepEqual(toFraction(0.5), { n: 1, d: 2 });
  assert.deepEqual(toFraction(-0.75), { n: -3, d: 4 });
  assert.deepEqual(toFraction(0.1 + 0.2), { n: 3, d: 10 });
  assert.deepEqual(toFraction(7), { n: 7, d: 1 });
  assert.deepEqual(toFraction(0), { n: 0, d: 1 });
  assert.deepEqual(toFraction(1 / 3), { n: 1, d: 3 });
});

test('um decimal qualquer não vira fração', () => {
  assert.equal(toFraction(Math.SQRT2), null);
  assert.equal(toFraction(1.2345678), null);
  assert.equal(toFraction(Math.PI), null);
  assert.equal(toFraction(NaN), null);
  assert.equal(toFraction(Infinity), null);
  // 1/128 é uma fração, mas o denominador passa do limite.
  assert.equal(toFraction(1 / 128), null);
  assert.deepEqual(toFraction(1 / 128, 200), { n: 1, d: 128 });
});

test('a raiz de uma fração sai com o que é quadrado fora dela', () => {
  assert.deepEqual(root(2), { n: 1, d: 1, r: 2 });
  assert.deepEqual(root(8), { n: 2, d: 1, r: 2 });
  assert.deepEqual(root(25), { n: 5, d: 1, r: 1 });
  assert.deepEqual(root(0.5), { n: 1, d: 2, r: 2 });
  assert.deepEqual(root(2.25), { n: 3, d: 2, r: 1 });
  assert.deepEqual(root(3.25), { n: 1, d: 2, r: 13 });
  assert.deepEqual(root(0), { n: 0, d: 1, r: 1 });
  assert.deepEqual(root(0.1 * 0.1 + 0.2 * 0.2), { n: 1, d: 10, r: 5 });
});

test('não há raiz exata de um número negativo nem de um decimal qualquer', () => {
  assert.equal(root(-4), null);
  assert.equal(root(1.2345678), null);
  assert.equal(root(NaN), null);
});

test('um valor é reconhecido como fração, raiz ou múltiplo de pi', () => {
  assert.deepEqual(recognize(1.5), { n: 3, d: 2, r: 1 });
  assert.deepEqual(recognize(Math.SQRT2), { n: 1, d: 1, r: 2 });
  assert.deepEqual(recognize(-Math.SQRT1_2), { n: -1, d: 2, r: 2 });
  assert.deepEqual(recognize(3 / Math.sqrt(13)), { n: 3, d: 13, r: 13 });
  assert.deepEqual(recognize((2 * Math.PI) / 3), { n: 2, d: 3, pi: true });
  assert.equal(recognize(1.2345678), null);
  assert.equal(recognize(NaN), null);
});

test('a raiz escrita: exata quando dá, decimal quando não', () => {
  assert.equal(tex.sqrt(1 * 1 + -1 * -1), '\\sqrt{2}');
  assert.equal(tex.sqrt(8), '2\\sqrt{2}');
  assert.equal(tex.sqrt(25), '5');
  assert.equal(tex.sqrt(0.5), '\\tfrac{\\sqrt{2}}{2}');
  assert.equal(tex.sqrt(3.25), '\\tfrac{\\sqrt{13}}{2}');
  assert.equal(tex.sqrt(4.5), '\\tfrac{3\\sqrt{2}}{2}');
  assert.equal(tex.sqrt(0), '0');
  assert.equal(tex.sqrt(1.2345678), '1.11');
  assert.equal(text.sqrt(2), 'raiz de 2');
  assert.equal(text.sqrt(4.5), '3 raiz de 2 sobre 2');
});

test('um valor exato reconhecido sai como fração; com fractions: none, o decimal exato fica decimal', () => {
  assert.equal(tex.sqrt(2.25), '\\tfrac{3}{2}');
  assert.equal(tex.exact(0.25), '\\tfrac{1}{4}');
  assert.equal(tex.exact(-2), '-2');
  assert.equal(tex.exact(1 / 3), '\\tfrac{1}{3}');
  assert.equal(tex.exact(-2 / 3), '-\\tfrac{2}{3}');
  assert.equal(text.exact(1 / 3), '1/3');
  assert.equal(text.exact(0.25), '0.25');
  const saved = notation.fractions;
  notation.fractions = 'none';
  try {
    assert.equal(tex.sqrt(2.25), '1.5');
    assert.equal(tex.exact(0.25), '0.25');
    assert.equal(tex.exact(1 / 3), '\\tfrac{1}{3}');
  } finally {
    notation.fractions = saved;
  }
});

test('um valor escrito pelo que ele é', () => {
  assert.equal(tex.exact(Math.SQRT1_2), '\\tfrac{\\sqrt{2}}{2}');
  assert.equal(tex.exact(-3 / Math.sqrt(13)), '-\\tfrac{3\\sqrt{13}}{13}');
  assert.equal(tex.exact(Math.PI / 4), '\\tfrac{\\pi}{4}');
  assert.equal(tex.exact(1.2345678), '1.23');
  assert.equal(tex.exact(NaN), 'NaN');
});

test('o sinal diz a verdade: igual quando é exato, aproximadamente quando é arredondado', () => {
  assert.equal(tex.equalsSqrt(2), '= \\sqrt{2}');
  assert.equal(tex.equalsSqrt(1.2345678), '\\approx 1.11');
  assert.equal(text.equalsSqrt(2), '= raiz de 2');
  assert.equal(text.equalsSqrt(1.2345678), '≈ 1.11');
  assert.equal(tex.equalsExact(0.5), '= \\tfrac{1}{2}');
  assert.equal(text.equalsExact(0.5), '= 0.5');
  assert.equal(tex.equalsExact(Math.E), '\\approx 2.72');
});

test('durante uma animação, um número tem casas fixas e guarda o lugar do sinal', () => {
  holdSteady(true);
  try {
    assert.equal(tex.number(1.5), '\\phantom{-}1.50');
    assert.equal(tex.number(-1.5), '-1.50');
    assert.equal(tex.number(2), '\\phantom{-}2.00');
    assert.equal(tex.number(-0.001), '\\phantom{-}0.00');
    assert.equal(tex.number(36, 0), '\\phantom{-}36');
    assert.equal(tex.point([1, -2.5]), '(\\phantom{-}1.00,\\,-2.50)');
    // O texto lido e os campos não mudam: só o que é desenhado.
    assert.equal(text.number(1.5), '1.5');
    assert.equal(tex.unsigned(-1.5), '1.50');
  } finally {
    holdSteady(false);
  }
  // Parada a animação, o número da malha volta a ser fração.
  assert.equal(tex.number(1.5), '\\tfrac{3}{2}');
  assert.equal(tex.unsigned(-1.5), '\\tfrac{3}{2}');
});

test('duas animações ao mesmo tempo: a escrita só volta ao normal quando as duas param', () => {
  holdSteady(true);
  holdSteady(true);
  holdSteady(false);
  assert.equal(tex.number(1.5), '\\phantom{-}1.50');
  holdSteady(false);
  assert.equal(tex.number(1.5), '\\tfrac{3}{2}');
  holdSteady(false);
  assert.equal(tex.number(1.5), '\\tfrac{3}{2}');
});
