// applets-src/src/exemplos/exemplo-partes.js
//
// Exemplo de applet com várias partes: dois quadros ligados e uma leitura.
// Serve à página de desenvolvimento (applets-src/index.html) e de modelo; fica
// fora do bundle, porque main.js só registra os arquivos de src/applets/.
//   vetores  quadro com u e v, de pontas arrastáveis;
//   soma     quadro com u + v, que acompanha o primeiro;
//   leitura  a conta, em TeX.
// No capítulo, seria escrito assim (components/applet-bloco.lua):
//   ::::: {.applet nome="exemplo-partes" id="ep" rotulo="Soma de dois vetores"}
//   :::: {.grid}
//   ::: {#ep-vetores .quadro .g-col-12 .g-col-md-6 rotulo="Os vetores u e v, com as pontas arrastáveis"}
//   :::
//   ::: {#ep-soma .quadro .g-col-12 .g-col-md-6 rotulo="O vetor u + v"}
//   :::
//   ::::
//   ::: {#ep-leitura .leitura}
//   :::
//   :::::

import { CORES } from "../cores.js";
import { criarQuadro, ligarQuadros } from "../tools/quadro.js";
import { criarLeitura } from "../tools/leitura.js";
import { ESTILOS, pontoArrastavel, seta } from "../tools/styles.js";
import { soma } from "../tools/vetores.js";
import { tex, texto } from "../tools/formatar.js";

const REGIAO = [-1, 4, 5, -1];

export default function criarExemploPartes({ id, JXG, partes = {} }) {
  // O primeiro quadro é a parte "vetores" do bloco. No shortcode
  // {{< applet >}} não há partes: o quadro é o próprio elemento do applet.
  const doShortcode = Object.keys(partes).length === 0;
  const quadroVetores = criarQuadro({ JXG, id: doShortcode ? id : partes.vetores, regiao: REGIAO, eixos: true, grade: true });
  if (!quadroVetores) return null;

  // Posições iniciais, reaproveitadas pelo reset().
  const U0 = [1, 2];
  const V0 = [3, 1];

  const U = quadroVetores.create("point", U0, { ...pontoArrastavel(CORES.dado, "seta"), snapToGrid: true });
  const V = quadroVetores.create("point", V0, { ...pontoArrastavel(CORES.dado, "seta"), snapToGrid: true });
  quadroVetores.create("arrow", [[0, 0], U], seta(CORES.dado, { nome: "u" }));
  quadroVetores.create("arrow", [[0, 0], V], seta(CORES.dado, { nome: "v", lado: "right" }));

  // A conta, escrita uma vez: a figura, a leitura e o texto de estado a usam.
  // Com a origem em (0, 0), as componentes de u são as coordenadas de U.
  const u = () => [U.X(), U.Y()];
  const v = () => [V.X(), V.Y()];
  const w = () => soma(u(), v());

  // O segundo quadro é opcional: o capítulo pode mostrar só o primeiro.
  const quadroSoma = partes.soma ? criarQuadro({ JXG, id: partes.soma, regiao: REGIAO, eixos: true, grade: true }) : null;
  const quadros = [quadroVetores];

  if (quadroSoma) {
    const pontaU = [() => u()[0], () => u()[1]];
    const pontaW = [() => w()[0], () => w()[1]];
    quadroSoma.create("arrow", [[0, 0], pontaU], { ...ESTILOS.apoio, fixed: true, lastArrow: { type: 2, size: 5 } });
    quadroSoma.create("arrow", [pontaU, pontaW], { ...ESTILOS.apoio, fixed: true, lastArrow: { type: 2, size: 5 } });
    quadroSoma.create("arrow", [[0, 0], pontaW], seta(CORES.resultado, { nome: "u + v" }));
    quadros.push(quadroSoma);
    ligarQuadros(...quadros);
  }

  const leitura = criarLeitura({
    id: partes.leitura,
    tex: () => `\\vec{u} + \\vec{v} = ${tex.ponto(u())} + ${tex.ponto(v())} = ${tex.ponto(w())}`,
    quadros,
  });

  // Texto de estado (§4.4 das diretrizes), refeito 400 ms depois do último movimento.
  const status = document.getElementById(`${id}-status`);
  let espera;
  const descrever = () => {
    status.textContent = `u = ${texto.ponto(u())}, v = ${texto.ponto(v())} e u + v = ${texto.ponto(w())}.`;
  };
  if (status) {
    descrever();
    quadroVetores.on("update", () => {
      clearTimeout(espera);
      espera = setTimeout(descrever, 400);
    });
  }

  function reset() {
    U.moveTo(U0);
    V.moveTo(V0);
    quadroVetores.update();
    leitura?.atualizar();
  }

  return { board: quadroVetores, quadros, objetos: { U, V }, reset };
}
