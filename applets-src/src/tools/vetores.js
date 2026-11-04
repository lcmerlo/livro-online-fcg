// applets-src/src/tools/vetores.js
//
// Contas com vetores em listas de números, [x, y] no plano ou [x, y, z] no
// espaço. Não desenham nada: a figura e o texto de estado leem a mesma conta,
// escrita uma vez (diretrizes-tecnicas.md, §4.4).
//   import { componentes, angulo } from "../tools/vetores.js";
//   const u = componentes(A, B);       // vetor de A até B
//   const theta = angulo(u, v);        // em radianos
//
// Adaptado de lib/vec.js do JSX-quarto. Diferença: quando a conta não está
// definida (vetor nulo, vetores paralelos), o resultado é NaN, e o applet
// decide o que mostrar (formatar.js: finito, casos). A lib devolvia 0 no
// unitário e na projeção sobre o vetor nulo.
// Unidades: ângulos em radianos; graus só na tela (formatar.js).

// Componentes do vetor de A até B (pontos do JSXGraph): B − A.
export const componentes = (A, B) => [B.X() - A.X(), B.Y() - A.Y()];

// u + v + …
export const soma = (...vetores) => vetores.reduce((total, v) => total.map((c, i) => c + v[i]));

// k·v
export const multiplicar = (k, v) => v.map((c) => k * c);

// u · v
export const produtoEscalar = (u, v) => u.reduce((total, c, i) => total + c * v[i], 0);

// Norma (comprimento) de v.
export const norma = (v) => Math.hypot(...v);

// Vetor unitário na direção de v; NaN se v é nulo.
export function unitario(v) {
  const n = norma(v);
  return n ? multiplicar(1 / n, v) : v.map(() => NaN);
}

// v girado de 90° no sentido anti-horário (plano).
export const perpendicular = ([x, y]) => [-y, x];

// Determinante de [u v] (plano): área orientada do paralelogramo de u e v.
export const determinante = (u, v) => u[0] * v[1] - u[1] * v[0];

// Produto vetorial u × v (espaço).
export const produtoVetorial = ([a, b, c], [d, e, f]) => [b * f - c * e, c * d - a * f, a * e - b * d];

// Ângulo entre u e v, em radianos, de 0 a π; NaN se algum deles é nulo.
export function angulo(u, v) {
  const n = norma(u) * norma(v);
  // O arredondamento pode levar o cosseno um pouco além de [−1, 1].
  return n ? Math.acos(Math.max(-1, Math.min(1, produtoEscalar(u, v) / n))) : NaN;
}

// Coeficientes [a, b] de w = a·u + b·v (plano), pela regra de Cramer;
// [NaN, NaN] se u e v são paralelos ou algum deles é nulo.
export function coeficientesNaBase(u, v, w) {
  const d = determinante(u, v);

  // Tolerância relativa ao tamanho de u e v: vetores quase paralelos por
  // arredondamento contam como paralelos.
  if (Math.abs(d) < 1e-12 * (norma(u) * norma(v) || 1)) {
    return [NaN, NaN];
  }

  return [determinante(w, v) / d, determinante(u, w) / d];
}

// Número k tal que a projeção de v sobre u é k·u; NaN se u é nulo.
export function coeficienteProjecao(v, u) {
  const uu = produtoEscalar(u, u);
  return uu ? produtoEscalar(u, v) / uu : NaN;
}

// Projeção ortogonal de v sobre u; NaN se u é nulo.
export const projecao = (v, u) => multiplicar(coeficienteProjecao(v, u), u);
