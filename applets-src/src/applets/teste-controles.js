// applets-src/src/applets/teste-controles.js
//
// Applet de teste dos controles e dos arranjos, para nenhum capítulo: o
// vetor u, de ponta arrastável, e o vetor a·u, com uma faixa e um campo para
// o número a (um acompanha o outro), uma caixa de seleção que mostra a reta
// de u e o botão Animar, que faz a ir de −2 a 2 e voltar.
// Páginas: _interno/oficina/testes/teste-controles.qmd, com o applet em
// quatro arranjos, e arranjos.qmd, com todos os arranjos do guia editorial
// (§6); também roda na página de npm run dev.
// Partes (todas opcionais; no shortcode {{< applet >}}, não há partes):
//   figura     o quadro; sem ela, o quadro é o próprio elemento do applet;
//   numero     um segundo quadro, com o número a na reta numérica; a região
//              dele é larga e baixa, e o quadro também;
//   leitura    a conta de a·u, em TeX;
//   controles  onde ficam os controles; sem ela, logo abaixo do quadro.

import { CORES } from "../cores.js";
import { criarQuadro } from "../tools/quadro.js";
import { criarLeitura } from "../tools/leitura.js";
import { criarAnimacao, criarEstado } from "../tools/estado.js";
import { criarBotaoAnimacao, criarCaixa, criarCampo, criarFaixa } from "../tools/controles.js";
import { ESTILOS, pontoArrastavel, pontoFixo, seta } from "../tools/styles.js";
import { multiplicar, norma } from "../tools/vetores.js";
import { tex, texto } from "../tools/formatar.js";

const REGIAO = [-5, 4, 5, -4];
// Reta numérica de a, que vai de −2 a 2: 5 de largura por 2 de altura.
const REGIAO_NUMERO = [-2.5, 1, 2.5, -1];

// Valores iniciais, reaproveitados pelo reset().
const U0 = [2, 1];
const INICIO = { a: 1.5, reta: false };

export default function criarTesteControles({ id, JXG, partes = {} }) {
  const board = criarQuadro({ JXG, id: partes.figura ?? id, regiao: REGIAO, eixos: true, grade: true });
  if (!board) return null;

  // O segundo quadro é opcional: o capítulo pode mostrar só o primeiro.
  const quadroNumero = partes.numero ? criarQuadro({ JXG, id: partes.numero, regiao: REGIAO_NUMERO, eixos: true }) : null;
  const quadros = quadroNumero ? [board, quadroNumero] : [board];

  const estado = criarEstado(INICIO, ...quadros);
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
  board.create("arrow", [[0, 0], [() => au()[0], () => au()[1]]], seta(CORES.resultado, { nome: "a\\vec{u}", lado: "right" }));
  board.create("arrow", [[0, 0], U], seta(CORES.dado, { nome: "\\vec{u}" }));

  // Na reta numérica, só o eixo x; o ponto a acompanha a faixa e o campo.
  if (quadroNumero) {
    quadroNumero.defaultAxes.y.setAttribute({ visible: false });
    quadroNumero.create("point", [() => estado.a, 0], { ...pontoFixo(CORES.dado), name: "a", withLabel: true });
  }

  criarLeitura({
    id: partes.leitura,
    tex: () => `a\\vec{u} = ${tex.numero(estado.a)}\\,${tex.ponto(u())} = ${tex.ponto(au())}`,
    quadros,
  });

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

  return { board, quadros, objetos: { U }, estado, animacao, reset };
}
