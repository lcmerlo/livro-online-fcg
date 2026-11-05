// applets-src/src/applets/teste-controles.js
//
// Applet de teste dos controles, para nenhum capítulo: o vetor u, de ponta
// arrastável, e o vetor a·u, com uma faixa e um campo para o número a (um
// acompanha o outro), uma caixa de seleção que mostra a reta de u e o botão
// Animar, que faz a ir de −2 a 2 e voltar.
// Página: _interno/oficina/testes/teste-controles.qmd, com o applet em
// quatro arranjos; também roda na página de npm run dev.
// Partes (todas opcionais; no shortcode {{< applet >}}, não há partes):
//   figura     o quadro; sem ela, o quadro é o próprio elemento do applet;
//   controles  onde ficam os controles; sem ela, logo abaixo do quadro.

import { CORES } from "../cores.js";
import { criarQuadro } from "../tools/quadro.js";
import { criarAnimacao, criarEstado } from "../tools/estado.js";
import { criarBotaoAnimacao, criarCaixa, criarCampo, criarFaixa } from "../tools/controles.js";
import { ESTILOS, pontoArrastavel, pontoFixo, seta } from "../tools/styles.js";
import { multiplicar, norma } from "../tools/vetores.js";
import { tex, texto } from "../tools/formatar.js";

const REGIAO = [-5, 4, 5, -4];

// Valores iniciais, reaproveitados pelo reset().
const U0 = [2, 1];
const INICIO = { a: 1.5, reta: false };

export default function criarTesteControles({ id, JXG, partes = {} }) {
  const board = criarQuadro({ JXG, id: partes.figura ?? id, regiao: REGIAO, eixos: true, grade: true });
  if (!board) return null;

  const estado = criarEstado(INICIO, board);
  const animacao = criarAnimacao(estado, "a", { min: -2, max: 2, velocidade: 1 });

  // A conta, escrita uma vez: a figura e o texto de estado a usam.
  const U = board.create("point", U0, { ...pontoArrastavel(CORES.dado, "seta"), snapToGrid: true });
  const u = () => [U.X(), U.Y()];
  const au = () => multiplicar(estado.a, u());
  const nulo = () => norma(u()) === 0;

  board.create("point", [0, 0], { ...pontoFixo(CORES.texto), withLabel: false });
  // A reta de u não existe quando u é nulo.
  board.create("line", [[0, 0], U], {
    ...ESTILOS.apoio,
    fixed: true,
    highlight: false,
    visible: () => estado.reta && !nulo(),
  });
  // a·u antes de u: a seta de u, com a ponta arrastável, fica por cima.
  board.create("arrow", [[0, 0], [() => au()[0], () => au()[1]]], seta(CORES.resultado, { nome: "a·u", lado: "right" }));
  board.create("arrow", [[0, 0], U], seta(CORES.dado, { nome: "u" }));

  const onde = partes.controles ?? id;
  criarFaixa(onde, estado, "a", { min: -2, max: 2, passo: 0.1, nome: "a", tex: (a) => `a = ${tex.numero(a)}` });
  criarCampo(onde, estado, "a", { rotulo: "digite $a$:", nome: "digite a", min: -2, max: 2 });
  criarCaixa(onde, estado, "reta", { rotulo: "mostrar a reta de $\\vec{u}$", nome: "mostrar a reta de u" });
  criarBotaoAnimacao(onde, animacao);

  // Texto de estado (§4.4 das diretrizes), refeito 400 ms depois do último
  // movimento: do ponto, da faixa, do campo ou da animação.
  const status = document.getElementById(`${id}-status`);
  let espera;
  const descrever = () => {
    const reta = estado.reta && !nulo() ? " A reta de u está visível." : "";
    status.textContent = nulo()
      ? `a = ${texto.numero(estado.a)}; u é o vetor nulo, e a vezes u também.`
      : `a = ${texto.numero(estado.a)}, u = ${texto.ponto(u())} e a vezes u = ${texto.ponto(au())}.${reta}`;
  };
  if (status) {
    descrever();
    board.on("update", () => {
      clearTimeout(espera);
      espera = setTimeout(descrever, 400);
    });
  }

  function reset() {
    U.moveTo(U0);
    // Valores, controles e animação; redesenha o quadro.
    estado.reiniciar();
  }

  return { board, objetos: { U }, estado, animacao, reset };
}
