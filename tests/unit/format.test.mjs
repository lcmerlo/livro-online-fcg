import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cases, expr, makeExpr, notation, parseNumber, plain, tex, text } from '../../src/math/format.js';

// Roda `check` com outra convenção de frações e devolve a do livro.
function withFractions(value, check) {
  const saved = notation.fractions;
  notation.fractions = value;
  try {
    check();
  } finally {
    notation.fractions = saved;
  }
}

test('os números perdem os zeros à direita e o -0, e nunca escondem um valor indefinido', () => {
  assert.equal(tex.number(2.0), '2');
  assert.equal(tex.number(-0), '0');
  assert.equal(tex.number(1.005, 3), '1.005');
  assert.equal(tex.number(0.25), '0.25');
  assert.equal(text.number(NaN), 'NaN');
  assert.equal(tex.number(Infinity), 'Infinity');
});

test('um número da malha dos décimos sai como fração, em TeX; o texto lido continua decimal', () => {
  assert.equal(tex.number(1.5), '\\tfrac{3}{2}');
  assert.equal(tex.number(-0.3), '-\\tfrac{3}{10}');
  assert.equal(tex.number(0.1 + 0.2), '\\tfrac{3}{10}');
  assert.equal(tex.number(2.4), '\\tfrac{12}{5}');
  assert.equal(tex.number(-2), '-2');
  // Fora da malha, decimal: 0.25 tem duas casas, e 1.234 é arredondado.
  assert.equal(tex.number(0.25), '0.25');
  assert.equal(tex.number(1.234), '1.23');
  // Quem pede zero casas quer o inteiro.
  assert.equal(tex.number(1.5, 0), '2');
  assert.equal(text.number(1.5), '1.5');
  assert.equal(text.point([1.5, -0.3]), '(1.5, -0.3)');
});

test('com fractions: none, o decimal exato fica decimal', () => {
  withFractions('none', () => {
    assert.equal(tex.number(1.5), '1.5');
    assert.equal(tex.point([1, 2.5]), '(1,\\,2.5)');
    assert.equal(tex.exact(0.25), '0.25');
    assert.equal(tex.exact(1 / 3), '\\tfrac{1}{3}');
  });
});

test('pontos nas duas saídas', () => {
  assert.equal(tex.point([1, 2.5]), '\\left(1,\\,\\tfrac{5}{2}\\right)');
  assert.equal(tex.point([1, 2]), '(1,\\,2)');
  assert.equal(text.point([1, 2.5]), '(1, 2.5)');
  assert.equal(text.point({ X: () => 3, Y: () => 4 }), '(3, 4)');
});

test('frações, sempre do tamanho do texto', () => {
  assert.equal(tex.fraction(0.5), '\\tfrac{1}{2}');
  assert.equal(text.fraction(-0.75), '-3/4');
  assert.equal(tex.fraction(3), '3');
});

test('ângulos em graus; em radianos, uma fração de pi só quando exata e notável', () => {
  assert.equal(tex.angle(Math.PI / 4), '45^\\circ');
  assert.equal(text.angle(Math.PI / 6), '30°');
  assert.equal(tex.angle(Math.PI / 6, 'rad'), '\\tfrac{\\pi}{6}');
  assert.equal(text.angle((11 * Math.PI) / 6, 'rad'), '11π/6');
  assert.equal(text.angle((5 * Math.PI) / 12, 'rad'), '5π/12');
  assert.equal(text.angle(Math.PI, 'rad'), 'π');
  assert.equal(text.angle(0, 'rad'), '0');
  assert.equal(text.angle(0.5, 'rad'), '0.5');
  assert.equal(text.angle((2 * Math.PI) / 11, 'rad'), '0.57');
});

test('o sinal de um ângulo diz se ele é exato', () => {
  assert.equal(tex.equalsAngle(Math.PI / 6, 'rad'), '= \\tfrac{\\pi}{6}');
  assert.equal(tex.equalsAngle((2 * Math.PI) / 11, 'rad'), '\\approx 0.57');
  assert.equal(tex.equalsAngle(Math.PI / 6), '= 30^\\circ');
  assert.equal(tex.equalsAngle(0.3), '\\approx 17^\\circ');
});

test('múltiplos de pi para as marcas de um eixo', () => {
  assert.equal(tex.piMultiple(Math.PI / 2), '\\tfrac{\\pi}{2}');
  assert.equal(tex.piMultiple((-3 * Math.PI) / 2), '-\\tfrac{3\\pi}{2}');
  assert.equal(text.piMultiple(2 * Math.PI), '2π');
});

test('finite diz quando um número não existe', () => {
  assert.equal(tex.finite(1 / 0), '\\nexists');
  assert.equal(text.finite(1e7), 'não existe');
  assert.equal(text.finite(2), '2');
});

test('o leitor pode digitar a vírgula, o sinal de menos tipográfico, uma fração, pi e o grau', () => {
  assert.equal(parseNumber('1,5'), 1.5);
  assert.equal(parseNumber('−0.5'), -0.5);
  assert.equal(parseNumber(' 2 '), 2);
  assert.equal(parseNumber('.5'), 0.5);
  assert.equal(parseNumber('3/2'), 1.5);
  assert.equal(parseNumber('-1/2'), -0.5);
  assert.equal(parseNumber('pi/4'), Math.PI / 4);
  assert.equal(parseNumber('2π/3'), (2 * Math.PI) / 3);
  assert.equal(parseNumber('-π'), -Math.PI);
  assert.equal(parseNumber('36°'), 36);
  assert.equal(parseNumber('abc'), null);
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber('.'), null);
  assert.equal(parseNumber('1/0'), null);
  assert.equal(parseNumber('2/'), null);
});

test('os rótulos são lidos em voz alta sem TeX', () => {
  assert.equal(plain('mostrar a reta de $\\vec{u}$'), 'mostrar a reta de u');
  assert.equal(plain('a\\vec{u} + b\\vec{v}'), 'au + bv');
  assert.equal(plain('$\\vet{AB}$'), 'AB');
});

test('as expressões perdem os termos nulos e o fator 1', () => {
  const { equals, sum, times, write, negate, symbol, power, fraction, relation } = expr;
  assert.equal(equals(sum('x', times(-2, 't')), 0), 'x - 2t = 0');
  assert.equal(write(sum(times(1, 'x'), times(0, 'y'))), 'x');
  assert.equal(write(sum(times(0, 'x'), times(0, 'y'))), '0');
  assert.equal(write(negate('x')), '-x');
  assert.equal(write(sum('x', negate(symbol('x_0', 0)))), 'x');
  assert.equal(write(power(sum('x', -2), 2)), '(x - 2)^{2}');
  assert.equal(write(fraction(1, -2)), '-\\tfrac{1}{2}');
  assert.equal(relation(1.5, 2), '=');
  assert.equal(relation(1 / 3), '\\approx');
});

test('uma fração da malha num produto e numa potência', () => {
  const { sum, times, write, power } = expr;
  assert.equal(write(sum(times(1.5, '\\vec{u}'), times(-1, '\\vec{v}'))), '\\tfrac{3}{2}\\vec{u} - \\vec{v}');
  assert.equal(write(power(0.5, 2)), '\\left(\\tfrac{1}{2}\\right)^{2}');
  assert.equal(write(power(-0.5, 2)), '\\left(-\\tfrac{1}{2}\\right)^{2}');
  assert.equal(write(power(-3, 2)), '(-3)^{2}');
  assert.equal(write(power(1.25, 2)), '1.25^{2}');
});

test('um número indefinido continua à vista numa expressão', () => {
  assert.match(expr.write(expr.sum(NaN, 'x')), /NaN/);
});

test('a precisão de uma expressão', () => {
  const one = makeExpr({ digits: 1 });
  assert.equal(one.write(one.times(1.26, 'x')), '1.3x');
  assert.equal(one.write(one.times(0.04, 'x')), '0');
  assert.equal(one.write(one.times(1.5, 'x')), '\\tfrac{3}{2}x');
});

test('cases: vale a primeira condição verdadeira', () => {
  const pick = cases([[() => false, 'a'], [true, () => 'b']], 'c');
  assert.equal(pick(), 'b');
  assert.equal(cases([], 'c')(), 'c');
});
