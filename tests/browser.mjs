// O comportamento num navegador de verdade: node browser.mjs (depois de `quarto render
// --profile lab --to html`).
//   node browser.mjs            tudo
//   node browser.mjs fields     só as verificações cujo nome contém "fields"
// Vem do livro-base (tests/browser.mjs), adaptado às páginas do livro na fase 8 do plano
// de migração. Lê sempre o site do perfil lab (docs-lab/): ele tem as páginas do site
// público (a Apresentação e Acessibilidade) e as do laboratório, onde estão os applets, os
// modelos de capítulo e as fórmulas; o site público, sozinho, não tem applet. As
// verificações dos applets que o livro não tem (a combinação linear, seno e cosseno, as
// figuras que se arrastam inteiras, os números que não pulam, os valores exatos) e as do
// apêndice de cores ficaram lá. Uma verificação nova começa lá, quando a página existe nos
// dois projetos.
// Cada verificação diz o que um leitor notaria se ela falhasse. As capturas de tela
// vão para tests/output/.

import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, serve } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..', 'docs-lab');
const output = join(here, 'output');
mkdirSync(output, { recursive: true });

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const port = 8211;
const base = `http://localhost:${port}`;
const only = process.argv.slice(2).find((arg) => !arg.startsWith('--'));

const folder = join(site, 'laboratorio');
if (!existsSync(folder)) throw new Error('sem docs-lab/laboratorio/: rode `quarto render --profile lab --to html` antes');
const pages = ['index.html', 'acessibilidade.html', ...readdirSync(folder).filter((name) => name.endsWith('.html')).map((name) => `laboratorio/${name}`)];
// As páginas que fazem as vezes das do livro-base. chapter: o modelo de capítulo, com um
// applet só, o scalar-multiple, com as partes padrão, os blocos e as abas (lá,
// capitulos/multiplo-escalar.html e modelos/capitulo.html). As outras vieram de modelos/
// de lá. colors: um applet de três quadros ligados (color-models).
const chapter = 'laboratorio/modelo-capitulo-completo.html';
const arrangements = 'laboratorio/arranjos.html';
const formulasPage = 'laboratorio/formulas.html';
const annotatedPage = 'laboratorio/formulas-comentadas.html';
const colors = 'laboratorio/teste-cores.html';
const widths = [320, 375, 600, 768, 1024, 1280, 1440, 1920];

const server = await serve(site, port);
const browser = await launch();
const results = [];

async function check(name, run) {
  if (only && !name.includes(only)) return;
  const started = Date.now();
  try {
    await run();
    results.push({ name, ok: true });
    console.log(`  ok    ${name} (${Date.now() - started} ms)`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.log(`  FALHA ${name}\n        ${String(error.message ?? error).split('\n').slice(0, 6).join('\n        ')}`);
  }
}

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const near = (a, b, tolerance = 0.01) => Math.abs(a - b) <= tolerance;

// Um visitante novo: armazenamento limpo, de olho nos erros e nos pedidos a outros servidores.
async function open(path, { width = 1280, height = 900, touch = false, reducedMotion, prefs } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: touch,
    isMobile: touch,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  if (prefs) {
    await context.addInitScript((saved) => localStorage.setItem('book-prefs', JSON.stringify(saved)), prefs);
  }
  const page = await context.newPage();
  page.problems = [];
  page.foreign = new Set();
  page.on('pageerror', (error) => page.problems.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') page.problems.push(message.text());
  });
  page.on('request', (request) => {
    const { host } = new URL(request.url());
    if (!host.startsWith('localhost') && !request.url().startsWith('data:')) page.foreign.add(host);
  });
  await page.goto(`${base}/${path}`, { waitUntil: 'load' });
  return page;
}

// Os applets são montados ao se aproximarem da tela: andar pela página monta todos.
// A rolagem é instantânea: com a rolagem suave do site (smooth-scroll: true), cada passo
// recomeçava uma animação, a página ficava até 30 000 px atrás do passo e depois saltava
// por cima de applets inteiros, que não chegavam a ser montados.
async function mountAll(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight / 2);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    const blocks = [...document.querySelectorAll('.applet[data-applet]')];
    for (let i = 0; i < 100 && blocks.some((block) => !window.bookApplets?.has(block)); i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
}

async function appletReady(page, selector = '.applet[data-applet]') {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => window.bookApplets?.has(document.querySelector(s)), selector, { timeout: 20000 });
  await page.waitForTimeout(150);
}

// A posição de um handle na tela, com o board dele no meio da tela (o cabeçalho
// fixo cobriria o que ficasse embaixo dele).
const handleInfo = (page, index = 0, boardIndex = 0) =>
  page.evaluate(async ([i, b]) => {
    const applet = [...window.bookApplets.values()][0];
    const board = applet.boards[b];
    board.containerObj.scrollIntoView({ block: 'center', behavior: 'instant' });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const handle = board.handles[i];
    const box = board.containerObj.getBoundingClientRect();
    const [, sx, sy] = handle.coords.scrCoords;
    return { x: handle.X(), y: handle.Y(), left: box.left + sx, top: box.top + sy, size: handle.evalVisProp('size') };
  }, [index, boardIndex]);

const boardPoint = (page, ux, uy, boardIndex = 0) =>
  page.evaluate(([x, y, b]) => {
    const board = [...window.bookApplets.values()][0].boards[b];
    const box = board.containerObj.getBoundingClientRect();
    const [xMin, yMax, xMax, yMin] = board.getBoundingBox();
    return { left: box.left + 1 + ((x - xMin) / (xMax - xMin)) * (box.width - 2), top: box.top + 1 + ((yMax - y) / (yMax - yMin)) * (box.height - 2) };
  }, [ux, uy, boardIndex]);

// O TeX de uma expressão do applet, sem o \rule invisível que segura a altura dela
// (src/applet/tex.js: drawSteady).
const withoutRule = (code) => code.replace(/\\rule\[[^\]]*\]\{0em\}\{[^}]*\}$/, '');
const liveText = async (page, name, scope = '') => withoutRule(await page.locator(`${scope} .live[data-part="${name}"] .katex-mathml annotation`.trim()).first().textContent());

// ---------- Larguras ----------

console.log('\nLarguras e páginas');

for (const width of widths) {
  await check(`largura ${width}: nenhuma página rola para o lado, sem erros e sem outros servidores`, async () => {
    for (const path of pages) {
      const page = await open(path, { width, height: width < 500 ? 740 : 900, touch: width < 500 });
      await mountAll(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 0, `${path}: a página rola ${overflow} px para o lado`);
      const wide = await page.evaluate(() =>
        [...document.querySelectorAll('.board')].filter((b) => b.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length,
      );
      assert(wide === 0, `${path}: ${wide} quadros passam da borda`);
      const unmounted = await page.evaluate(() => [...document.querySelectorAll('.board')].filter((b) => !b.querySelector('svg')).length);
      assert(unmounted === 0, `${path}: ${unmounted} quadros não foram desenhados`);
      assert(page.problems.length === 0, `${path}: ${page.problems[0]}`);
      assert(page.foreign.size === 0, `${path}: pediu algo a ${[...page.foreign].join(', ')}`);
      await page.context().close();
    }
  });
}

await check('largura 320, com todas as opções ligadas e o texto maior: nada rola para o lado', async () => {
  const prefs = { fields: 'on', tapMove: 'on', bigTargets: 'on', describe: 'on', contrast: 'on', wideSpacing: 'on', textSize: '150' };
  for (const path of pages) {
    const page = await open(path, { width: 320, height: 640, touch: true, prefs });
    await mountAll(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 0, `${path}: a página rola ${overflow} px para o lado`);
    assert(page.problems.length === 0, `${path}: ${page.problems[0]}`);
    await page.context().close();
  }
});

await check('largura 320: o botão de acessibilidade está visível em todas as páginas', async () => {
  for (const path of pages) {
    const page = await open(path, { width: 320, height: 640, touch: true });
    const button = page.locator('#quarto-header a[href$="acessibilidade.html"]').first();
    assert(await button.isVisible(), `${path}: o botão não aparece`);
    const box = await button.boundingBox();
    assert(box.width >= 24 && box.height >= 24, `${path}: botão com ${box.width}x${box.height} px`);
    await page.context().close();
  }
});

await check('em tela larga, o applet largo usa a margem e o texto mantém a largura de leitura', async () => {
  const page = await open(arrangements, { width: 1440 });
  const wide = page.locator('.applet.column-page-right').first();
  await wide.scrollIntoViewIfNeeded();
  const applet = await wide.evaluate((el) => el.getBoundingClientRect().width);
  const text = await page.locator('#mais-largo-que-o-texto p').first().evaluate((el) => el.getBoundingClientRect().width);
  assert(applet > text + 150, `applet ${applet} px e texto ${text} px`);
  assert(text <= 760, `o texto ficou com ${text} px, longo demais para ler`);
  await page.context().close();
});

await check('as colunas se desfazem pela largura do applet, não pela da janela', async () => {
  const page = await open(arrangements, { width: 1024 });
  const grid = page.locator('.applet .cols').first();
  await grid.scrollIntoViewIfNeeded();
  const columns = async () => grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  assert((await columns()) === 2, `a 1024 px, ${await columns()} colunas`);
  await page.setViewportSize({ width: 480, height: 800 });
  await page.waitForTimeout(100);
  assert((await columns()) === 1, 'a 480 px, uma coluna');
  await page.context().close();
});

// ---------- O padrão enxuto ----------

console.log('\nPadrão enxuto');

await check('por padrão, nenhuma alternativa aparece', async () => {
  const page = await open(chapter);
  await appletReady(page);
  assert((await page.locator('.applet-fields').count()) === 0, 'campos à vista');
  assert((await page.locator('.applet-hint').count()) === 0, 'dica de toque à vista');
  const status = await page.locator('.applet-status').evaluate((el) => el.getBoundingClientRect().width);
  assert(status <= 1, 'descrição à vista');
  assert((await page.evaluate(() => Object.keys(document.documentElement.dataset).length)) === 0, 'preferências ligadas sem pedir');
  await page.context().close();
});

await check('o leitor de tela recebe a descrição mesmo com ela escondida', async () => {
  const page = await open(chapter);
  await appletReady(page);
  const status = page.locator('.applet-status');
  assert((await status.getAttribute('role')) === 'status', 'sem role=status');
  assert((await status.textContent()).includes('a = 1.5'), 'descrição vazia');
  await page.context().close();
});

await check('o que o leitor vê está em português: nomes, títulos, botões e rótulos dos blocos', async () => {
  const english = /\b(toggle|search|copy|previous|next|reader|menu|close|open|the|sidebar|navigation|chapter|reset|play|pause|breadcrumb|checkpoint|board|slider|handle|glider|state)\b/i;
  for (const path of ['index.html', chapter, 'laboratorio/teste-controles.html']) {
    for (const prefs of [undefined, { fields: 'on', tapMove: 'on' }]) {
      const page = await open(path, { prefs });
      await mountAll(page);
      await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
      const found = await page.evaluate((pattern) => {
        const texts = [];
        for (const el of document.querySelectorAll('body *')) {
          for (const attribute of ['aria-label', 'aria-roledescription', 'title', 'placeholder', 'alt']) if (el.getAttribute(attribute)) texts.push(el.getAttribute(attribute));
        }
        for (const el of document.querySelectorAll('button, a.nav-link, summary, legend, label, .applet-status, .applet-hint, .block-label')) texts.push(el.textContent.trim());
        return texts.filter((text) => new RegExp(pattern, 'i').test(text));
      }, english.source);
      assert(found.length === 0, `${path}: ${found.slice(0, 5).join(' | ')}`);
      await page.context().close();
    }
  }
});

await check('uma página sem applet não baixa JSXGraph', async () => {
  const page = await open(formulasPage, { height: 300 });
  const requests = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name));
  assert(!requests.some((name) => name.includes('jsxgraph')), 'JSXGraph baixado no carregamento');
  await page.context().close();
});

// ---------- O painel de acessibilidade ----------

console.log('\nPainel de acessibilidade');

await check('o painel abre de qualquer página, em qualquer largura', async () => {
  for (const width of [320, 1280]) {
    for (const path of pages) {
      const page = await open(path, { width, height: 700, touch: width < 500 });
      await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
      assert(await page.locator('dialog.settings[open]').isVisible(), `${path} a ${width} px`);
      const box = await page.locator('dialog.settings').boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width, `${path}: o painel passa da tela a ${width} px`);
      await page.context().close();
    }
  }
});

await check('pelo teclado: a primeira parada do Tab leva ao painel, e Esc fecha', async () => {
  const page = await open(chapter);
  await page.keyboard.press('Tab');
  assert((await page.evaluate(() => document.activeElement.textContent)) === 'Ir para o conteúdo', 'primeira parada');
  const shortcuts = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => a.hash === '#quarto-document-content').length);
  assert(shortcuts === 1, `${shortcuts} atalhos para o conteúdo, e não 1`);
  await page.keyboard.press('Tab');
  assert((await page.evaluate(() => document.activeElement.textContent)).includes('acessibilidade'), 'segunda parada');
  await page.keyboard.press('Enter');
  assert(await page.locator('dialog.settings[open]').isVisible(), 'não abriu');
  const focused = await page.evaluate(() => document.activeElement.closest('dialog') !== null);
  assert(focused, 'o foco ficou fora do painel');
  await page.keyboard.press('Escape');
  assert(!(await page.locator('dialog.settings[open]').isVisible()), 'não fechou');
  await page.context().close();
});

await check('a escolha vale na hora, em outra página e depois de recarregar', async () => {
  const page = await open(chapter);
  await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
  await page.locator('input[data-pref="fields"]').check();
  await page.locator('.settings-close').click();
  await appletReady(page);
  await page.waitForSelector('.applet-fields');
  await page.goto(`${base}/${colors}`);
  assert((await page.evaluate(() => document.documentElement.dataset.fields)) === 'on', 'não valeu em outra página');
  await page.goto(`${base}/${chapter}`);
  await appletReady(page);
  await page.waitForSelector('.applet-fields');
  await page.context().close();
});

await check('Restaurar o padrão desfaz tudo', async () => {
  const page = await open(chapter, { prefs: { fields: 'on', tapMove: 'on', contrast: 'on', textSize: '130', describe: 'on' } });
  await appletReady(page);
  await page.getByRole('button', { name: 'Opções de acessibilidade', exact: true }).click();
  await page.locator('.settings-reset').click();
  await page.locator('.settings-close').click();
  await page.waitForTimeout(400);
  assert((await page.evaluate(() => Object.keys(document.documentElement.dataset).length)) === 0, 'sobrou preferência');
  assert((await page.locator('.applet-fields').count()) === 0, 'sobraram campos');
  await page.context().close();
});

await check('mudar uma opção não apaga o que o estudante fez', async () => {
  const page = await open(chapter);
  await appletReady(page);
  await page.locator('.control.slider input').fill('-0.5');
  const before = await handleInfo(page);
  // Pelo próprio applet: o cabeçalho pode estar escondido pela rolagem.
  await page.getByRole('button', { name: 'Opções de acessibilidade', exact: true }).click();
  await page.locator('input[data-pref="bigTargets"]').check();
  await page.locator('.settings-close').click();
  await page.waitForTimeout(500);
  const value = await page.locator('.control.slider input').inputValue();
  assert(Number(value) === -0.5, `a faixa voltou para ${value}`);
  const after = await handleInfo(page);
  assert(near(before.x, after.x) && near(before.y, after.y), 'o ponto voltou');
  assert(after.size > before.size, 'o ponto não cresceu');
  await page.context().close();
});

await check('contraste alto, texto maior e descrição visível mudam o que devem', async () => {
  const plain = await open(chapter);
  await appletReady(plain);
  const normal = await plain.evaluate(() => ({
    font: getComputedStyle(document.documentElement).fontSize,
    stroke: [...window.bookApplets.values()][0].boards[0].objectsList.find((o) => o.elType === 'arrow')?.evalVisProp('strokewidth'),
  }));
  await plain.context().close();

  const page = await open(chapter, { prefs: { contrast: 'on', textSize: '130', describe: 'on', wideSpacing: 'on' } });
  await appletReady(page);
  const chosen = await page.evaluate(() => ({
    font: getComputedStyle(document.documentElement).fontSize,
    stroke: [...window.bookApplets.values()][0].boards[0].objectsList.find((o) => o.elType === 'arrow')?.evalVisProp('strokewidth'),
    status: document.querySelector('.applet-status').getBoundingClientRect().width,
  }));
  assert(parseFloat(chosen.font) > parseFloat(normal.font) * 1.2, `texto ${normal.font} -> ${chosen.font}`);
  assert(chosen.stroke > normal.stroke, `traço ${normal.stroke} -> ${chosen.stroke}`);
  assert(chosen.status > 100, 'descrição escondida');
  await page.context().close();
});

await check('com o cabeçalho escondido pela rolagem, o Tab o traz de volta', async () => {
  const page = await open(chapter, { width: 375, height: 667, touch: true });
  await page.evaluate(() => scrollTo({ top: 1500, behavior: 'instant' }));
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(500);
  const button = page.locator('#quarto-header a[href$="acessibilidade.html"]').first();
  await button.focus();
  await page.waitForTimeout(300);
  const box = await button.boundingBox();
  assert(box && box.y >= 0 && box.y < 300, `botão em y = ${box?.y}`);
  await page.context().close();
});

await check('a preferência do sistema por menos movimento marca a opção', async () => {
  const page = await open(chapter, { reducedMotion: true });
  await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
  assert(await page.locator('input[data-pref="reduceMotion"]').isChecked(), 'a opção não veio marcada');
  await page.context().close();
});

await check('sem armazenamento (janela privada restrita), o site funciona', async () => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  const page = await context.newPage();
  const problems = [];
  // Os scripts do próprio Quarto tropeçam aqui; o que importa é que os nossos não.
  page.on('pageerror', (error) => {
    if (String(error.stack).includes('/src/')) problems.push(String(error.stack));
  });
  await page.goto(`${base}/${chapter}`);
  await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
  await page.locator('input[data-pref="fields"]').check();
  await page.locator('.settings-close').click();
  // O applet fica longe do alto da página: só é montado perto da tela.
  await page.locator('.applet').first().scrollIntoViewIfNeeded();
  await page.waitForSelector('.applet-fields');
  assert(problems.length === 0, problems[0]);
  await context.close();
});

// ---------- Mover os pontos ----------

console.log('\nMover os pontos');

await check('arrastar com o mouse move o ponto, e ele não sai do quadro', async () => {
  const page = await open(chapter);
  await appletReady(page);
  const start = await handleInfo(page);
  await page.mouse.move(start.left, start.top);
  await page.mouse.down();
  const target = await boardPoint(page, -3, 2);
  await page.mouse.move(target.left, target.top, { steps: 5 });
  // A mão para antes de soltar; o JSXGraph pode pular o último movimento de uma rajada.
  await page.waitForTimeout(60);
  await page.mouse.move(target.left + 1, target.top);
  await page.waitForTimeout(60);
  await page.mouse.up();
  const moved = await handleInfo(page);
  assert(near(moved.x, -3, 0.51) && near(moved.y, 2, 0.51), `foi para (${moved.x}, ${moved.y})`);

  const outside = await page.locator('.board').first().boundingBox();
  await page.mouse.move(moved.left, moved.top);
  await page.mouse.down();
  await page.mouse.move(outside.x - 200, outside.y - 200, { steps: 5 });
  await page.mouse.up();
  const kept = await handleInfo(page);
  assert(kept.x >= -5 && kept.y <= 4, `saiu da região: (${kept.x}, ${kept.y})`);
  await page.context().close();
});

await check('o teclado sempre funciona: Tab até o ponto e setas', async () => {
  const page = await open(chapter);
  await appletReady(page);
  const label = await page.evaluate(() => {
    const node = [...window.bookApplets.values()][0].boards[0].handles[0].rendNode;
    node.focus();
    return node.getAttribute('aria-label');
  });
  assert(label.includes('ponta de u'), `nome lido: ${label}`);
  const before = await handleInfo(page);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(100);
  const after = await handleInfo(page);
  assert(after.x < before.x, `x ${before.x} -> ${after.x}`);
  await page.context().close();
});

await check('o leitor de tela diz "ponto livre"', async () => {
  // No livro, nenhum applet tem ponto restrito (o glider): no livro-base, a verificação
  // confere também o "ponto restrito".
  const page = await open(chapter);
  await appletReady(page);
  const kind = await page.evaluate(() => [...window.bookApplets.values()][0].boards[0].handles[0].rendNode.getAttribute('aria-roledescription'));
  assert(kind === 'ponto livre', `o leitor de tela diz: ${kind}`);
  await page.context().close();
});

await check('fields: digitar coordenadas (com vírgula) e usar ▲ e ▼ move o ponto; cada fileira é "u = (campo, campo)"', async () => {
  const page = await open(chapter, { prefs: { fields: 'on' } });
  await appletReady(page);
  // O nome, sem "coordenadas de", e depois "= (", o campo de x, ",", o de y e ")", nessa
  // ordem, da esquerda para a direita.
  const row = await page.locator('.field-row').first().evaluate((element) => {
    const tex = (node) => node.querySelector('annotation')?.textContent;
    const parts = [element.querySelector('.field-name'), ...element.querySelectorAll('.field-sign, .stepper')];
    const lefts = parts.map((part) => part.getBoundingClientRect().left);
    return {
      name: tex(parts[0]),
      sequence: parts.slice(1).map((part) => (part.matches('.stepper') ? 'campo' : tex(part))).join(' '),
      inOrder: lefts.every((left, i) => i === 0 || left > lefts[i - 1]),
    };
  });
  assert(row.name === '\\vec{u}' && row.sequence === '= ( campo , campo )' && row.inOrder, `fileira: ${JSON.stringify(row)}`);
  const x = page.getByRole('spinbutton', { name: 'x da ponta de u', exact: true });
  await x.fill('-2,5');
  await x.press('Enter');
  await page.waitForTimeout(100);
  let info = await handleInfo(page);
  // Preso à malha de inteiros, como este applet pede.
  assert(near(info.x, -2.5, 0.51), `x = ${info.x}`);
  const before = info.y;
  await page.getByRole('button', { name: 'Aumentar y da ponta de u' }).click();
  await page.waitForTimeout(100);
  info = await handleInfo(page);
  assert(info.y > before, `y ${before} -> ${info.y}`);
  // No campo, a seta do teclado faz o mesmo que o triângulo.
  const y = page.getByRole('spinbutton', { name: 'y da ponta de u', exact: true });
  await y.focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  assert(near((await handleInfo(page)).y, before), 'a seta para baixo no campo não desceu o ponto');
  // ▲ sobre ▼, à direita do campo.
  const layout = await page.locator('.applet-fields .stepper').first().evaluate((stepper) => {
    const [input, up, down] = [stepper.querySelector('input'), ...stepper.querySelectorAll('button')].map((el) => el.getBoundingClientRect());
    return { right: up.left >= input.right - 1 && down.left >= input.right - 1, stacked: up.bottom <= down.top + 1 && Math.abs(up.left - down.left) < 1 };
  });
  assert(layout.right && layout.stacked, `os triângulos não estão empilhados à direita do campo: ${JSON.stringify(layout)}`);
  await page.getByRole('button', { name: 'Reiniciar' }).click();
  await page.waitForTimeout(100);
  info = await handleInfo(page);
  assert(near(info.x, 2) && near(info.y, 1), `Reiniciar: (${info.x}, ${info.y})`);
  assert((await x.inputValue()) === '2', `o campo mostra ${await x.inputValue()}`);
  await page.context().close();
});

await check('fields: valem também para um applet que nada sabe sobre eles', async () => {
  const page = await open(colors, { prefs: { fields: 'on' } });
  await appletReady(page);
  const rows = await page.locator('.field-row').count();
  const handles = await page.evaluate(() => [...window.bookApplets.values()][0].boards.reduce((n, board) => n + board.handles.length, 0));
  assert(rows > 0 && rows === handles, `${rows} linhas, e o applet tem ${handles} pontos livres`);
  await page.context().close();
});

await check('tocar no ponto e depois no destino move o ponto, sem arrastar', async () => {
  const page = await open(chapter, { prefs: { tapMove: 'on' } });
  await appletReady(page);
  const start = await handleInfo(page, 0);
  await page.mouse.click(start.left, start.top);
  assert((await page.locator('.applet-hint').textContent()).includes('escolhido'), 'não escolheu o ponto');
  const target = await boardPoint(page, -1, 1);
  await page.mouse.click(target.left, target.top);
  await page.waitForTimeout(100);
  const moved = await handleInfo(page, 0);
  assert(near(moved.x, -1, 0.1) && near(moved.y, 1, 0.1), `foi para (${moved.x}, ${moved.y})`);
  assert((await page.locator('.applet-hint').textContent()).includes('movido'), 'não avisou');

  // Apertar e mover não é um toque: nada é arrastado.
  const now = await handleInfo(page, 0);
  await page.mouse.move(now.left, now.top);
  await page.mouse.down();
  await page.mouse.move(now.left - 60, now.top + 60, { steps: 4 });
  await page.mouse.up();
  const still = await handleInfo(page, 0);
  assert(near(still.x, now.x) && near(still.y, now.y), 'o gesto arrastou o ponto');
  await page.context().close();
});

await check('pontos maiores têm área de captura maior', async () => {
  const page = await open(chapter, { prefs: { bigTargets: 'on' } });
  await appletReady(page);
  const info = await handleInfo(page);
  assert(info.size >= 6, `raio ${info.size}`);
  // A 18 px, o toque erraria um ponto comum, cujo raio de captura é de 10 px.
  await page.mouse.move(info.left + 18, info.top);
  await page.mouse.down();
  const target = await boardPoint(page, -2, -2);
  await page.mouse.move(target.left, target.top, { steps: 5 });
  await page.mouse.up();
  const moved = await handleInfo(page);
  assert(moved.x < 0, `o toque ao lado não pegou o ponto: x = ${moved.x}`);
  await page.context().close();
});

await check('toque: o dedo fora dos pontos rola a página; sobre um ponto, arrasta só o ponto', async () => {
  const page = await open(chapter, { width: 375, height: 667, touch: true });
  await appletReady(page);
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (x, y, dx, dy) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(250);
  };
  await page.locator('.board').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  const empty = await boardPoint(page, -3.5, -3);
  const scrollBefore = await page.evaluate(() => scrollY);
  await swipe(empty.left, empty.top, 0, -120);
  const scrollAfter = await page.evaluate(() => scrollY);
  assert(scrollAfter > scrollBefore + 40, `a página não rolou: ${scrollBefore} -> ${scrollAfter}`);

  await page.locator('.board').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  const info = await handleInfo(page);
  const scrollOnPoint = await page.evaluate(() => scrollY);
  await swipe(info.left, info.top, -60, 60);
  // A rolagem é lida logo depois do gesto: handleInfo põe o board no meio da tela de
  // novo, e isso mexe nela.
  const scrollAfterDrag = await page.evaluate(() => scrollY);
  const moved = await handleInfo(page);
  assert(moved.x < info.x, `o ponto não se moveu: ${info.x} -> ${moved.x}`);
  assert(near(scrollAfterDrag, scrollOnPoint, 2), `a página rolou enquanto o ponto era arrastado: ${scrollOnPoint} -> ${scrollAfterDrag}`);
  await page.context().close();
});

// ---------- Vários boards e expressões ----------

console.log('\nVários quadros e expressões');

await check('mexer num quadro atualiza os outros e a descrição', async () => {
  const page = await open(colors);
  await appletReady(page);
  assert((await page.locator('.board svg').count()) >= 3, 'faltam quadros');
  await page.waitForTimeout(500);
  const before = await page.locator('.applet-status').textContent();
  const tip = await handleInfo(page, 0);
  const target = await boardPoint(page, 2, 3);
  await page.mouse.move(tip.left, tip.top);
  await page.mouse.down();
  await page.mouse.move(target.left, target.top, { steps: 5 });
  await page.waitForTimeout(60);
  await page.mouse.move(target.left + 1, target.top);
  await page.waitForTimeout(60);
  await page.mouse.up();
  await page.waitForTimeout(150);
  const tips = await page.evaluate(() => [...window.bookApplets.values()][0].boards.map((board) => [board.handles[0].X(), board.handles[0].Y()]));
  assert(tips.length === 3 && tips.every(([x, y]) => near(x, 2) && near(y, 3)), `as pontas de u: ${JSON.stringify(tips)}`);
  await page.waitForTimeout(500);
  assert((await page.locator('.applet-status').textContent()) !== before, 'a descrição não acompanhou');
  await page.context().close();
});

await check('uma expressão fora do bloco, no meio de uma frase, acompanha o applet', async () => {
  const page = await open(arrangements);
  await appletReady(page, '#exemplo-expressao');
  const outside = '#exemplo-expressao + p';
  assert((await liveText(page, 'a', outside)) === '\\tfrac{3}{2}', `valor inicial: ${await liveText(page, 'a', outside)}`);
  await page.locator('#exemplo-expressao .control.slider input').fill('-1');
  await page.waitForTimeout(100);
  assert((await liveText(page, 'a', outside)) === '-1', 'não acompanhou');
  const inside = await page.locator(`${outside} .live[data-part="a"]`).evaluate((el) => el.closest('.applet'));
  assert(inside === null, 'a expressão deveria estar fora do bloco');
  await page.context().close();
});

await check('o capítulo escolhe as partes: só o quadro, sem controles', async () => {
  const page = await open(arrangements);
  await mountAll(page);
  const block = page.locator('.applet[aria-label="Exemplo: só o quadro"]');
  await block.scrollIntoViewIfNeeded();
  assert((await block.locator('.board').count()) === 1, 'quadros demais');
  assert((await block.locator('input').count()) === 0, 'os controles apareceram');
  await page.context().close();
});

await check('um quadro com outro formato: ratio="3 / 1" sai três vezes mais largo que alto', async () => {
  const page = await open(arrangements, { width: 1440 });
  const block = '.applet[aria-label="Exemplo: quadro largo e baixo"]';
  await appletReady(page, block);
  const shape = await page.locator(`${block} .board`).evaluate((b) => b.getBoundingClientRect().width / b.getBoundingClientRect().height);
  assert(near(shape, 3, 0.05), `o quadro tem ${shape} de largura por altura`);
  await page.context().close();
});

await check('a faixa aparece sozinha: nenhum campo de digitar por padrão; Reiniciar volta a faixa e a caixa', async () => {
  const page = await open(chapter);
  await appletReady(page);
  assert((await page.locator('.applet input[type="text"]').count()) === 0, 'há um campo de digitar sem o leitor pedir');
  assert((await page.locator('.applet .stepper').count()) === 0, 'campo com ▲ e ▼ sem o leitor pedir');
  const slider = page.locator('.control.slider input[type="range"]');
  await slider.fill('1');
  await page.locator('.control.checkbox input').check();
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  assert(Number(await slider.inputValue()) === 1.5, 'Reiniciar não voltou a faixa');
  assert(!(await page.locator('.control.checkbox input').isChecked()), 'Reiniciar não voltou a caixa');
  await page.context().close();
});

await check('fields: cada faixa vira "a =" e um campo com ▲ e ▼, de acordo com ela', async () => {
  const page = await open(chapter, { prefs: { fields: 'on' } });
  await appletReady(page);
  const slider = page.locator('.control.slider input[type="range"]');
  const field = page.getByRole('spinbutton', { name: 'Valor de a', exact: true });
  // O valor não aparece duas vezes: ao lado do slider, só "a =" e o campo.
  const readout = await page.locator('.control.slider .control-value annotation').textContent();
  assert(readout === 'a =', `ao lado da faixa: ${readout}`);
  await slider.fill('1');
  assert((await field.inputValue()) === '1', 'o campo não acompanhou a faixa');
  await field.fill('0,5');
  await field.press('Enter');
  assert(Number(await slider.inputValue()) === 0.5, 'a faixa não acompanhou o campo');
  await page.getByRole('button', { name: 'Aumentar a', exact: true }).click();
  assert(Number(await slider.inputValue()) === 0.6, `o triângulo ▲ levou a ${await slider.inputValue()}`);
  await page.getByRole('button', { name: 'Diminuir a', exact: true }).click();
  await page.getByRole('button', { name: 'Diminuir a', exact: true }).click();
  assert(Number(await slider.inputValue()) === 0.4, `o triângulo ▼ levou a ${await slider.inputValue()}`);
  await field.focus();
  await page.keyboard.press('ArrowUp');
  assert(Number(await slider.inputValue()) === 0.5, `a seta para cima levou a ${await slider.inputValue()}`);
  await field.fill('3/2');
  await field.press('Enter');
  assert(Number(await slider.inputValue()) === 1.5, `3/2 levou a ${await slider.inputValue()}`);
  await field.fill('9');
  await field.press('Enter');
  assert((await field.inputValue()) === '2', 'fora do intervalo');
  await field.fill('abc');
  await field.press('Enter');
  assert((await field.inputValue()) === '2', 'texto inválido não foi desfeito');
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  assert((await field.inputValue()) === '1.5', 'Reiniciar não voltou o campo');
  await page.context().close();
});

await check('a animação só começa a pedido, e para quando o estudante mexe', async () => {
  const page = await open(chapter);
  await appletReady(page);
  const slider = page.locator('.control.slider input');
  const initial = await slider.inputValue();
  await page.waitForTimeout(400);
  assert((await slider.inputValue()) === initial, 'mexeu sozinha');
  await page.getByRole('button', { name: 'Animar' }).click();
  await page.waitForTimeout(400);
  assert((await slider.inputValue()) !== initial, 'não animou');
  await page.getByRole('button', { name: 'Pausar' }).waitFor();
  await slider.fill('0');
  await page.waitForTimeout(300);
  assert(Number(await slider.inputValue()) === 0, 'continuou depois do estudante mexer');
  await page.getByRole('button', { name: 'Animar' }).waitFor();
  await page.context().close();
});

await check('com menos movimento, o botão avança em passos', async () => {
  const page = await open(chapter, { prefs: { reduceMotion: 'on' } });
  await appletReady(page);
  const slider = page.locator('.control.slider input');
  const before = Number(await slider.inputValue());
  const button = page.getByRole('button', { name: 'Avançar' });
  await button.click();
  const first = Number(await slider.inputValue());
  assert(first !== before, 'não avançou');
  await page.waitForTimeout(300);
  assert(Number(await slider.inputValue()) === first, 'continuou se movendo');
  await page.context().close();
});

// ---------- Menu lateral e blocos ----------

console.log('\nMenu lateral e blocos');

await check('menu lateral: as seções de cada capítulo são subitens que se recolhem, e a coluna da direita saiu', async () => {
  const page = await open(chapter, { width: 1440 });
  assert((await page.locator('#TOC').count()) === 0, 'a coluna "Neste capítulo" continua na página');

  const current = page.locator('#quarto-sidebar details[open]');
  assert((await current.count()) === 1, `${await current.count()} listas de seções abertas`);
  const links = current.locator('a');
  const sections = await page.locator('main section.level2 > h2').count();
  assert(sections > 3 && (await links.count()) === sections, `${await links.count()} seções do capítulo no menu, e ele tem ${sections}`);

  // As seções de outra página da mesma parte (Laboratório) ficam fechadas até o leitor
  // pedir, também pelo teclado; as outras partes do menu ficam recolhidas.
  const chapterLink = (file) => page.locator(`a[href$="${file}"]`);
  const other = page.locator('#quarto-sidebar li.has-sections').filter({ has: chapterLink('laboratorio/formulas.html') });
  assert(!(await other.locator('details a').first().isVisible()), 'as seções de outro capítulo já estão abertas');
  await other.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert(await other.locator('details a').first().isVisible(), 'o teclado não abre as seções de outro capítulo');
  assert((await other.locator('details a').first().getAttribute('href')).includes('formulas.html#'), 'a seção de outro capítulo não leva a ele');
  const plain = page.locator('#quarto-sidebar li.sidebar-item:not(.sidebar-item-section)').filter({ has: chapterLink('teste-cores.html') });
  assert((await plain.locator('summary').count()) === 0, 'um capítulo sem seções tem a seta de abrir');

  // Escolher uma seção leva a ela, e o menu passa a marcá-la.
  await links.filter({ hasText: 'Exemplo e prática' }).click();
  await page.waitForTimeout(900);
  const state = await page.evaluate(() => ({ y: scrollY, active: document.querySelector('.sidebar-sections a.active')?.textContent, current: document.querySelectorAll('.sidebar-sections a[aria-current="location"]').length }));
  assert(state.y > 200, 'a página não foi até a seção');
  assert(/Exemplo e prática/.test(state.active ?? '') && state.current === 1, `seção marcada no menu: ${state.active}`);

  await page.context().close();
});

await check('página: o menu preso à esquerda, a coluna da direita com 240 px, e o menu recolhido leva o texto para o meio', async () => {
  // A margem do menu não cresce com a janela, e o texto fica no mesmo lugar.
  const places = [];
  for (const width of [1280, 1440, 1920]) {
    const page = await open(chapter, { width });
    const sidebar = await page.locator('#quarto-sidebar').boundingBox();
    const text = await page.locator('main p').first().boundingBox();
    places.push({ width, menu: Math.round(sidebar.x), text: Math.round(text.x) });
    await page.context().close();
  }
  assert(places.every((p) => p.menu === places[0].menu && p.text === places[0].text && p.menu < 40), `menu e texto: ${JSON.stringify(places)}`);

  // A coluna da direita, com 240 px (margin-width em _quarto.yml), medida pelo applet
  // largo: ele passa do texto 1.5rem ($margin-gap em styles/page.scss) mais a coluna.
  const page = await open(arrangements, { width: 1440 });
  const applet = page.locator('.applet.column-page-right').first();
  const geometry = async () => ({
    applet: await applet.boundingBox(),
    text: await page.locator('#mais-largo-que-o-texto p').first().boundingBox(),
    sidebar: await page.locator('#quarto-sidebar').isVisible(),
  });
  const wide = await geometry();
  const beyond = wide.applet.x + wide.applet.width - (wide.text.x + wide.text.width);
  assert(near(beyond, 24 + 240, 2) && near(wide.applet.x, wide.text.x, 2), `applet largo: ${JSON.stringify(wide.applet)}, texto: ${JSON.stringify(wide.text)}`);

  // O ícone do menu o recolhe: o texto vai para o meio.
  const toggle = page.locator('#quarto-header .quarto-reader-toggle');
  assert((await toggle.getAttribute('aria-label')) === 'Recolher o sumário', `nome do ícone: ${await toggle.getAttribute('aria-label')}`);
  // Se a página tiver rolado, o cabeçalho do Quarto pode já ter se escondido (rola-se para
  // baixo e ele sobe, e a rolagem suave acaba depois do comando): um clique em um botão fora
  // da tela espera os 30 s e falha, ao acaso. Voltar ao topo o mostra, e a conta é só de x.
  const showHeader = () => page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await showHeader();
  await toggle.click();
  await page.waitForTimeout(400);
  const collapsed = await geometry();
  const [left, right] = [collapsed.text.x, 1440 - (collapsed.text.x + collapsed.text.width)];
  assert(!collapsed.sidebar && Math.abs(left - right) < 60, `recolhido: menu ${collapsed.sidebar}, ${Math.round(left)} px à esquerda e ${Math.round(right)} px à direita`);
  assert((await page.locator('#quarto-sidebarnav-toggle:visible').count()) === 0, 'sobrou o título do capítulo no lugar do menu');
  assert((await toggle.getAttribute('aria-label')) === 'Mostrar o sumário', 'o ícone não diz que o menu volta');
  // A escolha vale depois de recarregar, sem piscar: o <html> já chega marcado.
  await page.reload();
  assert((await page.evaluate(() => document.documentElement.dataset.reader)) === 'on', 'recarregada, a página esqueceu o menu recolhido');
  await showHeader();
  await page.locator('#quarto-header .quarto-reader-toggle').click();
  await page.waitForTimeout(400);
  assert(await page.locator('#quarto-sidebar').isVisible(), 'o menu não voltou');
  await page.context().close();
});

await check('cabeçalho: o ícone do menu, o título, a lupa e o ícone de acessibilidade, a lupa e o ícone à mesma distância', async () => {
  const page = await open(chapter, { width: 1440 });
  await page.waitForTimeout(300);
  const at = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector).getBoundingClientRect();
    return {
      toggle: box('#quarto-header .quarto-reader-toggle .bi'),
      title: box('#quarto-header .navbar-title'),
      search: box('#quarto-header .aa-DetachedSearchButtonIcon svg'),
      access: box('#quarto-header .nav-link .bi-universal-access'),
      text: getComputedStyle(document.querySelector('#quarto-header .nav-link .menu-text')).clipPath,
    };
  });
  assert(at.toggle.right < at.title.left && at.title.right < at.search.left && at.search.right < at.access.left, `ordem: ${JSON.stringify(at)}`);
  const [first, second] = [at.search.left - at.title.right, at.access.left - at.search.right];
  assert(Math.abs(first - second) <= 6 && second < 40, `distâncias: título-lupa ${Math.round(first)} px, lupa-ícone ${Math.round(second)} px`);
  assert(at.text.includes('inset'), 'o texto "Acessibilidade" continua à vista');
  await page.context().close();
});

await check('cabeçalho: o leitor de tela ouve "Acessibilidade" uma vez só, no ícone de acessibilidade', async () => {
  const page = await open('index.html');
  // O nome que o leitor de tela recebe, pela árvore de acessibilidade do navegador.
  const tree = await page.locator('#quarto-header .navbar-nav').ariaSnapshot();
  assert(/button "Acessibilidade"/.test(tree) && !/Acessibilidade Acessibilidade/.test(tree), tree);
  await page.context().close();
});

await check('menu lateral, no celular: escolhida uma seção, o menu se fecha', async () => {
  const page = await open(chapter, { width: 375, height: 667, touch: true });
  await page.locator('.quarto-btn-toggle').click();
  await page.waitForTimeout(500);
  const link = page.locator('#quarto-sidebar details[open] a').nth(3);
  assert(await link.isVisible(), 'o menu aberto não mostra as seções');
  await link.click();
  await page.waitForTimeout(900);
  assert(!(await page.locator('#quarto-sidebar').evaluate((el) => el.classList.contains('show'))), 'o menu continuou cobrindo a página');
  assert((await page.evaluate(() => scrollY)) > 200, 'a página não foi até a seção');
  await page.context().close();
});

await check('dicas e soluções em abas: tudo fechado; abrir uma fecha as outras; um segundo toque recolhe', async () => {
  const page = await open(chapter);
  // O exercício com duas dicas e duas soluções: as duas dicas valem para a primeira.
  const group = page.locator('#exr-modelo-varias-abas .reveals');
  await group.scrollIntoViewIfNeeded();
  const tabs = group.locator('.reveal-tab');
  const names = await tabs.allTextContents();
  assert(names.join('|') === 'Dica|Solução 1|Solução 2', `abas: ${names.join('|')}`);
  assert((await page.locator('.reveal-panel:visible').count()) === 0, 'alguma dica ou solução já está à vista');
  const closed = await group.boundingBox();
  assert(closed.height < 50, `três partes fechadas ocupam ${Math.round(closed.height)} px, mais de uma linha`);

  // Pelo teclado. Duas dicas para a mesma solução: uma sanfona dentro da aba.
  await tabs.nth(0).focus();
  await page.keyboard.press('Enter');
  const shown = group.locator('.reveal-panel:visible');
  assert((await shown.count()) === 1 && (await tabs.nth(0).getAttribute('aria-expanded')) === 'true', 'a aba não abriu pelo teclado');
  const inner = await shown.locator('details > summary').allTextContents();
  assert(inner.join('|') === 'Dica a|Dica b', `dicas dentro da aba: ${inner.join('|')}`);
  assert(!(await shown.locator('details').first().evaluate((el) => el.open)), 'a primeira dica já veio aberta');

  await tabs.nth(1).click();
  assert((await shown.count()) === 1 && (await shown.textContent()).includes('Primeira solução'), 'abrir a solução não fechou a dica');
  assert((await tabs.nth(0).getAttribute('aria-expanded')) === 'false', 'a aba fechada continua marcada como aberta');
  await tabs.nth(1).click();
  assert((await shown.count()) === 0, 'o segundo toque não recolheu a aba');

  // Uma dica só: o texto dela aparece direto na aba.
  const single = page.locator('#exr-modelo-exercício .reveals, [id="exr-modelo-exercício"] .reveals').first();
  await single.locator('.reveal-tab').click();
  assert((await single.locator('.reveal-panel:visible details').count()) === 0, 'uma dica só virou sanfona');
  assert((await single.locator('.reveal-panel:visible').textContent()).includes('Pista que não entrega a resposta'), 'a dica não aparece');
  assert(page.problems.length === 0, page.problems[0]);
  await page.context().close();
});

await check('menos blocos: o bloco .note, com o título que o trecho pede, e o rótulo na linha do texto', async () => {
  const page = await open(chapter, { width: 1440 });
  const note = page.locator('main .note').first();
  const label = note.locator('.block-label.run-in');
  assert((await label.textContent()) === 'Erro comum.', `rótulo: ${await label.textContent()}`);
  assert(await label.evaluate((el) => el.parentElement.textContent.length > 40 && getComputedStyle(el).display === 'inline'), 'o rótulo não está na linha do texto');
  assert((await page.locator('main .note .block-label').nth(1).textContent()) === 'Observação.', 'sem título, o rótulo não é o padrão');
  await page.context().close();
});

// ---------- Interação ----------

console.log('\nInteração');

const applet = (name) => `.applet[data-applet="${name}"]`;

await check('botões com ícones: sem texto, com nome; Reiniciar e Acessibilidade logo acima do quadro, nessa ordem', async () => {
  const page = await open(chapter);
  await appletReady(page);
  for (const name of ['Animar', 'Reiniciar', 'Opções de acessibilidade']) {
    const button = page.locator('.applet').getByRole('button', { name, exact: true });
    assert((await button.count()) === 1, `${await button.count()} botões "${name}"`);
    assert((await button.textContent()).trim() === '', `o botão "${name}" tem texto à vista`);
    assert((await button.getAttribute('title')) === name, `o botão "${name}" não diz o nome ao cursor`);
    const box = await button.boundingBox();
    assert(box.width >= 24 && box.height >= 24, `o botão "${name}" tem ${box.width}x${box.height} px`);
  }
  const place = await page.evaluate(() => {
    const board = document.querySelector('.board').getBoundingClientRect();
    const tools = document.querySelector('.board-tools');
    const names = [...tools.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'));
    const box = tools.getBoundingClientRect();
    return { names, gap: board.top - box.bottom, right: Math.abs(box.right - board.right), sibling: tools.nextElementSibling?.classList.contains('board') };
  });
  assert(place.names.join('|') === 'Reiniciar|Opções de acessibilidade', `ordem: ${place.names.join(', ')}`);
  assert(place.sibling && place.gap >= 0 && place.gap < 8 && place.right < 2, `os botões não estão logo acima do quadro: ${JSON.stringify(place)}`);
  // Também num applet sem controles.
  const lab = await open(arrangements);
  const bare = lab.locator('.applet[aria-label="Exemplo: só o quadro"]');
  await appletReady(lab, '.applet[aria-label="Exemplo: só o quadro"]');
  assert((await bare.locator('.board-tools button').count()) === 2, 'um applet sem controles ficou sem os dois botões');
  await lab.context().close();
  await page.context().close();
});

await check('reiniciar em cada quadro: num applet de vários quadros, o botão de qualquer quadro reinicia todos', async () => {
  const page = await open(colors);
  await appletReady(page);
  const buttons = page.getByRole('button', { name: 'Reiniciar todos os quadros', exact: true });
  assert((await buttons.count()) === 3, `${await buttons.count()} botões para 3 quadros`);
  const away = () =>
    page.evaluate(() => {
      const { boards } = [...window.bookApplets.values()][0];
      return boards.flatMap((board) => board.handles.map((handle) => Math.abs(handle.X() - handle.start[0]) + Math.abs(handle.Y() - handle.start[1])));
    });
  await page.evaluate(() => {
    const { boards } = [...window.bookApplets.values()][0];
    boards[0].handles[1].setPositionDirectly(1, [1, 1]);
    boards[2].handles[0].setPositionDirectly(1, [3, 3]);
    boards[0].update();
    boards[2].update();
  });
  await page.waitForTimeout(150);
  assert((await away()).some((distance) => distance > 0.5), 'os pontos não mudaram antes do reinício');
  await buttons.nth(2).click();
  await page.waitForTimeout(200);
  assert((await away()).every((distance) => distance < 1e-9), 'um ponto não voltou ao início');
  assert((await page.getByRole('button', { name: 'Opções de acessibilidade', exact: true }).count()) === 3, 'falta o ícone de acessibilidade em algum quadro');
  // O botão fica fora do desenho: nada se esconde atrás dele.
  const outside = await page.evaluate(() => [...document.querySelectorAll('.board-tools')].every((tools) => !tools.closest('.board')));
  assert(outside, 'um botão ficou dentro do quadro');
  await page.context().close();
});

await check('reiniciar em cada quadro: com "tocar e destino", o botão não é tomado por um toque no plano', async () => {
  const page = await open(chapter, { prefs: { tapMove: 'on' } });
  await appletReady(page);
  const start = await handleInfo(page, 0);
  await page.mouse.click(start.left, start.top);
  assert((await page.locator('.applet-hint').textContent()).includes('escolhido'), 'não escolheu o ponto');
  await page.locator('.board-tools .applet-reset').first().click();
  await page.waitForTimeout(150);
  const after = await handleInfo(page, 0);
  assert(near(after.x, start.x) && near(after.y, start.y), `o ponto escolhido foi para (${after.x}, ${after.y}), sob o botão`);
  await page.context().close();
});

await check('números: a malha dos décimos em fração, \\tfrac, e a·u com o vetor pelo nome', async () => {
  // O applet das expressões no meio do texto, em Arranjos: as expressões estão fora do bloco.
  const page = await open(arrangements);
  await appletReady(page, '#exemplo-expressao');
  const slider = page.locator('#exemplo-expressao .control.slider input[type="range"]');
  const outside = '#exemplo-expressao + p';
  const product = () => liveText(page, 'product', outside);
  assert((await product()) === 'a\\vec{u} = \\tfrac{3}{2}\\vec{u} = \\left(3,\\,\\tfrac{3}{2}\\right)', `a·u: ${await product()}`);
  await slider.fill('1');
  await page.waitForTimeout(100);
  assert((await product()) === 'a\\vec{u} = \\vec{u} = (2,\\,1)', `com a = 1: ${await product()}`);
  await slider.fill('0');
  await page.waitForTimeout(100);
  assert((await product()).startsWith('a\\vec{u} = 0\\vec{u} = '), `com a = 0: ${await product()}`);
  await slider.fill('-0.3');
  await page.waitForTimeout(100);
  assert((await product()).startsWith('a\\vec{u} = -\\tfrac{3}{10}\\vec{u}'), `com a = -0.3: ${await product()}`);
  // O leitor de tela continua ouvindo o decimal.
  await page.waitForTimeout(450);
  assert((await page.locator('#exemplo-expressao .applet-status').textContent()).includes('a = -0.3'), 'a descrição deixou de ser decimal');
  await page.context().close();
});

// ---------- Acessibilidade, pela máquina ----------

console.log('\nAcessibilidade automática (axe-core: WCAG 2.2 A e AA)');

const axeRun = async (page) => {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const report = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] });
    return report.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')} ${v.nodes[0]?.any?.[0]?.message ?? ''}`);
  });
};

for (const [title, options] of [
  ['padrão, 1280 px', { width: 1280 }],
  ['padrão, 320 px', { width: 320, height: 640, touch: true }],
  ['todas as opções ligadas', { width: 1280, prefs: { fields: 'on', tapMove: 'on', bigTargets: 'on', describe: 'on', contrast: 'on', reduceMotion: 'on', wideSpacing: 'on', textSize: '130' } }],
]) {
  await check(`axe, ${title}: nenhuma violação`, async () => {
    const found = [];
    for (const path of pages) {
      const page = await open(path, options);
      await mountAll(page);
      const violations = await axeRun(page);
      if (violations.length) found.push(`${path}: ${violations.join(' | ')}`);
      await page.context().close();
    }
    assert(found.length === 0, found.join('\n'));
  });
}

await check('axe, painel aberto: nenhuma violação', async () => {
  const page = await open(chapter);
  await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
  const violations = await axeRun(page);
  assert(violations.length === 0, violations.join('\n'));
  await page.context().close();
});

// ---------- Fórmulas ----------

console.log('\nFórmulas');

await check('as fórmulas chegam prontas: nenhum TeX cru na página, nem KaTeX baixado sem applet', async () => {
  const page = await open(formulasPage, { height: 300 });
  assert((await page.locator('span.math').count()) === 0, 'sobrou fórmula em TeX');
  assert((await page.locator('.katex').count()) > 5, 'sem fórmulas desenhadas');
  const scripts = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name));
  assert(!scripts.some((name) => name.includes('katex.min.js')), 'KaTeX baixado sem precisar');
  await page.context().close();
});

await check('as macros do livro valem no texto e nas prévias, e os nomes nos quadros saem desenhados', async () => {
  const page = await open(formulasPage);
  const annotations = await page.locator('.katex-mathml annotation').allTextContents();
  assert(annotations.some((a) => a.includes('\\overrightarrow{AB}')), 'macro no texto');
  assert(!annotations.some((a) => a.includes('\\vet')), 'macro sem expandir');

  await page.locator('a.quarto-xref').first().scrollIntoViewIfNeeded();
  await page.locator('a.quarto-xref').first().hover();
  await page.waitForSelector('.tippy-content', { timeout: 5000 });
  await page.context().close();

  // Nenhum applet do livro usa uma macro no quadro ainda (no livro-base, a galeria dos
  // elementos): aqui, os nomes do quadro, desenhados pelo KaTeX dos applets, sem erro.
  const board = await open(chapter);
  await appletReady(board);
  assert((await board.locator('.board .katex').count()) > 0, 'nenhum nome desenhado no quadro');
  assert((await board.locator('.board .katex-error').count()) === 0, 'um nome do quadro que o KaTeX não desenhou');
  await board.context().close();
});

await check('a seta de \\vet acompanha a expressão, com a ponta menor que a do KaTeX', async () => {
  const page = await open(formulasPage);
  const measure = (selector) =>
    page.locator(selector).first().evaluate((arrow) => {
      const size = parseFloat(getComputedStyle(arrow).fontSize);
      const body = arrow.closest('.vlist').querySelector(':scope > span:first-child > .mord').getBoundingClientRect();
      const box = arrow.getBoundingClientRect();
      return { height: box.height / size, width: box.width / body.width, offset: (box.left + box.width / 2 - (body.left + body.width / 2)) / size };
    });
  // A seção da seta, em Fórmulas do laboratório (no livro-base, #vet).
  const tuned = await measure('#a-seta-de-vet tbody tr:nth-child(3) .katex-accent .hide-tail');
  const plain = await measure('#a-seta-de-vet .arrow-default .katex-accent .hide-tail');
  assert(near(plain.height, 0.522, 0.01), `a seta do KaTeX mede ${plain.height} em`);
  assert(tuned.height < 0.9 * plain.height, `a ponta não diminuiu: ${tuned.height} em`);
  assert(tuned.width > 0.8 && tuned.width < 1, `a seta tem ${Math.round(tuned.width * 100)}% da largura da expressão`);
  assert(Math.abs(tuned.offset) < 0.03, `a seta está ${tuned.offset} em fora do centro`);
  await page.context().close();

});

// ---------- Fórmulas comentadas ----------

console.log('\nFórmulas comentadas');

// Os blocos com os comentários em volta da fórmula (os de .beside têm a lista ao lado, e
// os de .legend, só os números em volta).
const annotatedReport = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.annotated:not(.beside):not(.legend)')].map((block) => {
      const formula = block.querySelector('.katex-html').getBoundingClientRect();
      const outer = block.getBoundingClientRect();
      const notes = [...block.querySelectorAll(':scope > ol > li')].map((li) => li.getBoundingClientRect());
      const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const problems = [];
      let centered = null;
      if (block.classList.contains('is-drawn')) {
        const display = block.querySelector('.katex-display');
        if (display.scrollWidth > display.clientWidth + 1) problems.push('a fórmula rola para o lado');
        notes.forEach((note, i) => {
          if (overlap(note, formula)) problems.push(`comentário ${i + 1} sobre a fórmula`);
          if (note.left < outer.left - 1 || note.right > outer.right + 1 || note.top < outer.top - 1 || note.bottom > outer.bottom + 1) problems.push(`comentário ${i + 1} fora do bloco`);
          notes.slice(i + 1).forEach((other, j) => overlap(note, other) && problems.push(`comentários ${i + 1} e ${i + j + 2} sobrepostos`));
        });
        // Uma linha por parte marcada, na cor do comentário dela.
        const parts = [...block.querySelectorAll('.katex-html [data-note]')];
        const lines = [...block.querySelectorAll('.annotated-lines path')];
        if (lines.length !== parts.length) problems.push(`${lines.length} linhas para ${parts.length} partes`);
        const arrivals = {};
        const em = parseFloat(getComputedStyle(block).fontSize);
        for (const line of lines) {
          const label = block.querySelector(`:scope > ol > li:nth-child(${line.dataset.note}) .note-label`);
          if (getComputedStyle(line).stroke !== getComputedStyle(label).backgroundColor) problems.push(`a linha ${line.dataset.note} não tem a cor do comentário`);
          // Nenhuma linha é reta: o fim fica de lado em relação ao começo, e a curva faz um S.
          const from = line.getPointAtLength(0);
          const to = line.getPointAtLength(line.getTotalLength());
          if (Math.abs(to.x - from.x) < 0.4 * em) problems.push(`a linha ${line.dataset.note} é reta`);
          (arrivals[line.dataset.note] ??= []).push(to.x);
        }
        // As linhas de um mesmo comentário chegam perto uma da outra.
        for (const [n, xs] of Object.entries(arrivals)) {
          if (Math.max(...xs) - Math.min(...xs) > 1.5 * em) problems.push(`as linhas do comentário ${n} chegam longe uma da outra`);
        }
        // Fórmula e comentários juntos, no centro (pelas letras da fórmula, não pela caixa dela).
        const range = document.createRange();
        range.selectNodeContents(block.querySelector('.katex-html'));
        const drawn = [...range.getClientRects()].filter((r) => r.width > 0);
        const left = Math.min(...drawn.map((r) => r.left), ...notes.map((n) => n.left));
        const right = Math.max(...drawn.map((r) => r.right), ...notes.map((n) => n.right));
        centered = Math.abs(left - outer.left - (outer.right - right));
      }
      return { id: block.id, drawn: block.classList.contains('is-drawn'), problems, centered, notes: notes.map((n) => ({ top: n.top, bottom: n.bottom })), formula: { top: formula.top, bottom: formula.bottom } };
    }),
  );

await check('fórmula comentada, linhas: cada comentário perto da sua parte, ligado à caixa por uma linha da mesma cor, e o conjunto no centro', async () => {
  for (const [width, prefs] of [[1440], [1024], [768], [1280, { textSize: '150' }], [1280, { wideSpacing: 'on', contrast: 'on' }]]) {
    const page = await open(annotatedPage, { width, prefs });
    await page.waitForSelector('.annotated.is-drawn');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(100);
    const blocks = await annotatedReport(page);
    const where = `${width} px${prefs ? ' ' + JSON.stringify(prefs) : ''}`;
    assert(blocks.length === 4, `${where}: ${blocks.length} blocos com linhas`);
    for (const [i, block] of blocks.entries()) {
      assert(block.problems.length === 0, `${where}, fórmula ${i + 1}: ${block.problems.join('; ')}`);
      if (block.drawn) assert(block.centered < 4, `${where}, fórmula ${i + 1}: fora do centro por ${block.centered.toFixed(1)} px`);
    }
    if (width >= 1024 && !prefs) assert(blocks.every((b) => b.drawn), `${where}: alguma fórmula ficou em lista`);
    // d(P,r): o comentário do numerador em cima, o do denominador embaixo.
    const distance = blocks.find((b) => b.id === 'comparacao-linhas');
    if (distance.drawn) {
      assert(distance.notes[0].bottom <= distance.formula.top, `${where}: o comentário do numerador não ficou em cima`);
      assert(distance.notes[1].top >= distance.formula.bottom, `${where}: o comentário do denominador não ficou embaixo`);
    }
    assert(page.problems.length === 0, page.problems[0]);
    await page.context().close();
  }
});

await check('fórmula comentada, no celular: vira a lista, com a caixa colorida e os comentários que começam pela parte; ao alargar, volta às linhas', async () => {
  const page = await open(annotatedPage, { width: 320, height: 640, touch: true });
  await page.waitForTimeout(300);
  const narrow = await page.evaluate(() => {
    const block = document.querySelector('#tres-linhas');
    const beside = document.querySelector('#comparacao-ao-lado');
    const legend = document.querySelector('#comparacao-legenda');
    const part = block.querySelector('.katex [data-note]');
    const copy = block.querySelector('ol > li .note-part');
    const label = block.querySelector('ol > li .note-label');
    return {
      drawn: block.classList.contains('is-drawn'),
      beside: beside.classList.contains('is-beside') || beside.querySelector('.annotated-lines') !== null,
      listed: legend.querySelectorAll(':scope > ol > li .note-label').length,
      background: getComputedStyle(part).backgroundColor,
      copy: copy.getBoundingClientRect().width,
      label: label.getBoundingClientRect().width,
    };
  });
  assert(!narrow.drawn, 'a 320 px, a fórmula de três comentários não virou lista');
  assert(!narrow.beside, 'a 320 px, a forma ao lado continuou ao lado da fórmula');
  assert(narrow.listed === 2, `a 320 px, a lista da legenda tem ${narrow.listed} números, e deveria ter 2`);
  assert(!/rgba\(0, 0, 0, 0\)|transparent/.test(narrow.background), `a parte não está realçada (${narrow.background})`);
  assert(narrow.copy > 20 && narrow.label > 10, 'o item da lista não mostra o número e a parte');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const wide = await annotatedReport(page);
  assert(wide.every((b) => b.drawn && b.problems.length === 0), 'a 1440 px, não voltou às linhas');
  assert(await page.evaluate(() => document.querySelector('#comparacao-legenda').classList.contains('is-labeled')), 'a 1440 px, a legenda não voltou aos números em volta da fórmula');
  await page.context().close();
});

await check('fórmula comentada, ao lado: a lista ao lado, uma linha de cada caixa até o número, e o cursor não realça nada', async () => {
  const page = await open(annotatedPage, { width: 1440 });
  await page.waitForSelector('.annotated.beside.is-beside');
  const block = page.locator('#comparacao-ao-lado');
  await block.scrollIntoViewIfNeeded();
  const look = await block.evaluate((el) => {
    const bend = (line) => {
      const total = line.getTotalLength();
      const a = line.getPointAtLength(0);
      const b = line.getPointAtLength(total);
      const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      let most = 0;
      for (let i = 1; i < 40; i++) {
        const q = line.getPointAtLength((total * i) / 40);
        most = Math.max(most, Math.abs((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x)) / length);
      }
      return most;
    };
    const parts = [...el.querySelectorAll('.katex-html [data-note]')];
    const labels = [...el.querySelectorAll(':scope > ol > li .note-label')];
    const list = el.querySelector(':scope > ol').getBoundingClientRect();
    const formula = Math.max(...parts.map((p) => p.getBoundingClientRect().right));
    const display = el.querySelector('.katex-display').getBoundingClientRect();
    const lines = [...el.querySelectorAll('.annotated-lines path')];
    // O fim de cada linha, perto do número do comentário dela.
    const origin = el.getBoundingClientRect();
    const ends = lines.map((line) => {
      const end = line.getPointAtLength(line.getTotalLength());
      const label = labels[Number(line.dataset.note) - 1].getBoundingClientRect();
      return Math.hypot(end.x + origin.left - label.left, end.y + origin.top - (label.top + label.height / 2));
    });
    return {
      beside: el.classList.contains('is-beside') && list.left > formula,
      // Nenhuma linha é reta: ela se afasta da corda entre o começo e o fim.
      straight: lines.filter((line) => bend(line) < 0.15 * parseFloat(getComputedStyle(el).fontSize)).map((line) => line.dataset.note),
      lines: lines.length,
      parts: parts.length,
      ends,
      colors: labels.map((label) => getComputedStyle(label).backgroundColor),
      strokes: lines.map((line) => getComputedStyle(line).stroke),
      // A caixa do denominador cabe na altura da fórmula, que corta o que sai dela.
      clipped: parts.some((p) => p.getBoundingClientRect().bottom > display.bottom + 0.5 || p.getBoundingClientRect().top < display.top - 0.5),
    };
  });
  assert(look.beside, 'a lista não ficou ao lado da fórmula');
  assert(look.straight.length === 0, `linhas retas: ${look.straight.join(', ')}`);
  assert(look.lines === look.parts && look.ends.every((d) => d < 8), `linhas: ${look.lines} para ${look.parts} partes; distância ao número: ${look.ends.map((d) => d.toFixed(1)).join(', ')}`);
  assert(look.colors[0] !== look.colors[1], 'os dois números têm a mesma cor');
  assert(look.strokes.every((stroke, i) => stroke === look.colors[i]), `as linhas não têm a cor do número: ${look.strokes.join(', ')}`);
  assert(!look.clipped, 'a caixa de uma parte sai da área da fórmula e é cortada');

  // O cursor não realça nada: nem o rótulo, ao passar pela caixa, nem a caixa, ao passar pelo comentário.
  const shades = () => block.evaluate((el) => [...el.querySelectorAll('.katex-html [data-note], .note-label')].map((e) => `${getComputedStyle(e).backgroundColor}|${getComputedStyle(e).boxShadow}`).join(';'));
  const resting = await shades();
  const over = async (selector) => {
    const box = await block.locator(selector).first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  };
  await over('.katex-html [data-note="2"]');
  assert((await shades()) === resting, 'o cursor sobre uma caixa mudou a aparência de algum rótulo ou caixa');
  await over('ol > li:nth-child(1)');
  assert((await shades()) === resting, 'o cursor sobre um comentário mudou a aparência de alguma caixa ou rótulo');
  // Os três outros blocos .beside da página também ficam ao lado, sem linhas que se cruzem.
  const crossings = await page.evaluate(() => {
    const bend = (line) => {
      const total = line.getTotalLength();
      const a = line.getPointAtLength(0);
      const b = line.getPointAtLength(total);
      const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      let most = 0;
      for (let i = 1; i < 40; i++) {
        const q = line.getPointAtLength((total * i) / 40);
        most = Math.max(most, Math.abs((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x)) / length);
      }
      return most;
    };
    return [...document.querySelectorAll('.annotated.beside')].map((el) => {
      const paths = [...el.querySelectorAll('.annotated-lines path')].map((line) => {
        const total = line.getTotalLength();
        return Array.from({ length: 60 }, (_, i) => line.getPointAtLength((total * i) / 59)).map(({ x, y }) => [x, y]);
      });
      const segments = paths.map((points) => points.slice(1).map((p, i) => [points[i], p]));
      const cross = ([[a, b], [c, d]], [[e, f], [g, h]]) => {
        const d1 = (g - e) * (b - f) - (h - f) * (a - e);
        const d2 = (g - e) * (d - f) - (h - f) * (c - e);
        const d3 = (c - a) * (f - b) - (d - b) * (e - a);
        const d4 = (c - a) * (h - b) - (d - b) * (g - a);
        return d1 * d2 < -1e-6 && d3 * d4 < -1e-6;
      };
      let count = 0;
      for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
          const lineI = el.querySelectorAll('.annotated-lines path')[i].dataset.note;
          const lineJ = el.querySelectorAll('.annotated-lines path')[j].dataset.note;
          if (lineI === lineJ) continue;
          for (const s of segments[i]) for (const r of segments[j]) if (cross(s, r)) count++;
        }
      }
      const straight = [...el.querySelectorAll('.annotated-lines path')].filter((line) => bend(line) < 0.15 * parseFloat(getComputedStyle(el).fontSize)).length;
      return { beside: el.classList.contains('is-beside'), count, straight };
    });
  });
  assert(crossings.every((c) => c.beside && c.count === 0 && c.straight === 0), `blocos ao lado (ao lado, cruzamentos, linhas retas): ${JSON.stringify(crossings)}`);
  await page.context().close();
});

await check('fórmula comentada, legenda: só os números em volta da fórmula, ligados às caixas por linhas, e os comentários na lista embaixo', async () => {
  for (const [width, prefs] of [[1440], [768], [1280, { textSize: '150' }]]) {
    const page = await open(annotatedPage, { width, prefs });
    const where = `${width} px${prefs ? ' ' + JSON.stringify(prefs) : ''}`;
    await page.waitForSelector('.annotated.legend.is-labeled');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(100);
    const blocks = await page.evaluate(() =>
      [...document.querySelectorAll('.annotated.legend')].map((block) => {
        const problems = [];
        const rect = (el) => el.getBoundingClientRect();
        const formula = rect(block.querySelector('.katex-html'));
        const outer = rect(block);
        const list = rect(block.querySelector(':scope > ol'));
        const em = parseFloat(getComputedStyle(block).fontSize);
        const labels = [...block.querySelectorAll(':scope > .note-label')];
        const inList = [...block.querySelectorAll(':scope > ol > li .note-label')];
        const items = block.querySelectorAll(':scope > ol > li').length;
        const parts = [...block.querySelectorAll('.katex-html [data-note]')];
        const lines = [...block.querySelectorAll('.annotated-lines path')];
        const display = block.querySelector('.katex-display');
        if (display.scrollWidth > display.clientWidth + 1) problems.push('a fórmula rola para o lado');
        if (!block.classList.contains('is-labeled')) problems.push('não ficou com os números em volta');
        if (block.classList.contains('is-drawn')) problems.push('os comentários foram para perto das partes');
        if (labels.length !== items || inList.length !== items) problems.push(`${labels.length} números em volta e ${inList.length} na lista, para ${items} comentários`);
        if (lines.length !== parts.length) problems.push(`${lines.length} linhas para ${parts.length} partes`);
        const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
        labels.forEach((label, i) => {
          const r = rect(label);
          if (label.getAttribute('aria-hidden') !== 'true') problems.push(`o número ${i + 1} em volta da fórmula não está escondido do leitor de tela`);
          if (overlap(r, formula)) problems.push(`o número ${i + 1} está sobre a fórmula`);
          if (r.left < outer.left - 1 || r.right > outer.right + 1 || r.top < outer.top - 1) problems.push(`o número ${i + 1} fora do bloco`);
          if (r.bottom > list.top) problems.push(`o número ${i + 1} desce até a lista`);
          labels.slice(i + 1).forEach((other, j) => overlap(r, rect(other)) && problems.push(`os números ${i + 1} e ${i + j + 2} sobrepostos`));
          if (getComputedStyle(label).backgroundColor !== getComputedStyle(inList[i]).backgroundColor) problems.push(`o número ${i + 1} da fórmula e o da lista têm cores diferentes`);
        });
        const arrivals = {};
        const origin = outer;
        for (const line of lines) {
          const n = Number(line.dataset.note);
          const label = rect(labels[n - 1]);
          if (getComputedStyle(line).stroke !== getComputedStyle(labels[n - 1]).backgroundColor) problems.push(`a linha ${n} não tem a cor do número`);
          const from = line.getPointAtLength(0);
          const to = line.getPointAtLength(line.getTotalLength());
          if (Math.abs(to.x - from.x) < 0.4 * em) problems.push(`a linha ${n} é reta`);
          // O fim da linha encosta no número dela, e não num vizinho.
          const x = to.x + origin.left;
          const y = to.y + origin.top;
          const miss = Math.hypot(Math.max(label.left - x, 0, x - label.right), Math.max(label.top - y, 0, y - label.bottom));
          if (miss > 6) problems.push(`a linha ${n} termina a ${miss.toFixed(1)} px do número`);
          (arrivals[n] ??= []).push(to.x);
        }
        for (const [n, xs] of Object.entries(arrivals)) {
          if (Math.max(...xs) - Math.min(...xs) > 1.5 * em) problems.push(`as linhas do número ${n} chegam longe uma da outra`);
        }
        // O comentário começa pela parte a que se refere, também na lista da legenda.
        if ([...block.querySelectorAll(':scope > ol > li .note-part')].length !== items) problems.push('um comentário da lista sem a cópia da parte');
        return { id: block.id, problems, labels: labels.map((l) => ({ top: rect(l).top, bottom: rect(l).bottom })), formula: { top: formula.top, bottom: formula.bottom } };
      }),
    );
    assert(blocks.length === 4, `${where}: ${blocks.length} blocos com legenda`);
    for (const [i, block] of blocks.entries()) assert(block.problems.length === 0, `${where}, legenda ${i + 1}: ${block.problems.join('; ')}`);
    // d(P,r): o número do numerador em cima, o do denominador embaixo.
    const distance = blocks.find((b) => b.id === 'comparacao-legenda');
    assert(distance.labels[0].bottom <= distance.formula.top, `${where}: o número do numerador não ficou em cima`);
    assert(distance.labels[1].top >= distance.formula.bottom, `${where}: o número do denominador não ficou embaixo`);
    assert(page.problems.length === 0, page.problems[0]);
    await page.context().close();
  }
});

await check('fórmula comentada: com as linhas, ao lado ou a legenda, a fórmula nunca rola para o lado (o axe acusa uma região que rola sem nada a focar)', async () => {
  for (const width of [320, 340, 360, 375, 414, 480, 600]) {
    const page = await open(annotatedPage, { width, height: 800 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const rolling = await page.evaluate(() =>
      [...document.querySelectorAll('.annotated.is-drawn, .annotated.is-beside, .annotated.is-labeled')]
        .filter((block) => {
          const display = block.querySelector('.katex-display');
          return display.scrollWidth > display.clientWidth + 1;
        })
        .map((block) => `${block.id || block.className}`),
    );
    assert(rolling.length === 0, `${width} px: a fórmula rola em ${rolling.join('; ')}`);
    await page.context().close();
  }
});

await check('fórmula comentada: o leitor de tela lê cada comentário com a sua parte, também com as linhas', async () => {
  const page = await open(annotatedPage, { width: 1440 });
  await page.waitForSelector('.annotated.is-drawn');
  const items = await page.evaluate(() =>
    [...document.querySelectorAll('.annotated > ol > li')].map((li) => {
      const copy = li.querySelector('.note-part');
      return { math: copy?.querySelector('.katex-mathml math') !== null, display: copy && getComputedStyle(copy).display, hidden: li.closest('[aria-hidden="true"]') !== null };
    }),
  );
  assert(items.length === 27, `${items.length} comentários na página`);
  assert(items.every((i) => i.math && i.display !== 'none' && !i.hidden), 'um comentário sem a sua parte para o leitor de tela');
  await page.context().close();
});

await check('só a página com fórmula comentada baixa o script das linhas', async () => {
  const loaded = async (path) => {
    const page = await open(path, { height: 300 });
    await page.waitForTimeout(200);
    const names = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name));
    await page.context().close();
    return names.some((name) => name.endsWith('/annotations.js'));
  };
  assert(!(await loaded(chapter)), 'baixado numa página sem fórmula comentada');
  assert(await loaded(annotatedPage), 'não baixado onde é preciso');
});

// ---------- Sem JavaScript ----------

console.log('\nSem JavaScript');

await check('sem JavaScript, o texto se lê e o applet avisa', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${base}/${chapter}`);
  assert((await page.locator('h1').first().textContent()).includes('Título do Capítulo'), 'sem título');
  assert((await page.locator('.applet noscript').count()) === 1, 'o applet não avisa');
  assert((await page.locator('.katex').count()) > 0, 'as fórmulas dependem de JavaScript');
  // Sem JavaScript nada se abre: dicas e soluções ficam à vista, cada uma com o nome.
  const panel = page.locator('.reveal-panel').first();
  assert(await panel.isVisible(), 'sem JavaScript, a dica não aparece');
  assert((await panel.evaluate((el) => getComputedStyle(el, '::before').content)) === '"Dica"', 'a dica à vista não diz o que é');
  assert(!(await page.locator('.reveal-tab').first().isVisible()), 'botões que não funcionam continuam à vista');
  // O menu lateral mostra as seções do capítulo aberto.
  assert(await page.locator('#quarto-sidebar details[open] a').first().isVisible(), 'sem JavaScript, o menu não mostra as seções');
  // Uma expressão que o applet escreveria mostra reticências, e não o nome dela no código.
  await page.goto(`${base}/${arrangements}`);
  const unwritten = await page.locator('.live').allTextContents();
  assert(unwritten.length > 0 && unwritten.every((text) => text.trim() === '…'), `expressões sem JavaScript: ${unwritten.join(' | ')}`);
  await page.goto(`${base}/${annotatedPage}`);
  assert((await page.locator('.annotated.is-drawn, .annotated.is-labeled, .annotated.is-beside').count()) === 0, 'fórmula comentada desenhada sem JavaScript');
  assert((await page.locator('.annotated > .note-label').count()) === 0, 'rótulos em volta da fórmula sem JavaScript');
  assert((await page.locator('.annotated > ol > li .note-part:has(.katex)').count()) === 27, 'a lista de comentários não mostra as partes');
  await context.close();
});

// ---------- Capturas de tela, para olhar ----------

await check('capturas de tela', async () => {
  const shots = [
    [chapter, 'modelo-capitulo-completo', {}],
    [arrangements, 'arranjos', {}],
    ['laboratorio/teste-controles.html', 'teste-controles', {}],
    [colors, 'teste-cores', {}],
    [formulasPage, 'formulas', {}],
    [annotatedPage, 'formulas-comentadas', {}],
    ['index.html', 'apresentacao', {}],
    [chapter, 'modelo-capitulo-completo-alternativas', { prefs: { fields: 'on', tapMove: 'on', describe: 'on', bigTargets: 'on' } }],
  ];
  for (const [path, name, options] of shots) {
    for (const width of [320, 768, 1440]) {
      const page = await open(path, { ...options, width, height: width < 500 ? 640 : 900, touch: width < 500 });
      await mountAll(page);
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(output, `${name}-${width}.png`), fullPage: true });
      await page.context().close();
    }
  }
  for (const width of [320, 1280]) {
    const page = await open(chapter, { width, height: width < 500 ? 640 : 800, touch: width < 500 });
    await page.locator('#quarto-header a[href$="acessibilidade.html"]').first().click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: join(output, `painel-${width}.png`) });
    await page.context().close();
  }
});

await browser.close();
server.close();

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length} de ${results.length} verificações passaram.`);
process.exit(failed.length ? 1 : 0);
