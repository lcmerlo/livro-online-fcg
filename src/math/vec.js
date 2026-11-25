// Contas com vetores em listas simples, [x, y] ou [x, y, z]. Não desenha nada: a
// figura, as expressões e o status leem a mesma conta.
// Um resultado indefinido (vetor nulo, vetores paralelos) é NaN, nunca um 0 enganoso;
// o applet decide o que mostrar nesse caso. Os ângulos são em radianos.

export const between = (A, B) => [B.X() - A.X(), B.Y() - A.Y()];
export const add = (...vectors) => vectors.reduce((sum, v) => sum.map((c, i) => c + v[i]));
export const scale = (k, v) => v.map((c) => k * c);
export const dot = (u, v) => u.reduce((sum, c, i) => sum + c * v[i], 0);
export const norm = (v) => Math.hypot(...v);
export const perp = ([x, y]) => [-y, x];
export const det = (u, v) => u[0] * v[1] - u[1] * v[0];
export const cross = ([a, b, c], [d, e, f]) => [b * f - c * e, c * d - a * f, a * e - b * d];

export function unit(v) {
  const length = norm(v);
  return length ? scale(1 / length, v) : v.map(() => NaN);
}

export function angle(u, v) {
  const lengths = norm(u) * norm(v);
  // O arredondamento pode empurrar o cosseno um pouco para fora de [-1, 1].
  return lengths ? Math.acos(Math.max(-1, Math.min(1, dot(u, v) / lengths))) : NaN;
}

// [a, b] tais que w = a·u + b·v (Cramer); [NaN, NaN] quando u e v são paralelos.
export function coordsInBasis(u, v, w) {
  const d = det(u, v);
  if (Math.abs(d) < 1e-12 * (norm(u) * norm(v) || 1)) return [NaN, NaN];
  return [det(w, v) / d, det(u, w) / d];
}

// k tal que a projeção de v sobre u é k·u; NaN quando u é nulo.
export function projectionFactor(v, u) {
  const uu = dot(u, u);
  return uu ? dot(u, v) / uu : NaN;
}

export const projection = (v, u) => scale(projectionFactor(v, u), u);
