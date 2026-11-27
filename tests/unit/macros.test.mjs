// A notação é definida uma vez: toda macro precisa valer para quem desenha as fórmulas.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

// O mesmo arquivo que as páginas carregam (é UMD, e serve também ao Node), como em
// tests/check-site.mjs: o livro-quarto não tem o katex.mjs.
const katex = createRequire(import.meta.url)('../../vendor/katex/katex.min.js');

const macros = JSON.parse(readFileSync(new URL('../../math/macros.json', import.meta.url)));

test('toda macro é desenhada', () => {
  for (const name of Object.keys(macros)) {
    const call = macros[name].includes('#1') ? `${name}{x}` : name;
    assert.doesNotThrow(() => katex.renderToString(call, { macros: { ...macros }, throwOnError: true }), name);
  }
});
