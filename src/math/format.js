// Como os applets escrevem números, pontos e ângulos, num só lugar e em duas saídas:
//   tex.*   TeX, desenhado pelo KaTeX (expressões, nomes, labels dos controles)
//   text.*  texto simples, para o status lido pelo leitor de tela e para os campos
// Um valor indefinido (NaN, infinito) fica à vista, em vez de virar 0: é o sinal de
// que o applet não decidiu um caso especial.

import { recognize, root } from './exact.js';

// As convenções do livro, num lugar só.
//   decimal, separator  ponto decimal (decisão D9 do livro-base, de 2026-11-10).
//                       Trocar pela norma brasileira é decimal: { tex: '{,}', text: ',' } e
//                       separator: { tex: ';\\,', text: '; ' }.
//   fractions           'tenths': em TeX, um número da malha dos décimos que não é
//                       inteiro sai como fração, \tfrac{3}{2} e não 1.5, e um valor
//                       exato reconhecido (tex.exact) sai sempre como fração (pedido de
//                       2026-11-12). 'none': tudo o que é decimal exato sai em decimal,
//                       1.5 e 0.25, e só 1/3 e as raízes ficam em fração. O texto lido
//                       pelo leitor de tela e os campos continuam em decimal.
//   fraction            \tfrac: a fração do tamanho do texto, também numa expressão em
//                       destaque (pedido de 2026-11-12).
export const notation = {
  decimal: { tex: '.', text: '.' },
  separator: { tex: ',\\,', text: ', ' },
  fractions: 'tenths',
  fraction: '\\tfrac',
};

// x é um múltiplo de 1/10 (a menos do erro de arredondamento da máquina): 1.5, -0.3.
const isTenth = (x) => Math.abs(x * 10 - Math.round(x * 10)) < 1e-9 * Math.max(1, Math.abs(x * 10));

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const coordsOf = (p) => (typeof p?.X === 'function' ? [p.X(), p.Y()] : p);
const isUsable = (v) => Number.isFinite(v) && Math.abs(v) < 1e6;

// ---- Números que mudam depressa ----

// Numa animação, um número que muda de largura a cada frame faz a expressão tremer:
// "1.5" vira "1.47", o sinal aparece e some. Enquanto alguma animação roda
// (src/applet/state.js liga e desliga), tex.number escreve sempre as mesmas casas
// decimais e guarda o lugar do sinal: "\phantom{-}1.50" tem a largura de "-1.50".
let steadyCount = 0;

export function holdSteady(on) {
  steadyCount = Math.max(0, steadyCount + (on ? 1 : -1));
}

// Denominadores dos ângulos escritos como frações de pi (múltiplos de 15° incluídos).
const piDenominators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12];

function exactPi(radians) {
  for (const d of piDenominators) {
    const n = Math.round((radians / Math.PI) * d);
    if (Math.abs(radians / Math.PI - n / d) < 1e-9) return { n, d };
  }
  return null;
}

function reduced(x, denominator) {
  const n = Math.round(x * denominator);
  const divisor = gcd(Math.abs(n), denominator) || 1;
  return { n: n / divisor, d: denominator / divisor };
}

function makeFormat(output) {
  const isTex = output === 'tex';
  const pi = isTex ? '\\pi' : 'π';
  const approx = isTex ? '\\approx' : '≈';
  const over = (top, bottom) => (isTex ? `${notation.fraction}{${top}}{${bottom}}` : `${top}/${bottom}`);
  // Frações no lugar dos decimais exatos: só em TeX, e não durante uma animação, em que
  // os números precisam manter a largura.
  const usesFractions = () => isTex && notation.fractions === 'tenths' && steadyCount === 0;

  // O valor absoluto, arredondado. Com `fixed`, as casas decimais não somem: 1.50. Um
  // número da malha dos décimos que não é inteiro vira fração: 1.5 é \tfrac{3}{2}.
  function unsigned(value, digits, fixed) {
    const size = Math.abs(value);
    if (digits >= 1 && usesFractions() && isTenth(size) && !Number.isInteger(Math.round(size * 10) / 10)) {
      const { n, d } = reduced(size, 10);
      return over(n, d);
    }
    const rounded = Math.abs(Number(value.toFixed(digits))) || 0;
    return (fixed ? rounded.toFixed(digits) : String(rounded)).replace('.', notation.decimal[output]);
  }

  function number(x, digits = 2) {
    const value = Number(x);
    if (!Number.isFinite(value)) return String(value);
    const isNegative = Number(value.toFixed(digits)) < 0;
    if (isTex && steadyCount > 0) return (isNegative ? '-' : '\\phantom{-}') + unsigned(value, digits, true);
    return (isNegative ? '-' : '') + unsigned(value, digits, false);
  }

  function piFraction({ n, d }) {
    if (n === 0) return '0';
    const sign = n < 0 ? '-' : '';
    const factor = Math.abs(n) === 1 ? '' : Math.abs(n);
    return d === 1 ? `${sign}${factor}${pi}` : `${sign}${over(`${factor}${pi}`, d)}`;
  }

  // (n/d)·√r ou (n/d)·π, como se escreve à mão: 2\sqrt{2}, \tfrac{\sqrt{13}}{2}. Uma
  // fração sai como fração (3/2, 1/4); com fractions: 'none', a que é um decimal exato
  // com `digits` casas sai decimal (1.5, 0.25), e 1/3 continua fração.
  function exactForm({ n, d, r = 1, pi: isPi = false }, digits) {
    if (isPi) return piFraction({ n, d });
    if (n === 0) return '0';
    const sign = n < 0 ? '-' : '';
    const size = Math.abs(n);
    if (r === 1) {
      if (d === 1) return number(n, digits);
      const value = size / d;
      const isDecimal = Math.abs(value - Number(value.toFixed(digits))) < 1e-12;
      return isDecimal && !usesFractions() ? number(n / d, digits) : `${sign}${over(size, d)}`;
    }
    const symbol = isTex ? `\\sqrt{${r}}` : `raiz de ${r}`;
    const top = size === 1 ? symbol : isTex ? `${size}${symbol}` : `${size} ${symbol}`;
    if (d === 1) return sign + top;
    return sign + (isTex ? over(top, d) : `${top} sobre ${d}`);
  }

  const sqrt = (x, digits = 2) => {
    const found = root(x);
    return found ? exactForm(found, digits) : number(Math.sqrt(x), digits);
  };

  const exact = (v, digits = 2) => {
    const found = recognize(v);
    return found ? exactForm(found, digits) : number(v, digits);
  };

  // Entra em radianos; sai em graus ou numa fração notável de pi.
  function angle(radians, unit = 'deg', digits = unit === 'deg' ? 0 : 2) {
    if (unit === 'deg') return `${number((radians * 180) / Math.PI, digits)}${isTex ? '^\\circ' : '°'}`;
    const found = Number.isFinite(radians) && exactPi(radians);
    return found ? piFraction(found) : number(radians, digits);
  }

  // O ângulo é exatamente o que se escreve dele?
  function isExactAngle(radians, unit, digits) {
    if (!Number.isFinite(radians)) return false;
    if (unit !== 'deg') return Boolean(exactPi(radians));
    const degrees = (radians * 180) / Math.PI;
    return Math.abs(degrees - Number(degrees.toFixed(digits))) < 1e-9;
  }

  return {
    number,

    fraction(x, denominator = 100) {
      if (!Number.isFinite(x)) return number(x);
      const { n, d } = reduced(x, denominator);
      return d === 1 ? String(n) : `${n < 0 ? '-' : ''}${over(Math.abs(n), d)}`;
    },

    // v arredondado ao múltiplo mais próximo de pi/denominator (marcas de um eixo, por exemplo).
    piMultiple: (v, denominator = 2) => (Number.isFinite(v) ? piFraction(reduced(v / Math.PI, denominator)) : number(v)),

    angle,

    // O mesmo, com o sinal que diz a verdade: "= 30°" e "= \tfrac{\pi}{6}" quando o
    // ângulo é exatamente isso; "\approx" quando foi arredondado.
    equalsAngle: (radians, unit = 'deg', digits = unit === 'deg' ? 0 : 2) =>
      `${isExactAngle(radians, unit, digits) ? '=' : approx} ${angle(radians, unit, digits)}`,

    // Com uma fração dentro, os parênteses crescem com ela: \left( \tfrac{1}{2}, 3 \right).
    point: (p, digits = 2) => {
      const inside = coordsOf(p).map((c) => number(c, digits)).join(notation.separator[output]);
      return isTex && inside.includes('frac') ? `\\left(${inside}\\right)` : `(${inside})`;
    },

    // O número, ou a afirmação de que ele não existe.
    finite: (v, digits = 2, missing = isTex ? '\\nexists' : 'não existe') => (isUsable(v) ? number(v, digits) : missing),

    // ---- Valores exatos (src/math/exact.js) ----

    // A raiz quadrada de x. Exata quando x é uma fração simples: \sqrt{2},
    // \tfrac{\sqrt{13}}{2}, 5. Senão, o decimal. É o método a preferir: o applet passa a
    // conta de dentro da raiz, e nada é adivinhado.
    sqrt,

    // O valor v, reconhecido como fração, raiz ou múltiplo de pi; senão, o decimal.
    // Para quando o applet só tem o resultado.
    exact,

    // Os mesmos, com o sinal que diz a verdade: "= \sqrt{2}" ou "\approx 1.41".
    equalsSqrt: (x, digits = 2) => `${root(x) ? '=' : approx} ${sqrt(x, digits)}`,
    equalsExact: (v, digits = 2) => `${recognize(v) ? '=' : approx} ${exact(v, digits)}`,

    // Para as expressões em que o sinal é escrito à parte (makeExpr).
    unsigned: (x, digits = 2) => unsigned(Number(x), digits, isTex && steadyCount > 0),
  };
}

export const tex = makeFormat('tex');
export const text = makeFormat('text');

// Lê o que o leitor digita: 1.5, 1,5, -2 (também com o sinal de menos tipográfico),
// 3/2, pi/4, π/6, 2π/3 e 36° (o símbolo do grau é ignorado). null se não é um número.
export function parseNumber(typed) {
  const clean = String(typed)
    .trim()
    .replace(/\s+/g, '')
    .replace(/[−–]/g, '-')
    .replace(/°/g, '')
    .replace(/pi/gi, 'π')
    .replace(',', '.');
  const match = /^([+-]?)(\d*\.?\d*)(π?)(?:\/(\d*\.?\d+))?$/.exec(clean);
  if (!match) return null;
  const [, sign, digits, pi, denominator] = match;
  if (digits === '' && pi === '') return null;
  let value = digits === '' ? 1 : Number(digits);
  if (!Number.isFinite(value)) return null;
  if (pi) value *= Math.PI;
  if (denominator !== undefined) {
    const d = Number(denominator);
    if (!d) return null;
    value /= d;
  }
  return sign === '-' ? -value : value;
}

// Um caption ou um nome em TeX, lido em voz alta: "mostrar $\vec{u}$" -> "mostrar u".
export const plain = (caption) =>
  String(caption)
    .replace(/\\(?:vec|vet|overrightarrow|overline|mathbf)\{([^}]*)\}/g, '$1')
    .replace(/\\[,;:! ]/g, ' ')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[${}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Texto que depende do caso: cases([[condição, saída], ...], padrão) -> função.
export const cases = (list, fallback = '') => () => {
  const value = (x) => (typeof x === 'function' ? x() : x);
  for (const [condition, output] of list) if (value(condition)) return value(output);
  return value(fallback);
};

// Expressões em que os termos nulos somem: "x - 2t = 0", e não "1x + (-2)t + 0 = 0".
// Um termo é um número (escrito; some quando é cerca de 0), um texto (um símbolo,
// sempre escrito) ou o resultado de outra função daqui (null quando sumiu).
export function makeExpr({ digits = 2, tolerance = 0.5 * 10 ** -digits } = {}) {
  const isNull = (v) => Math.abs(v) < tolerance;
  // Durante uma animação, o fator 1 continua escrito e o sinal guarda lugar: a
  // expressão não muda de largura a cada valor.
  const isSteady = () => steadyCount > 0;

  const node = (term) => {
    if (term === null || term === undefined) return null;
    if (typeof term === 'number') {
      if (!Number.isFinite(term)) return { tex: '\\text{NaN}', negative: false, atom: true };
      if (isNull(term)) return null;
      const written = tex.unsigned(term, digits);
      // Uma fração é um átomo num produto (\tfrac{3}{2}\vec{u}), mas não numa potência.
      return { tex: written, negative: term < 0, atom: true, fraction: written.includes('frac'), one: !isSteady() && Math.abs(Math.abs(term) - 1) < tolerance };
    }
    return typeof term === 'string' ? { tex: term, negative: false, atom: true } : term;
  };

  const symbol = (name, value) => (Number.isFinite(value) && isNull(value) ? null : node(name));

  const negate = (term) => {
    const n = node(term);
    return n && { ...n, negative: !n.negative };
  };

  // O fator 1 não se escreve: 1·u é u.
  function times(...factors) {
    const nodes = factors.map(node);
    if (nodes.includes(null)) return null;
    const parts = nodes.filter((n, _, all) => !(n.one && all.length > 1)).map((n) => (n.atom ? n.tex : `(${n.tex})`));
    return { tex: parts.join(''), negative: nodes.reduce((sign, n) => sign !== n.negative, false), atom: false };
  }

  function sum(...terms) {
    const nodes = terms.map(node).filter(Boolean);
    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0];
    const written = nodes.map((n, i) => (i === 0 ? (n.negative ? '-' : '') : n.negative ? ' - ' : ' + ') + n.tex).join('');
    return { tex: written, negative: false, atom: false };
  }

  // (\tfrac{1}{2})^{2}, (-3)^{2}: os parênteses se ajustam à fração.
  function power(base, exponent) {
    const b = node(base);
    if (b === null) return null;
    const inside = `${b.negative ? '-' : ''}${b.tex}`;
    const written = b.atom && !b.negative && !b.fraction ? b.tex : b.fraction ? `\\left(${inside}\\right)` : `(${inside})`;
    return { tex: `${written}^{${exponent}}`, negative: false, atom: false };
  }

  function fraction(top, bottom) {
    const [p, q] = [node(top), node(bottom)];
    if (p === null || q === null) return null;
    return { tex: `${notation.fraction}{${p.tex}}{${q.tex}}`, negative: p.negative !== q.negative, atom: true, fraction: true };
  }

  const write = (term) => {
    const n = node(term);
    return n === null ? '0' : (n.negative ? '-' : isSteady() ? '\\phantom{-}' : '') + n.tex;
  };

  const equals = (a, b) => `${write(a)} = ${write(b)}`;

  // "=" quando os números escritos são exatos com essa precisão; senão, "\approx".
  const relation = (...values) => (values.every((v) => Math.abs(v - Number(v.toFixed(digits))) < 1e-9) ? '=' : '\\approx');

  return { symbol, negate, times, sum, power, fraction, write, equals, relation };
}

export const expr = makeExpr();
