// Encontra os applets da página e monta cada um quando ele se aproxima da tela: um
// capítulo longo só baixa o JSXGraph se o leitor chegar a um applet. Cada applet é um
// arquivo de applets/, carregado pelo nome: para criar um, basta o arquivo novo.

import { addStylesheet, loadTex } from './tex.js';

// Preferências que mudam o desenho ou o manejo dos boards: os applets são
// remontados, com o que o leitor já fez.
const remountOn = new Set(['tapMove', 'fields', 'bigTargets', 'contrast', 'reduceMotion', 'textSize']);

const mounted = new Map();
window.bookApplets = mounted; // Para o console e os testes.

// Os módulos pedem uns aos outros um nível de cada vez; um modulepreload de todos de
// uma vez poupa várias idas e vindas numa conexão lenta. Um nome que falte aqui só
// custa essa espera.
const modules = [
  './applet.js', './board.js', './theme.js', './state.js', './controls.js', './icons.js', './access.js',
  '../elements/index.js', '../elements/common.js', '../elements/handle.js', '../elements/vector.js', '../elements/marks.js',
  '../math/format.js', '../math/exact.js', '../math/vec.js',
  '../../vendor/jsxgraph/jsxgraphcore.mjs',
];

let libraries = null;

function loadLibraries() {
  libraries ??= (async () => {
    for (const module of modules) {
      document.head.append(Object.assign(document.createElement('link'), { rel: 'modulepreload', href: new URL(module, import.meta.url).href }));
    }
    addStylesheet(new URL('../../vendor/jsxgraph/jsxgraph.css', import.meta.url).href);
    const [{ default: JXG }, macros, { registerElements }] = await Promise.all([
      import('../../vendor/jsxgraph/jsxgraphcore.mjs'),
      loadTex(),
      import('../elements/index.js'),
    ]);
    JXG.Options.text.katexMacros = macros;
    return { JXG, customElements: registerElements(JXG) };
  })();
  return libraries;
}

// Uma expressão fora de qualquer bloco pertence ao applet que `of` nomeia ou, sem
// ele, ao applet mais próximo antes dela na página.
function assignOutsideExpressions() {
  let previous = null;
  for (const element of document.querySelectorAll('.applet[data-applet], .live')) {
    if (element.matches('.applet')) {
      previous = element;
    } else if (!element.closest('.applet')) {
      const owner = document.getElementById(element.dataset.of) ?? previous;
      if (owner) (owner.outsideLive ??= []).push(element);
    }
  }
}

function showFailure(block, error) {
  console.error(`[applet] ${block.dataset.applet}:`, error);
  const message = document.createElement('p');
  message.className = 'applet-failure';
  message.textContent = 'Não foi possível carregar este applet. Recarregue a página para tentar de novo.';
  block.append(message);
}

async function mount(block, saved) {
  const librariesReady = loadLibraries();
  const [{ createApplet }, { JXG, customElements }, { default: build }] = await Promise.all([
    import('./applet.js'),
    librariesReady,
    import(new URL(`../../applets/${block.dataset.applet}.js`, import.meta.url).href),
  ]);
  const applet = createApplet(block, JXG, customElements);
  await build(applet.api);
  applet.finish();
  if (saved) applet.restore(saved);
  mounted.set(block, applet);
  block.dispatchEvent(new CustomEvent('applet-ready', { bubbles: true }));
}

export function startApplets() {
  assignOutsideExpressions();

  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      mount(target).catch((error) => showFailure(target, error));
    }
  }, { rootMargin: '50% 0px' });

  document.querySelectorAll('.applet[data-applet]').forEach((block) => observer.observe(block));

  document.addEventListener('prefs-change', ({ detail: { key } }) => {
    if (!remountOn.has(key)) return;
    for (const [block, applet] of mounted) {
      const saved = applet.snapshot();
      applet.destroy();
      mounted.delete(block);
      mount(block, saved).catch((error) => showFailure(block, error));
    }
  });
}
