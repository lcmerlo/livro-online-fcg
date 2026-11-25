// O KaTeX dos applets: só entra na página quando um applet precisa, com as mesmas
// macros do texto. O JSXGraph o encontra como o global `katex`.

let macros = {};
const here = (path) => new URL(path, import.meta.url).href;

export function addStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    document.head.append(Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject }));
  });
}

export async function loadTex() {
  addStylesheet(here('../../vendor/katex/katex.min.css'));
  const [macroList] = await Promise.all([
    fetch(here('../../math/macros.json')).then((response) => response.json()),
    // Um capítulo com fórmulas já o carregou quando este módulo roda.
    window.katex ?? loadScript(here('../../vendor/katex/katex.min.js')),
  ]);
  macros = macroList;
  return macros;
}

// Desenha TeX num elemento. O que o KaTeX não lê aparece como texto, com um aviso no console.
export function drawTex(element, code, options = {}) {
  try {
    window.katex.render(code, element, { macros, throwOnError: true, ...options });
  } catch (error) {
    console.warn('[applet] KaTeX:', error?.message ?? error);
    element.textContent = code;
  }
}

// Um caption: texto à vista com fórmulas entre $...$, desenhadas pelo KaTeX: "ponta de
// $\vec{u}$". Quem chama dá ao controle o nome lido, em texto (format.js: plain).
export function writeCaption(target, caption) {
  caption.split(/\$([^$]+)\$/).forEach((piece, i) => {
    if (i % 2 === 0) return target.append(piece);
    const formula = document.createElement('span');
    drawTex(formula, piece);
    target.append(formula);
  });
}

// ---- Expressões que mudam sem pular (pedido de 2026-11-12) ----

// A altura (acima da linha de base) e a profundidade, em em, com que toda expressão
// que muda começa: no meio de uma frase, as de \tfrac{\sqrt{2}}{2}; numa expressão em
// destaque, a altura de \sqrt{\left(\tfrac{1}{2}\right)^{2}} e a profundidade de
// \left(\tfrac{\sqrt{2}}{2}\right). Medidas no KaTeX do site. A linha não cresce
// quando um número passa de 2 a \tfrac{3}{2}, nem quando uma raiz passa a ter frações.
const starting = { inline: { height: 1.038, depth: 0.345 }, display: { height: 1.39, depth: 0.65 } };

// A maior altura e a maior profundidade que a expressão já teve em cada lugar.
const reached = new WeakMap();

// Desenha uma expressão que muda, com um \rule invisível (de largura zero) da maior
// altura que ela já teve neste lugar: a caixa só cresce, e o texto em volta não sobe
// e desce enquanto o leitor mexe. Vale para as expressões no texto ([nome]{.live}) e
// para o valor ao lado de um slider.
export function drawSteady(element, code, options = {}) {
  const seen = reached.get(element) ?? { ...starting[options.displayMode ? 'display' : 'inline'] };
  const em = (value) => `${value.toFixed(3)}em`;
  const rule = `\\rule[${em(-seen.depth)}]{0em}{${em(seen.height + seen.depth)}}`;
  drawTex(element, code + rule, options);
  // O KaTeX mede cada pedaço num .katex-strut próprio (.strut até o KaTeX 0.17): altura
  // total e profundidade.
  for (const piece of element.querySelectorAll('.katex-html .katex-strut')) {
    const total = parseFloat(piece.style.height) || 0;
    const depth = -parseFloat(piece.style.verticalAlign) || 0;
    seen.height = Math.max(seen.height, total - depth);
    seen.depth = Math.max(seen.depth, depth);
  }
  reached.set(element, seen);
}
