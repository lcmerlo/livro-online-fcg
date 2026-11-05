// applets-src/src/applets/teste-cores.js
//
// Applet de teste, para nenhum capítulo: a mesma soma de vetores em vários
// modelos de cor, lado a lado, para comparar a olho e com simulação de
// daltonismo. O primeiro é o modelo do livro (papéis enxutos, decisoes.md,
// 2026-11-04); os outros, alternativas para comparação. Mover a ponta
// de u ou de v num quadro move a mesma ponta nos outros, para que todos
// mostrem sempre a mesma situação.
// Página: _interno/oficina/testes/teste-cores.qmd, com um bloco
// ::: {.applet nome="teste-cores" id="tc"} e as partes (quadros) livro,
// destaque e okabe; um modelo sem parte na página fica de fora.

import { CORES, paleta } from "../cores.js";
import { criarQuadro } from "../tools/quadro.js";
import { ESTILOS, pontoArrastavel, pontoFixo, seta } from "../tools/styles.js";
import { soma } from "../tools/vetores.js";
import { texto } from "../tools/formatar.js";

const REGIAO = [-1, 4, 5, -1];

// Posições iniciais das pontas de u e v, reaproveitadas pelo reset().
const U0 = [1, 2];
const V0 = [3, 1];

// Cores de u, v, da soma e das linhas de apoio (as cópias de u e v que
// fecham o paralelogramo), em cada modelo. Lidas na criação, e não quando o
// bundle carrega: na página de npm run dev não há as variáveis --brand-….
function modelos() {
  return {
    // O modelo do livro: u e v são dados, a soma é o resultado, e as cópias
    // que fecham o paralelogramo são apoio.
    livro: { u: CORES.dado, v: CORES.dado, soma: CORES.resultado, apoio: CORES.apoio },
    // Neutro com um destaque: só o resultado tem cor.
    destaque: { u: paleta("grafite-2"), v: paleta("grafite-2"), soma: paleta("laranja-2"), apoio: paleta("cinza-5") },
    // Uma cor por objeto, com a Okabe–Ito, na ordem usada no JSX-quarto.
    okabe: { u: paleta("blue-oi"), v: paleta("red-oi"), soma: paleta("teal-oi"), apoio: paleta("cinza-5") },
  };
}

export default function criarTesteCores({ id, JXG, partes = {} }) {
  const quadros = [];

  for (const [modelo, cor] of Object.entries(modelos())) {
    if (!partes[modelo]) continue;

    const board = criarQuadro({ JXG, id: partes[modelo], regiao: REGIAO, eixos: true, grade: true });
    if (!board) continue;

    const U = board.create("point", U0, { ...pontoArrastavel(cor.u, "seta"), snapToGrid: true });
    const V = board.create("point", V0, { ...pontoArrastavel(cor.v, "seta"), snapToGrid: true });
    const S = [() => U.X() + V.X(), () => U.Y() + V.Y()];
    const apoio = { ...ESTILOS.apoio, strokeColor: cor.apoio, highlightStrokeColor: cor.apoio, fixed: true };

    // Origem sem nome (o JSXGraph daria a ela um nome automático, como "C").
    board.create("point", [0, 0], { ...pontoFixo(CORES.texto), withLabel: false });
    board.create("segment", [U, S], apoio);
    board.create("segment", [V, S], apoio);
    board.create("arrow", [[0, 0], U], seta(cor.u, { nome: "u" }));
    board.create("arrow", [[0, 0], V], seta(cor.v, { nome: "v", lado: "right" }));
    board.create("arrow", [[0, 0], S], seta(cor.soma, { nome: "u + v" }));

    quadros.push({ board, U, V });
  }

  if (quadros.length === 0) return null;

  // A conta, escrita uma vez, a partir do primeiro quadro: os outros mostram o mesmo.
  const u = () => [quadros[0].U.X(), quadros[0].U.Y()];
  const v = () => [quadros[0].V.X(), quadros[0].V.Y()];

  // Texto de estado (§4.4 das diretrizes), refeito 400 ms depois do último movimento.
  const status = document.getElementById(`${id}-status`);
  let espera;
  const descrever = () => {
    if (status) {
      status.textContent = `Em todos os quadros, u = ${texto.ponto(u())}, v = ${texto.ponto(v())} e u + v = ${texto.ponto(soma(u(), v()))}.`;
    }
  };
  descrever();

  // Mover uma ponta (mouse, dedo ou setas) move a mesma ponta nos outros quadros.
  for (const quadro of quadros) {
    for (const ponta of ["U", "V"]) {
      quadro[ponta].on("drag", () => {
        const onde = [quadro[ponta].X(), quadro[ponta].Y()];
        for (const outro of quadros) {
          if (outro !== quadro) outro[ponta].moveTo(onde);
        }
        clearTimeout(espera);
        espera = setTimeout(descrever, 400);
      });
    }
  }

  function reset() {
    for (const { U, V } of quadros) {
      U.moveTo(U0);
      V.moveTo(V0);
    }
    descrever();
  }

  return { board: quadros[0].board, quadros: quadros.map((q) => q.board), reset };
}
