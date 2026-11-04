// applets-src/src/tools/formatar.js
//
// Como os applets escrevem números, pontos, ângulos e expressões: num só
// lugar (diretrizes-tecnicas.md, §5). Duas saídas:
//   tex.*    TeX, para fórmulas desenhadas pelo MathJax (leituras, rótulos);
//   texto.*  texto simples, para o parágrafo de estado, lido pelo leitor de tela.
//   import { numero, tex, texto, casos, expressao } from "../tools/formatar.js";
//   texto.ponto(A)              → "(2.5, 3)"
//   tex.angulo(Math.PI / 4)     → "45^\circ"
//
// Convenção provisória do livro: ponto decimal e vírgula entre coordenadas,
// como (2.5, 3). Se ela mudar (pendencias.md, §2), muda aqui.
//
// Adaptado de lib/fmt.js do JSX-quarto, com duas diferenças:
//   - um valor não definido (NaN, infinito) nunca vira 0 nem some de uma
//     expressão; aparece como "NaN", sinal de que o applet não decidiu o caso
//     especial (use finito ou casos);
//   - um ângulo em radianos só vira fração de π quando é exatamente (p/q)·π
//     com q de 1 a 9 ou 12 (π/6, 2π/7, 11π/6, 5π/12…); os outros saem em
//     decimal. A lib arredondava para centésimos de π e escrevia π/6 como
//     17π/100.
// Unidades: os ângulos chegam em radianos; graus só na saída.

const mdc = (a, b) => (b ? mdc(b, a % b) : a);

// Número com até `casas` decimais, sem zeros à direita; −0 vira 0. Serve
// para o TeX e para o texto.
export function numero(x, casas = 2) {
  const valor = Number(x);

  if (!Number.isFinite(valor)) {
    return String(valor);
  }

  return String(Number(valor.toFixed(casas)) || 0);
}

// Coordenadas de um ponto do JSXGraph ou de uma lista de números.
const coordenadas = (p) => (typeof p?.X === "function" ? [p.X(), p.Y()] : p);

// x arredondado a 1/den, como fração irredutível n/d (d > 0).
function fracaoDe(x, den) {
  const n = Math.round(x * den);
  const m = mdc(Math.abs(n), den) || 1;
  return { n: n / m, d: den / m };
}

// (n/d)·π escrito em TeX ou em texto; o fator 1 não aparece.
function escreverPi({ n, d }, emTex) {
  if (n === 0) return "0";
  const sinal = n < 0 ? "-" : "";
  const fator = Math.abs(n) === 1 ? "" : String(Math.abs(n));
  if (d === 1) return `${sinal}${fator}${emTex ? "\\pi" : "π"}`;
  return emTex ? `${sinal}\\frac{${fator}\\pi}{${d}}` : `${sinal}${fator}π/${d}`;
}

// Denominadores dos ângulos escritos como fração de π: os ângulos
// 2kπ + (m/n)·π com k inteiro, n de 1 a 9 ou 12 e 0 ≤ m < 2n (decisoes.md,
// 2026-11-04). O 12 dá os múltiplos de 15° (π/12, 5π/12…).
const DENOMINADORES_PI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12];

// rad = (n/d)·π exatamente, com d em DENOMINADORES_PI; senão null. A lista é
// crescente e contém os divisores de cada denominador, então o primeiro d que
// serve é o menor, e a fração já sai irredutível.
function piExato(rad) {
  for (const d of DENOMINADORES_PI) {
    const n = Math.round((rad / Math.PI) * d);
    if (Math.abs(rad / Math.PI - n / d) < 1e-9) return { n, d };
  }
  return null;
}

// Valor finito e não enorme (um valor enorme também engana).
const ehFinito = (v) => Number.isFinite(v) && Math.abs(v) < 1e6;

// ---------- TeX ----------

export const tex = {
  numero,

  // Fração irredutível de x arredondado a 1/den: 0.5 → \frac{1}{2}.
  fracao(x, den = 100) {
    if (!Number.isFinite(x)) return numero(x);
    const { n, d } = fracaoDe(x, den);
    return d === 1 ? String(n) : `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
  },

  // v arredondado ao múltiplo de π/den mais próximo (marcas de um eixo, por
  // exemplo): π/2 → \frac{\pi}{2}, −3π/2 → -\frac{3\pi}{2}.
  multiploDePi(v, den = 2) {
    return Number.isFinite(v) ? escreverPi(fracaoDe(v / Math.PI, den), true) : numero(v);
  },

  // Ângulo dado em radianos, escrito em graus (30^\circ) ou em radianos: fração
  // de π se o denominador for de 1 a 9 ou 12 (\frac{\pi}{6}), senão decimal
  // (0.52).
  angulo(rad, unidade = "graus", casas = unidade === "graus" ? 0 : 2) {
    if (unidade === "graus") return `${numero((rad * 180) / Math.PI, casas)}^\\circ`;
    const q = Number.isFinite(rad) && piExato(rad);
    return q ? escreverPi(q, true) : numero(rad, casas);
  },

  // Ponto: (1,\,2) ou (1,\,2,\,3).
  ponto(p, casas = 2) {
    return `(${coordenadas(p).map((c) => numero(c, casas)).join(",\\,")})`;
  },

  // O número, ou \nexists quando ele não existe (infinito, indefinido ou enorme).
  finito(v, casas = 2) {
    return ehFinito(v) ? numero(v, casas) : "\\nexists";
  },
};

// ---------- texto simples ----------

export const texto = {
  numero,

  // 0.5 → "1/2".
  fracao(x, den = 100) {
    if (!Number.isFinite(x)) return numero(x);
    const { n, d } = fracaoDe(x, den);
    return d === 1 ? String(n) : `${n}/${d}`;
  },

  // v arredondado ao múltiplo de π/den mais próximo: "π/2", "-3π/2".
  multiploDePi(v, den = 2) {
    return Number.isFinite(v) ? escreverPi(fracaoDe(v / Math.PI, den), false) : numero(v);
  },

  // Ângulo dado em radianos: "30°", ou em radianos "π/6" (denominador de 1 a 9
  // ou 12) ou "0.52".
  angulo(rad, unidade = "graus", casas = unidade === "graus" ? 0 : 2) {
    if (unidade === "graus") return `${numero((rad * 180) / Math.PI, casas)}°`;
    const q = Number.isFinite(rad) && piExato(rad);
    return q ? escreverPi(q, false) : numero(rad, casas);
  },

  // Ponto: "(1, 2)".
  ponto(p, casas = 2) {
    return `(${coordenadas(p).map((c) => numero(c, casas)).join(", ")})`;
  },

  // O número, ou `indefinido` quando ele não existe.
  finito(v, casas = 2, indefinido = "não existe") {
    return ehFinito(v) ? numero(v, casas) : indefinido;
  },
};

// ---------- casos ----------

// Texto que muda conforme o caso: casos([[condição, saída], …], padrão) → função.
// Condição e saída podem ser valores ou funções; vale o primeiro caso verdadeiro.
//   const leitura = casos([[() => !Number.isFinite(a), "u e v são paralelos"]], () => `a = ${numero(a)}`);
export const casos = (lista, padrao = "") => () => {
  const valor = (x) => (typeof x === "function" ? x() : x);

  for (const [condicao, saida] of lista) {
    if (valor(condicao)) return valor(saida);
  }

  return valor(padrao);
};

// ---------- expressões em TeX ----------

// Expressões em que termos nulos somem: "x - 2t = 0", e não "1x + (-2)t + 0 = 0".
// Cada termo é um número (mostra o valor e some se for ≈ 0), um texto (símbolo
// sempre visível) ou o resultado de outra função daqui (null quando sumiu).
//   const e = criarExpressao({ casas: 1 });
//   e.igual(e.soma("x", e.produto(-2, "t")), 0)   → "x - 2t = 0"
//   e.simbolo("x_0", x0)                           → "x_0", ou some se x0 ≈ 0
export function criarExpressao({ casas = 2, tolerancia = 0.5 * 10 ** -casas } = {}) {
  const quaseZero = (v) => Math.abs(v) < tolerancia;

  // Nó da expressão: null (sumiu) ou { tex, negativo, atomo }.
  const no = (t) => {
    if (t === null || t === undefined) return null;
    if (typeof t === "number") {
      // Indefinido: visível, para o caso especial não passar despercebido.
      if (!Number.isFinite(t)) return { tex: "\\text{NaN}", negativo: false, atomo: true };
      return quaseZero(t) ? null : { tex: numero(Math.abs(t), casas), negativo: t < 0, atomo: true };
    }
    if (typeof t === "string") return { tex: t, negativo: false, atomo: true };
    return t;
  };

  // Símbolo que some quando o valor que ele representa é ≈ 0.
  const simbolo = (s, valor) => (Number.isFinite(valor) && quaseZero(valor) ? null : no(s));

  const oposto = (t) => {
    const a = no(t);
    return a && { ...a, negativo: !a.negativo };
  };

  // Produto: some se um fator some; o fator 1 não aparece.
  function produto(...fatores) {
    const fs = fatores.map(no);
    if (fs.some((f) => f === null)) return null;
    const negativo = fs.reduce((s, f) => s !== f.negativo, false);
    const partes = fs
      .map((f) => (f.atomo ? f.tex : `(${f.tex})`))
      .filter((t, i, todas) => !(t === "1" && todas.length > 1));
    return { tex: partes.join(""), negativo, atomo: false };
  }

  // Soma: termos que somem ficam de fora; o sinal de cada termo vira + ou −.
  function soma(...termos) {
    const ts = termos.map(no).filter(Boolean);
    if (ts.length === 0) return null;
    if (ts.length === 1) return ts[0];
    const t = ts.map((x, i) => (i === 0 ? (x.negativo ? "-" : "") : x.negativo ? " - " : " + ") + x.tex).join("");
    return { tex: t, negativo: false, atomo: false };
  }

  function potencia(base, k) {
    const b = no(base);
    if (b === null) return null;
    const tb = b.atomo && !b.negativo ? b.tex : `(${b.negativo ? "-" : ""}${b.tex})`;
    return { tex: `${tb}^{${k}}`, negativo: false, atomo: false };
  }

  function fracao(a, b) {
    const p = no(a);
    const q = no(b);
    if (p === null || q === null) return null;
    return { tex: `\\frac{${p.tex}}{${q.tex}}`, negativo: p.negativo !== q.negativo, atomo: true };
  }

  // TeX de um nó; o que sumiu inteiro vale 0.
  const emTex = (t) => {
    const a = no(t);
    return a === null ? "0" : (a.negativo ? "-" : "") + a.tex;
  };

  const igual = (a, b) => `${emTex(a)} = ${emTex(b)}`;

  // "=" quando os números mostrados já têm no máximo `casas` casas; senão "\approx".
  const relacao = (...valores) =>
    valores.every((v) => Math.abs(v - Number(v.toFixed(casas))) < 1e-9) ? "=" : "\\approx";

  return { simbolo, oposto, produto, soma, potencia, fracao, tex: emTex, igual, relacao };
}

// Expressões com 2 casas decimais.
export const expressao = criarExpressao();

// Equações prontas, montadas com `expressao` (termos nulos somem).
export const equacao = {
  // (x − x0)² + (y − y0)² = r²; com simbolos, mostra x_0, y_0 e r pelos nomes.
  circulo([x0, y0], r, { simbolos = false } = {}) {
    const { igual, soma, potencia, oposto, simbolo } = expressao;
    return simbolos
      ? igual(soma(potencia(soma("x", oposto(simbolo("x_0", x0))), 2), potencia(soma("y", oposto(simbolo("y_0", y0))), 2)), "r^2")
      : igual(soma(potencia(soma("x", -x0), 2), potencia(soma("y", -y0), 2)), potencia(r, 2));
  },

  // Reta P0 + t·v em equações paramétricas (plano ou espaço).
  retaParametrica(p0, v, { t = "t" } = {}) {
    const { igual, soma, produto } = expressao;
    const nomes = ["x", "y", "z"];
    const linhas = p0.map((c, i) => igual(nomes[i], soma(c, produto(v[i], t))));
    return `\\begin{cases} ${linhas.join(" \\\\ ")} \\end{cases}`;
  },

  // Plano P0 + s·u + t·v em equações paramétricas.
  planoParametrico(p0, u, v, { s = "s", t = "t" } = {}) {
    const { igual, soma, produto } = expressao;
    const nomes = ["x", "y", "z"];
    const linhas = p0.map((c, i) => igual(nomes[i], soma(c, produto(u[i], s), produto(v[i], t))));
    return `\\begin{cases} ${linhas.join(" \\\\ ")} \\end{cases}`;
  },
};
