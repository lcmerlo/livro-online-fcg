// Fórmulas comentadas: pôr uma fileira de comentários em volta da fórmula, o conjunto
// no centro, e fazer as linhas de um mesmo comentário chegarem juntas.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bendStart, centering, converge, spread } from '../../src/site/annotations.js';

const notes = (...pairs) => pairs.map(([x, width]) => ({ x, width }));
const ordered = (row) => [...row].sort((a, b) => a.left - b.left);

test('com folga, cada comentário fica centrado na sua parte', () => {
  const row = notes([100, 80], [400, 120]);
  assert.equal(spread(row, 600, 10), true);
  assert.deepEqual(row.map((n) => n.left), [60, 340]);
});

test('comentários vizinhos não se sobrepõem e mantêm a ordem das partes', () => {
  const row = notes([200, 160], [210, 160], [220, 160]);
  assert.equal(spread(row, 600, 12), true);
  const [a, b, c] = ordered(row);
  assert.deepEqual([a, b, c], row);
  assert.ok(a.left + a.width + 12 <= b.left + 1e-9);
  assert.ok(b.left + b.width + 12 <= c.left + 1e-9);
});

test('perto da borda, o comentário entra no bloco', () => {
  const row = notes([5, 100], [590, 100]);
  assert.equal(spread(row, 600, 10), true);
  assert.equal(row[0].left, 0);
  assert.equal(row[1].left + row[1].width, 600);
});

test('sem lugar para todos lado a lado, a resposta é não', () => {
  assert.equal(spread(notes([100, 300], [300, 300]), 600, 10), false);
});

test('uma fileira vazia sempre cabe', () => {
  assert.equal(spread([], 0, 10), true);
});

test('o conjunto, fórmula e comentários, vai para o centro, e não só a fórmula', () => {
  // A fórmula de 200 a 400 numa coluna de 600 está no centro; um comentário que passa
  // dela até 520 leva o conjunto 60 px para a esquerda.
  assert.equal(centering(200, 520, 600), -60);
  assert.equal(centering(200, 400, 600), 0);
  assert.equal(centering(80, 400, 600), 60);
});

test('uma só linha chega no meio do comentário', () => {
  assert.deepEqual(converge(1, 100, 200, 10), [200]);
});

test('as linhas de um comentário chegam perto uma da outra, em torno do meio, na ordem das partes', () => {
  assert.deepEqual(converge(2, 100, 200, 10), [195, 205]);
  assert.deepEqual(converge(3, 100, 200, 10), [190, 200, 210]);
});

test('num comentário estreito, as chegadas se apertam e não passam das bordas', () => {
  // Largura 20: margem de 5 em cada lado, 10 de espaço para duas chegadas.
  const [a, b] = converge(2, 0, 20, 30);
  assert.ok(a >= 5 && b <= 15 && a < b);
  const [first, , last] = converge(3, 0, 20, 30);
  assert.ok(first >= 5 && last <= 15);
});

test('a linha sai do meio da caixa quando o fim já fica de lado', () => {
  assert.equal(bendStart(100, 130, 8, 20), 100);
  assert.equal(bendStart(100, 70, 8, 20), 100);
});

test('uma linha que seria reta sai deslocada, para o lado oposto ao do fim', () => {
  assert.equal(bendStart(100, 100, 8, 20), 108);
  assert.equal(bendStart(100, 103, 8, 20), 95);
  assert.equal(bendStart(100, 97, 8, 20), 105);
});

test('a saída deslocada não passa da borda da caixa', () => {
  assert.equal(bendStart(100, 100, 8, 3), 103);
  assert.equal(bendStart(100, 100, 8, 0), 100);
});
