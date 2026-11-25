// Toda cor do livro-quarto continua disponível para testes, com o mesmo valor.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/livro-colors.json', import.meta.url)));
const brand = readFileSync(new URL('../../_brand.yml', import.meta.url), 'utf8');
const palette = new Map([...brand.matchAll(/^\s+([\w-]+):\s*"(#[0-9A-Fa-f]{6})"/gm)].map(([, name, value]) => [name, value.toUpperCase()]));

test('nenhuma cor se perdeu ou mudou', () => {
  for (const { oldName, name, value } of fixture.colors) {
    assert.equal(palette.get(name), value.toUpperCase(), `${oldName} -> ${name}`);
  }
});

test('a paleta não tem nada além dessas cores', () => {
  assert.equal(palette.size, fixture.colors.length);
});

test('nenhuma cor tem só o nome de uma cor do Bootstrap', () => {
  for (const name of palette.keys()) {
    assert.ok(!['blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'black', 'white', 'gray'].includes(name), name);
  }
});
