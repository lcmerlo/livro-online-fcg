// Valores exatos em fórmulas que mudam: com a = 1 e b = -1, a expressão \sqrt{a^2 + b^2}
// deve mostrar \sqrt{2}, e não 1.41. Dois métodos, do mais seguro ao mais geral:
//   root(x)       o applet sabe que o valor é a raiz quadrada de x: é a conta da fórmula
//   recognize(v)  só o valor é conhecido: procura a fração, a raiz ou o múltiplo de pi
//                 que ele é
// Um número só é tratado como exato quando é uma fração de denominador pequeno, a
// menos do erro de arredondamento da máquina. É o caso de pontos presos a uma malha e
// de sliders com passo decimal. Fora disso, as funções devolvem null, e quem escreve
// usa o decimal, com "≈" (src/math/format.js faz isso).

const tolerance = 1e-10;

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

// x como fração n/d, com d até maxDenominator, pelas frações contínuas; null se x
// não é uma fração assim.
export function toFraction(x, maxDenominator = 100) {
  if (!Number.isFinite(x)) return null;
  const size = Math.abs(x);
  let [n0, d0, n1, d1] = [0, 1, 1, 0];
  let rest = size;
  for (let i = 0; i < 40; i++) {
    const whole = Math.floor(rest);
    [n0, d0, n1, d1] = [n1, d1, whole * n1 + n0, whole * d1 + d0];
    if (d1 > maxDenominator) return null;
    if (Math.abs(size - n1 / d1) <= tolerance * Math.max(1, size)) return { n: x < 0 ? -n1 : n1, d: d1 };
    rest = 1 / (rest - whole);
  }
  return null;
}

// n = s² · r, com r sem fator quadrado.
function squarePart(n) {
  let [s, r] = [1, n];
  for (let p = 2; p * p <= r; p++) {
    while (r % (p * p) === 0) {
      r /= p * p;
      s *= p;
    }
  }
  return [s, r];
}

// A raiz quadrada de x na forma (n/d)·√r, com r sem fator quadrado: √8 = 2√2,
// √(1/2) = (1/2)√2, √(9/4) = 3/2 (r = 1). null se x é negativo ou não é uma fração
// simples.
export function root(x, maxDenominator = 100) {
  const fraction = x >= 0 ? toFraction(x, maxDenominator) : null;
  if (!fraction) return null;
  if (fraction.n === 0) return { n: 0, d: 1, r: 1 };
  // √(n/d) = √(n·d)/d
  const [s, r] = squarePart(fraction.n * fraction.d);
  const divisor = gcd(s, fraction.d);
  return { n: s / divisor, d: fraction.d / divisor, r };
}

// O valor v, reconhecido: uma fração, uma raiz (com sinal) ou um múltiplo de pi.
//   { n, d, r }     v = (n/d)·√r, com r = 1 para uma fração
//   { n, d, pi }    v = (n/d)·π
// null quando v não parece nenhum deles.
export function recognize(v, maxDenominator = 100) {
  if (!Number.isFinite(v)) return null;
  const fraction = toFraction(v, maxDenominator);
  if (fraction) return { ...fraction, r: 1 };
  const square = root(v * v, maxDenominator);
  if (square) return { ...square, n: v < 0 ? -square.n : square.n };
  const turns = toFraction(v / Math.PI, 12);
  return turns ? { ...turns, pi: true } : null;
}
