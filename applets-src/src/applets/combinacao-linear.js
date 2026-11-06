// applets-src/src/applets/combinacao-linear.js
//
// Piloto da combinação linear (pendencias.md, §3): a combinação linear de
// dois vetores vista pela geometria, sem coordenadas. Três quadros, sem
// eixos e sem grade.
// Página: _interno/oficina/testes/piloto-combinacao-linear.qmd.
// A ideia dos três quadros vem de applets/decomposicao-de-vetor.qmd do
// JSX-quarto, adaptada às regras do livro.
//
// Partes (no shortcode {{< applet >}}, só o primeiro quadro, no próprio
// elemento do applet):
//   vetores       os vetores livres u e v: as duas extremidades de cada um
//                 se arrastam, e o vetor fica em qualquer lugar;
//   combinacao    u, v, a·u, b·v e a·u + b·v, a partir de um mesmo ponto
//                 (opcional; sem ele, não há faixas);
//   controles     as faixas de a e b (opcional; sem ela, logo abaixo do
//                 quadro dos vetores);
//   decomposicao  o vetor livre w e a decomposição w = a·u + b·v, construída
//                 com retas paralelas a u e a v pelas extremidades de w
//                 (opcional);
//   leitura       a resposta do terceiro quadro, em TeX (opcional).
//
// Casos especiais (regra fundamental 2), decididos em decompor():
//   u e v não são múltiplos   decomposição única, construída no quadro;
//   u e v são múltiplos (um deles, ou os dois, podem ser nulos):
//     w fora da direção comum   "Decomposição impossível";
//     w na direção comum        "Existem infinitas decomposições", com três.
//
// Encaixe: arrastados à mão, dois vetores quase nunca ficam exatamente
// múltiplos, e um vetor quase nunca fica exatamente nulo. Para que esses
// casos sejam alcançáveis sem grade, a extremidade arrastada se encaixa
// (pendencias.md, §2, caso paralelo):
//   - na outra extremidade, quando chega perto dela: o vetor fica nulo;
//   - na direção de outro vetor, quando chega perto dela: u na de v, v na
//     de u, w na de u ou na de v.

import { CORES } from "../cores.js";
import { criarQuadro, ligarQuadros } from "../tools/quadro.js";
import { criarLeitura } from "../tools/leitura.js";
import { criarEstado } from "../tools/estado.js";
import { criarFaixa } from "../tools/controles.js";
import { ESTILOS, pontoArrastavel, pontoFixo, seta } from "../tools/styles.js";
import { coeficientesNaBase, determinante, multiplicar, norma, produtoEscalar, soma } from "../tools/vetores.js";
import { expressao, numero, tex, texto } from "../tools/formatar.js";

// Regiões do plano. O segundo quadro é maior que o primeiro, para que
// a·u + b·v caiba nele com a e b entre −2 e 2 e u e v do tamanho inicial.
const REGIAO_VETORES = [-4, 3, 4, -3];
const REGIAO_COMBINACAO = [-5, 4, 5, -4];
const REGIAO_DECOMPOSICAO = [-6, 4, 6, -4];

// Extremidades iniciais [origem, ponta], reaproveitadas pelo reset(). No
// início, u e v não são múltiplos, e w = 2u + v.
const U0 = [[-3, -1], [-1, 0]];
const V0 = [[1.5, -1.5], [0.5, 0.5]];
const W0 = [[-3, -2.5], [0, 1.5]];
const INICIO = { a: 1.5, b: -1 };

// Encaixe, em px de tela: é uma questão de pontaria, como a área de captura
// dos pontos (tools/styles.js). As setas do teclado andam 10 px; com 6 px,
// uma delas sempre tira a extremidade do encaixe na direção.
const ENCAIXE_DIRECAO = 6;
const ENCAIXE_NULO = 8;
// Num vetor curto, poucos px já são um ângulo grande: a direção só encaixa
// abaixo deste seno (cerca de 11°).
const ENCAIXE_SENO = 0.2;
// O dedo é menos preciso que o mouse.
const FATOR_TOQUE = 2;

// Tolerâncias das contas: abaixo delas, o vetor é nulo, e dois vetores são
// múltiplos. Depois de um encaixe, os valores ficam muito abaixo delas.
const nulo = (v) => norma(v) < 1e-9;
const multiplos = (p, q) => Math.abs(determinante(p, q)) <= 1e-9 * norma(p) * norma(q);

// Número k tal que p = k·q, para p múltiplo de q, com q não nulo.
const razao = (p, q) => produtoEscalar(p, q) / produtoEscalar(q, q);

// A decomposição w = a·u + b·v, decidida uma vez: a figura, a leitura e o
// texto de estado leem esta conta.
//   { caso: "unica", a, b }
//   { caso: "impossivel" }
//   { caso: "infinitas", exemplos: [[a, b], [a, b], [a, b]] }
// Nos dois últimos, u e v são múltiplos um do outro (um deles pode ser nulo).
function decompor(u, v, w) {
  const uNulo = nulo(u);
  const vNulo = nulo(v);
  const wNulo = nulo(w);

  if (!uNulo && !vNulo && !multiplos(u, v)) {
    const [a, b] = coeficientesNaBase(u, v, w);
    return { caso: "unica", a, b };
  }

  let exemplos = null;

  if (uNulo && vNulo) {
    // a·u + b·v é o vetor nulo para quaisquer a e b.
    if (wNulo) exemplos = [[0, 0], [1, 1], [1, -1]];
  } else if (uNulo) {
    // a·u + b·v = b·v: b é o número com w = b·v, e a é qualquer.
    if (wNulo || multiplos(w, v)) {
      const b = razao(w, v);
      exemplos = [[0, b], [1, b], [-1, b]];
    }
  } else if (vNulo) {
    if (wNulo || multiplos(w, u)) {
      const a = razao(w, u);
      exemplos = [[a, 0], [a, 1], [a, -1]];
    }
  } else if (wNulo) {
    // v = k·u: a·u + b·v = (a + k·b)·u, nulo quando a = −k·b.
    const k = razao(v, u);
    exemplos = [[0, 0], [-k, 1], [k, -1]];
  } else if (multiplos(w, u)) {
    // w = a·u = b·v, e também w = (a/2)·u + (b/2)·v.
    const a = razao(w, u);
    const b = razao(w, v);
    exemplos = [[a, 0], [0, b], [a / 2, b / 2]];
  }

  return exemplos ? { caso: "infinitas", exemplos } : { caso: "impossivel" };
}

// a·u + b·v em TeX: termos nulos somem e o coeficiente 1 não aparece; se os
// dois somem, fica 0u + 0v (e não só 0), para mostrar os dois números.
function combinacaoTex(a, b) {
  const { soma: somar, produto, tex: escrever } = expressao;
  const termos = somar(produto(a, "\\vec{u}"), produto(b, "\\vec{v}"));
  return termos ? escrever(termos) : "0\\vec{u} + 0\\vec{v}";
}

// O mesmo, em texto simples, para o texto de estado: "2 u - v".
function combinacaoTexto(a, b) {
  const termos = [[numero(a), "u"], [numero(b), "v"]]
    .filter(([n]) => n !== "0")
    .map(([n, nome], i) => {
      const negativo = n.startsWith("-");
      const valor = negativo ? n.slice(1) : n;
      const termo = valor === "1" ? nome : `${valor} ${nome}`;
      if (i === 0) return negativo ? `-${termo}` : termo;
      return `${negativo ? "-" : "+"} ${termo}`;
    });
  return termos.length > 0 ? termos.join(" ") : "0 u + 0 v";
}

// "=" quando os números mostrados são exatos; "≈" quando foram arredondados.
const relacaoTex = (a, b) => expressao.relacao(a, b);
const relacaoTexto = (a, b) => (expressao.relacao(a, b) === "=" ? "=" : "≈");

// Lado de p ("left" ou "right" do sentido de p) oposto àquele em que está
// q: o nome de p fica fora do paralelogramo de p e q. Com p e q na mesma
// direção, vale o padrão.
function ladoFora(p, q, padrao) {
  const d = determinante(p, q);
  if (Math.abs(d) <= 1e-9 * norma(p) * norma(q)) return padrao;
  return d > 0 ? "right" : "left";
}

const oposto = (lado) => (lado === "left" ? "right" : "left");

// Seta com o nome do lado lado() (que pode mudar com a figura), na fração
// `onde` do comprimento; nomeVisivel(), se houver, decide quando o nome
// aparece.
function setaComLado(cor, nome, lado, { onde = 0.5, nomeVisivel, ...opcoes } = {}) {
  const estilo = seta(cor, { nome, ...opcoes });

  estilo.label = {
    ...estilo.label,
    position: () => `${onde}fr ${typeof lado === "function" ? lado() : lado}`,
    ...(nomeVisivel && { visible: nomeVisivel }),
  };

  return estilo;
}

export default function criarCombinacaoLinear({ id, JXG, partes = {} }) {
  const quadroVetores = criarQuadro({ JXG, id: partes.vetores ?? id, regiao: REGIAO_VETORES });
  if (!quadroVetores) return null;

  const quadroCombinacao = partes.combinacao ? criarQuadro({ JXG, id: partes.combinacao, regiao: REGIAO_COMBINACAO }) : null;
  const quadroDecomposicao = partes.decomposicao ? criarQuadro({ JXG, id: partes.decomposicao, regiao: REGIAO_DECOMPOSICAO }) : null;
  const quadros = [quadroVetores, quadroCombinacao, quadroDecomposicao].filter(Boolean);
  ligarQuadros(...quadros);

  // Extremidades e posições iniciais, para o reset().
  const inicios = [];

  // A extremidade `ponto` do vetor que vai de `outro` a `ponto` (ou de
  // `ponto` a `outro`) se encaixa na outra extremidade ou numa das
  // direções. Chamada depois de cada movimento (mouse, dedo ou setas).
  function encaixar(ponto, outro, direcoes, evento) {
    const quadro = ponto.board;
    const fator = evento?.pointerType === "touch" ? FATOR_TOQUE : 1;
    // px por unidade do plano (a escala é a mesma nos dois eixos)
    const escala = quadro.unitX;
    const base = [outro.X(), outro.Y()];
    const r = [ponto.X() - base[0], ponto.Y() - base[1]];
    const comprimento = norma(r) * escala;

    if (comprimento < ENCAIXE_NULO * fator) {
      ponto.setPositionDirectly(JXG.COORDS_BY_USER, base);
      return;
    }

    let alvo = null;
    let menor = ENCAIXE_DIRECAO * fator;

    for (const d of direcoes) {
      if (nulo(d)) continue;

      // Distância, em px, da extremidade à reta pela outra extremidade na direção d.
      const distancia = (Math.abs(determinante(d, r)) / norma(d)) * escala;

      if (distancia < menor && distancia / comprimento < ENCAIXE_SENO) {
        menor = distancia;
        alvo = soma(base, multiplicar(razao(r, d), d));
      }
    }

    // Um encaixe fora da região seria desfeito pelo quadro (tools/quadro.js).
    const [xMin, yMax, xMax, yMin] = quadro.getBoundingBox();

    if (alvo && alvo[0] >= xMin && alvo[0] <= xMax && alvo[1] >= yMin && alvo[1] <= yMax) {
      ponto.setPositionDirectly(JXG.COORDS_BY_USER, alvo);
    }
  }

  // Vetor livre: as duas extremidades se arrastam. A origem é um disco com
  // anel; a ponta, o anel na ponta da seta (tools/styles.js). Com as duas
  // extremidades juntas (o vetor nulo), o JSXGraph esconde a seta e o nome
  // dela; o nome passa então para o lado do ponto.
  function criarVetorLivre(quadro, [origem, ponta], nome, lado, direcoes) {
    let P = null;
    let Q = null;
    const vetor = () => [Q.X() - P.X(), Q.Y() - P.Y()];

    P = quadro.create("point", origem, {
      ...pontoArrastavel(CORES.dado),
      name: nome,
      withLabel: true,
      // Q ainda não existe quando o nome de P é criado.
      label: { fontSize: 18, offset: [12, 12], visible: () => Q !== null && nulo(vetor()) },
    });
    Q = quadro.create("point", ponta, { ...pontoArrastavel(CORES.dado, "seta"), name: "" });
    quadro.create("arrow", [P, Q], setaComLado(CORES.dado, nome, lado));

    P.on("drag", (evento) => encaixar(P, Q, direcoes(), evento));
    Q.on("drag", (evento) => encaixar(Q, P, direcoes(), evento));
    inicios.push([P, origem], [Q, ponta]);

    return { P, Q, vetor };
  }

  // ---------- Primeiro quadro: u e v ----------

  // u se encaixa na direção de v, e v na de u (as funções são chamadas a
  // cada movimento; u e v ainda não existem aqui).
  const U = criarVetorLivre(quadroVetores, U0, "\\vec{u}", "left", () => [v()]);
  const V = criarVetorLivre(quadroVetores, V0, "\\vec{v}", "right", () => [u()]);
  const u = U.vetor;
  const v = V.vetor;

  // Ponto de uma seta a partir de O (ou de outro ponto), lido a cada atualização.
  const ponto = (f) => [() => f()[0], () => f()[1]];

  // ---------- Segundo quadro: a·u, b·v e a·u + b·v ----------

  const estado = criarEstado(INICIO, ...quadros);

  if (quadroCombinacao) {
    const au = () => multiplicar(estado.a, u());
    const bv = () => multiplicar(estado.b, v());
    const s = () => soma(au(), bv());
    const O = [0, 0];
    const fixo = { fixed: true, highlight: false };

    quadroCombinacao.create("point", O, { ...pontoFixo(CORES.texto), name: "", withLabel: false });

    // Os lados que fecham o paralelogramo de a·u e b·v.
    const comParalelogramo = () => !nulo(au()) && !nulo(bv());
    quadroCombinacao.create("segment", [ponto(au), ponto(s)], { ...ESTILOS.apoio, ...fixo, visible: comParalelogramo });
    quadroCombinacao.create("segment", [ponto(bv), ponto(s)], { ...ESTILOS.apoio, ...fixo, visible: comParalelogramo });

    // a·u, b·v e a soma, mais grossos; por cima, u e v, finos, que continuam
    // visíveis quando a·u os cobre (com a entre 0 e 1, a·u fica sobre u).
    // Nomes: a·u e b·v do lado de fora do paralelogramo; a soma perto da
    // ponta, do lado de b·v; u e v do lado de dentro, além do meio, onde a
    // soma fica mais longe. Com a·u, b·v e a soma na mesma reta, a·u fica à
    // direita, b·v à esquerda e a soma do lado livre; com u e v múltiplos,
    // os nomes de u e v somem: seriam cinco nomes numa reta só.
    const naMesmaReta = () => multiplos(au(), bv());
    const ladoAu = () => ladoFora(au(), bv(), "right");
    const ladoBv = () => ladoFora(bv(), au(), "left");
    const ladoSoma = () => {
      if (nulo(au())) return "right";
      if (nulo(bv()) || naMesmaReta()) return "left";
      return oposto(ladoFora(s(), bv(), "right"));
    };
    quadroCombinacao.create("arrow", [O, ponto(au)], {
      ...setaComLado(CORES.resultado, "a\\vec{u}", ladoAu, { espessura: 3 }),
      visible: () => !nulo(au()),
    });
    quadroCombinacao.create("arrow", [O, ponto(bv)], {
      ...setaComLado(CORES.resultado, "b\\vec{v}", ladoBv, { espessura: 3 }),
      visible: () => !nulo(bv()),
    });
    quadroCombinacao.create("arrow", [O, ponto(s)], {
      ...setaComLado(CORES.resultado, "a\\vec{u} + b\\vec{v}", ladoSoma, { espessura: 3, onde: 0.7 }),
      visible: () => !nulo(s()),
    });
    quadroCombinacao.create("arrow", [O, ponto(u)], {
      ...setaComLado(CORES.dado, "\\vec{u}", () => oposto(ladoAu()), {
        espessura: 1.5,
        onde: 0.65,
        nomeVisivel: () => !nulo(u()) && !multiplos(u(), v()),
      }),
      visible: () => !nulo(u()),
    });
    quadroCombinacao.create("arrow", [O, ponto(v)], {
      ...setaComLado(CORES.dado, "\\vec{v}", () => oposto(ladoBv()), {
        espessura: 1.5,
        onde: 0.65,
        nomeVisivel: () => !nulo(v()) && !multiplos(u(), v()),
      }),
      visible: () => !nulo(v()),
    });

    const onde = partes.controles ?? id;
    criarFaixa(onde, estado, "a", { min: -2, max: 2, passo: 0.1, nome: "a", tex: (a) => `a = ${tex.numero(a)}` });
    criarFaixa(onde, estado, "b", { min: -2, max: 2, passo: 0.1, nome: "b", tex: (b) => `b = ${tex.numero(b)}` });
  }

  // ---------- Terceiro quadro: w = a·u + b·v ----------

  let W = null;
  let w = null;
  let resultado = () => null;

  if (quadroDecomposicao) {
    // w se encaixa na direção de u ou na de v.
    W = criarVetorLivre(quadroDecomposicao, W0, "\\vec{w}", "left", () => [u(), v()]);
    const { P: A, Q: B } = W;
    w = W.vetor;
    resultado = () => decompor(u(), v(), w());

    const unica = () => resultado().caso === "unica";
    const coeficientes = () => {
      const r = resultado();
      return r.caso === "unica" ? [r.a, r.b] : [NaN, NaN];
    };
    const fixo = { fixed: true, highlight: false };

    // Reta pelo ponto P na direção d().
    const reta = (P, d, visible) =>
      quadroDecomposicao.create("line", [[() => P.X(), () => P.Y()], [() => P.X() + d()[0], () => P.Y() + d()[1]]], {
        ...ESTILOS.apoio,
        ...fixo,
        visible,
      });

    // A construção: paralelas a u e a v pelas extremidades de w. A paralela
    // a u por A e a paralela a v por B se cortam em A + a·u; as outras duas,
    // em A + b·v.
    reta(A, u, unica);
    reta(A, v, unica);
    reta(B, u, unica);
    reta(B, v, unica);

    // Com u e v múltiplos, toda combinação a·u + b·v a partir de A termina na
    // reta por A na direção comum (se u e v não são os dois nulos).
    const direcaoComum = () => (nulo(u()) ? v() : u());
    reta(A, direcaoComum, () => !unica() && !(nulo(u()) && nulo(v())));

    const au = () => multiplicar(coeficientes()[0], u());
    const bv = () => multiplicar(coeficientes()[1], v());
    const aPartirDeA = (f) => [() => A.X() + f()[0], () => A.Y() + f()[1]];

    quadroDecomposicao.create("arrow", [A, aPartirDeA(au)], {
      ...setaComLado(CORES.resultado, "a\\vec{u}", () => ladoFora(au(), w(), "right"), { espessura: 3 }),
      visible: () => unica() && !nulo(au()),
    });
    quadroDecomposicao.create("arrow", [A, aPartirDeA(bv)], {
      ...setaComLado(CORES.resultado, "b\\vec{v}", () => ladoFora(bv(), w(), "left"), { espessura: 3 }),
      visible: () => unica() && !nulo(bv()),
    });
  }

  // A resposta do terceiro quadro, em TeX. As frases vão em duas linhas
  // curtas: numa linha só, passariam da largura da leitura ao lado do
  // quadro (cerca de 210 px numa janela de 800 px).
  function respostaTex() {
    const r = resultado();

    if (r.caso === "unica") {
      return `\\vec{w} ${relacaoTex(r.a, r.b)} ${combinacaoTex(r.a, r.b)}`;
    }

    if (r.caso === "impossivel") {
      return "\\begin{gathered}\\text{Decomposição}\\\\ \\text{impossível}\\end{gathered}";
    }

    const linhas = r.exemplos.map(([a, b]) => `\\vec{w} ${relacaoTex(a, b)} ${combinacaoTex(a, b)}`);
    return `\\begin{gathered}\\text{Existem infinitas}\\\\ \\text{decomposições:}\\\\ ${linhas.join(" \\\\ ")}\\end{gathered}`;
  }

  const leitura = quadroDecomposicao ? criarLeitura({ id: partes.leitura, tex: respostaTex, quadros }) : null;

  // ---------- Texto de estado ----------

  // u e v, em palavras.
  function descreverUV() {
    if (nulo(u()) && nulo(v())) return "u e v são nulos";
    if (nulo(u())) return "u é nulo";
    if (nulo(v())) return "v é nulo";
    return multiplos(u(), v()) ? "u e v são múltiplos" : "u e v não são múltiplos";
  }

  // A resposta do terceiro quadro, em palavras.
  function descreverW() {
    const r = resultado();

    if (r.caso === "unica") {
      return `w ${relacaoTexto(r.a, r.b)} ${combinacaoTexto(r.a, r.b)}`;
    }

    if (r.caso === "impossivel") {
      let motivo = "w não é múltiplo de u";
      if (nulo(u()) && nulo(v())) motivo = "w não é nulo";
      else if (nulo(u())) motivo = "w não é múltiplo de v";
      return `decomposição impossível: ${motivo}`;
    }

    const lista = r.exemplos.map(([a, b]) => `w ${relacaoTexto(a, b)} ${combinacaoTexto(a, b)}`);
    return `existem infinitas decomposições, como ${lista[0]}, ${lista[1]} e ${lista[2]}`;
  }

  // Refeito 400 ms depois do último movimento: de um ponto ou de uma faixa.
  // Ex.: "No primeiro quadro, u e v não são múltiplos. No segundo, a = 1.5
  // e b = -1. No terceiro, w = 2 u + v."
  const status = document.getElementById(`${id}-status`);
  let espera;
  const descrever = () => {
    const frases = [`No primeiro quadro, ${descreverUV()}.`];
    if (quadroCombinacao) frases.push(`No segundo, a = ${texto.numero(estado.a)} e b = ${texto.numero(estado.b)}.`);
    if (quadroDecomposicao) frases.push(`No terceiro, ${descreverW()}.`);
    status.textContent = frases.join(" ");
  };
  if (status) {
    descrever();
    for (const quadro of quadros) {
      quadro.on("update", () => {
        clearTimeout(espera);
        espera = setTimeout(descrever, 400);
      });
    }
  }

  function reset() {
    for (const [P, inicio] of inicios) {
      P.setPositionDirectly(JXG.COORDS_BY_USER, inicio);
    }
    // Valores e faixas; redesenha os quadros.
    estado.reiniciar();
    leitura?.atualizar();
  }

  return { board: quadroVetores, quadros, objetos: { U, V, W }, estado, reset };
}
