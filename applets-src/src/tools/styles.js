// applets-src/src/tools/styles.js
//
// Aparências prontas para objetos JSXGraph. Cada estilo é um objeto de
// atributos do JSXGraph, espalhado na criação do objeto, podendo ser
// complementado:
//   board.create("point", [1, 1], { name: "A", ...pontoArrastavel() });
//   board.create("segment", [A, B], { ...ESTILOS.resultado });
//
// Pontos: a forma diz se o ponto se move (diretrizes-tecnicas.md, §4.5).
//   pontoArrastavel  disco com anel translúcido, que se reforça sob o cursor
//                    e com o foco do teclado;
//   pontoFixo        disco cheio (também o ponto que depende de outros);
//   pontoAberto      disco vazado: extremo aberto, como num intervalo.
// Cada um recebe a cor e a forma. A cor padrão vem dos papéis de cores.js:
// dado no ponto arrastável, a cor do texto no fixo e no aberto; a forma
// padrão é o disco.
//
// As medidas vêm das variáveis --applet-… de custom.scss.

import { CORES } from "../cores.js";

// Lê uma medida (número, em px ou opacidade) definida em :root.
function medida(nome) {
  const valor = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(nome),
  );

  if (!Number.isFinite(valor)) {
    console.warn(`[AppletsLivro] Medida não definida: ${nome}`);
  }

  return valor;
}

// Lidas uma vez, quando o bundle é carregado (como as cores). No toque,
// custom.scss alarga o anel.
const MEDIDAS = {
  raio: medida("--applet-ponto-raio"),
  anel: medida("--applet-anel-largura"),
  anelOpacidade: medida("--applet-anel-opacidade"),
  anelDestaque: medida("--applet-anel-opacidade-destaque"),
  captura: medida("--applet-captura"),
};

// Formas cheias (atributo face do JSXGraph): disco, quadrado, losango e
// triângulos. O fator corrige o tamanho para que a área fique parecida com
// a do disco.
const FORMAS_CHEIAS = { o: 1, "[]": 1.1, "<>": 1.4, "^": 1.6, v: 1.6, "<": 1.6, ">": 1.6 };

// Traços, só no ponto fixo: "|" e "-" marcam uma coordenada num eixo.
const TRACOS = ["|", "-", "x", "+"];

// Atributos da forma `nome`, entre as permitidas para o tipo de ponto.
//   "seta": a ponta de uma seta faz o papel do ponto (vetor com a ponta
//   arrastável). O ponto fica sem preenchimento e sem nome, centrado na ponta;
//   o arrastável mostra só o anel.
function forma(nome, permitidas) {
  if (!permitidas.includes(nome)) {
    console.warn(`[AppletsLivro] Forma de ponto não permitida aqui: ${nome}`);
    nome = "o";
  }

  if (nome === "seta") {
    return { face: "o", size: MEDIDAS.raio, fillOpacity: 0, highlightFillOpacity: 0, withLabel: false };
  }

  if (TRACOS.includes(nome)) {
    return { face: nome, size: MEDIDAS.raio + 1, strokeWidth: 2 };
  }

  return { face: nome, size: MEDIDAS.raio * FORMAS_CHEIAS[nome] };
}

const CHEIAS = Object.keys(FORMAS_CHEIAS);

// Ponto que o estudante arrasta (mouse, toque ou teclado).
export function pontoArrastavel(cor = CORES.dado, nomeForma = "o") {
  return {
    fixed: false,
    highlight: true,
    fillColor: cor,
    strokeColor: cor,
    fillOpacity: 1,
    // O anel é o contorno largo e translúcido; metade dele fica fora do disco.
    strokeWidth: MEDIDAS.anel,
    strokeOpacity: MEDIDAS.anelOpacidade,
    highlightFillColor: cor,
    highlightStrokeColor: cor,
    highlightFillOpacity: 1,
    highlightStrokeWidth: MEDIDAS.anel,
    highlightStrokeOpacity: MEDIDAS.anelDestaque,
    // Distância máxima, em px, para pegar o ponto. O padrão do JSXGraph é
    // 4 px com qualquer dispositivo; o dedo, menos preciso, ganha 2,5 vezes.
    precision: {
      mouse: MEDIDAS.captura,
      pen: MEDIDAS.captura,
      touch: 2.5 * MEDIDAS.captura,
    },
    // Entra na ordem do Tab; com foco, move-se pelas setas.
    tabindex: 0,
    // Cursor de mão e reforço do anel com o foco (custom.scss).
    cssClass: "applet-arrastavel",
    highlightCssClass: "applet-arrastavel",
    ...forma(nomeForma, [...CHEIAS, "seta"]),
  };
}

// Ponto fixo ou dependente de outros: forma cheia, sem anel.
export function pontoFixo(cor = CORES.texto, nomeForma = "o") {
  return {
    fixed: true,
    highlight: false,
    fillColor: cor,
    strokeColor: cor,
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 1,
    ...forma(nomeForma, [...CHEIAS, ...TRACOS, "seta"]),
    // Na ponta de uma seta, a própria ponta já é o ponto: nada mais aparece.
    ...(nomeForma === "seta" && { strokeOpacity: 0 }),
  };
}

// Extremo aberto: forma vazada. O miolo tem a cor do fundo do quadro, para
// que a linha que chega ao ponto não apareça dentro dele.
export function pontoAberto(cor = CORES.texto, nomeForma = "o") {
  return {
    fixed: true,
    highlight: false,
    fillColor: CORES.superfSuave,
    fillOpacity: 1,
    strokeColor: cor,
    strokeWidth: 2,
    ...forma(nomeForma, CHEIAS),
  };
}

// Afastamento do nome de uma seta, em px (y para cima): a caixa do texto
// fica a 4 px da seta, do lado pedido, em qualquer inclinação. O JSXGraph
// chama esta função com a própria seta. (O afastamento padrão cresce com o
// tamanho do texto, e um nome estreito numa seta íngreme encostava nela.)
function afastarNome(seta) {
  // Chamada também durante a criação do próprio nome.
  if (!seta.label) {
    return [0, 0];
  }

  const [, x1, y1] = seta.point1.coords.scrCoords;
  const [, x2, y2] = seta.point2.coords.scrCoords;
  const comprimento = Math.hypot(x2 - x1, y2 - y1) || 1;
  // Lado do nome: +1 à esquerda do sentido da seta, −1 à direita.
  const lado = String(seta.label.evalVisProp("position")).includes("right") ? -1 : 1;
  // Normal unitária do lado do nome (na tela, o y cresce para baixo).
  const nx = (lado * (y2 - y1)) / comprimento;
  const ny = (lado * (x2 - x1)) / comprimento;
  const [largura, altura] = seta.label.size;
  const distancia = (Math.abs(nx) * largura + Math.abs(ny) * altura) / 2 + 4;

  return [nx * distancia, ny * distancia];
}

// Seta (vetor): traço com ponta e, se houver, o nome no meio, do lado
// `lado` ("left" ou "right" do sentido da seta). A ponta tem o tamanho que
// casa com o ponto de forma "seta" posto nela.
//   board.create("arrow", [P, Q], seta(CORES.dado, { nome: "u" }));
export function seta(cor = CORES.dado, { nome = "", lado = "left", espessura = 2.5 } = {}) {
  return {
    fixed: true,
    highlight: false,
    strokeColor: cor,
    strokeWidth: espessura,
    lastArrow: { type: 2, size: 5 },
    name: nome,
    withLabel: nome !== "",
    label: {
      position: `0.5fr ${lado}`,
      anchorX: "middle",
      anchorY: "middle",
      distance: 0,
      offset: afastarNome,
    },
  };
}

// Traços prontos, por papel (cores.js). A espessura acompanha a
// importância: resultado, dado, apoio. Os atributos highlight* repetem as
// cores normais para que o objeto não mude de cor quando o mouse passa sobre
// ele (comportamento padrão do JSXGraph).
export const ESTILOS = {
  // Reta, segmento ou curva que é o resultado da ideia
  resultado: {
    strokeColor: CORES.resultado,
    strokeWidth: 3,
    highlightStrokeColor: CORES.resultado,
  },

  // Reta, segmento ou curva dada ou controlada pelo estudante
  dado: {
    strokeColor: CORES.dado,
    strokeWidth: 2.5,
    highlightStrokeColor: CORES.dado,
  },

  // Apoio: fino e tracejado (dash 2 = tracejado médio)
  apoio: {
    strokeColor: CORES.apoio,
    strokeWidth: 1.5,
    dash: 2,
    highlightStrokeColor: CORES.apoio,
  },

  // Erro ou contraexemplo: sem cor própria. Combina-se com o estilo do papel
  // do objeto, que mantém a cor: { ...ESTILOS.resultado, ...ESTILOS.alerta }.
  // Traço grosso e tracejado curto (dash 1); o texto de estado diz o que há.
  alerta: {
    strokeWidth: 3,
    dash: 1,
  },
};
