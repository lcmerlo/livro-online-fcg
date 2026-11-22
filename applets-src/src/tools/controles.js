// applets-src/src/tools/controles.js
//
// Controles dos applets, em HTML, ligados ao estado (tools/estado.js): mexer
// num controle muda o valor no estado, e uma mudança no estado, venha de
// onde vier (outro controle, a animação, o reinício), acerta o controle.
//   criarFaixa          faixa (<input type="range">) para um número;
//   criarCaixa          caixa de seleção para um valor verdadeiro ou falso;
//   criarCampo          campo em que se digita um número;
//   criarBotao          botão com uma ação qualquer;
//   criarBotaoAnimacao  botão Animar/Pausar de uma animação (criarAnimacao).
//
// Onde ficam: o primeiro argumento, `onde`, é o id de uma parte .controles
// do bloco ::: {.applet} (components/applet-bloco.lua) ou o id do próprio
// applet. Com o id do applet, os controles ficam logo abaixo do quadro, num
// contêiner criado aqui, antes do texto de estado; assim o applet de um
// quadro continua no shortcode {{< applet >}}, e um capítulo que não
// escreveu a parte .controles não perde os controles. Uso:
//   const onde = partes.controles ?? id;
//   criarFaixa(onde, estado, "a", { min: -2, max: 2, passo: 0.1, nome: "a",
//     tex: (a) => `a = ${tex.numero(a)}` });
//   criarBotaoAnimacao(onde, animacao);
// Os controles aparecem na ordem do código, que é também a da tecla Tab, e
// passam para a linha de baixo quando não cabem (custom.scss).
//
// Leitor de tela: cada controle tem um nome fixo, em texto simples (nome);
// o que se vê pode ter fórmulas (tex, ou $…$ no rotulo), que o leitor de
// tela não lê. O valor da faixa é lido em texto simples (texto).
//
// Adaptado de lib/ui.js do JSX-quarto, com estas diferenças: campo de texto
// que aceita 1.5 e 1,5 (e não type="number", cujo separador decimal muda com
// o navegador e o idioma da página); nome fixo na faixa e no botão (lá, o
// nome da faixa mudava a cada valor, e o botão usava aria-pressed); a faixa
// na cor do papel dado; sem função de painel; nomes em português.

import { numero } from "./formatar.js";
import { desenharTex } from "./leitura.js";

// Contêiner padrão de cada applet: id do applet → div.applet-controles.
const padroes = new Map();

// Elemento onde os controles de `onde` ficam (ver o início do arquivo), ou
// null, com um aviso, se não houver nada com esse id na página.
function lugar(onde) {
  const elemento = onde ? document.getElementById(onde) : null;

  if (!elemento) {
    console.warn(`[AppletsLivro] Lugar dos controles não encontrado: ${onde}`);
    return null;
  }

  if (elemento.classList.contains("applet-controles")) {
    return elemento;
  }

  if (!padroes.has(onde)) {
    const conteiner = document.createElement("div");
    conteiner.className = "applet-controles";

    // No shortcode, arranjo="centro" centraliza o quadro e os controles.
    if (elemento.classList.contains("centro")) {
      conteiner.classList.add("centro");
    }

    const status = document.getElementById(`${onde}-status`);

    if (status) {
      status.before(conteiner);
    } else if (elemento.classList.contains("applet-jxg")) {
      // Dentro do quadro, o JSXGraph os apagaria.
      elemento.after(conteiner);
    } else {
      elemento.append(conteiner);
    }

    padroes.set(onde, conteiner);
  }

  return padroes.get(onde);
}

// Escreve o rótulo visível, com as fórmulas entre $…$ desenhadas pelo
// KaTeX, e dá à entrada o nome que o leitor de tela lê. Sem fórmula, o
// próprio rótulo serve de nome; com fórmula, vale `nome`, em texto simples,
// e o rótulo fica escondido do leitor de tela.
function rotular(entrada, visivel, rotulo, nome) {
  const pedacos = rotulo.split(/\$([^$]+)\$/);

  pedacos.forEach((pedaco, i) => {
    if (i % 2 === 0) {
      visivel.append(pedaco);
    } else {
      const formula = document.createElement("span");
      desenharTex(formula, pedaco);
      visivel.append(formula);
    }
  });

  const temFormula = pedacos.length > 1;

  if (!rotulo && !nome) {
    console.warn("[AppletsLivro] Controle sem rótulo e sem nome");
  } else if (temFormula && !nome) {
    console.warn(`[AppletsLivro] Controle com fórmula no rótulo e sem nome: ${rotulo}`);
  }

  if (nome || temFormula) {
    entrada.setAttribute("aria-label", nome || pedacos.join(""));
    visivel.setAttribute("aria-hidden", "true");
  }
}

// Faixa para o número estado[chave], de min a max, de passo em passo (as
// setas do teclado andam um passo). nome: o que o leitor de tela lê,
// sempre o mesmo (ex.: "a"). tex(valor): o que aparece ao lado, em TeX (ex.:
// a = 1.5); texto(valor): o valor lido pelo leitor de tela, em texto simples.
// Devolve o <input>, ou null.
export function criarFaixa(onde, estado, chave, { min = 0, max = 1, passo = 0.1, nome = "", tex = null, texto = numero } = {}) {
  const conteiner = lugar(onde);
  if (!conteiner) return null;

  if (!nome) {
    console.warn(`[AppletsLivro] Faixa de "${chave}" sem nome`);
  }

  const caixa = document.createElement("span");
  caixa.className = "applet-controle applet-faixa";

  const entrada = document.createElement("input");
  entrada.type = "range";
  entrada.min = min;
  entrada.max = max;
  entrada.step = passo;
  entrada.setAttribute("aria-label", nome);
  caixa.append(entrada);

  const valor = tex ? document.createElement("span") : null;
  let ultimoTex = null;

  if (valor) {
    valor.className = "applet-valor";
    valor.setAttribute("aria-hidden", "true");
    caixa.append(valor);
  }

  function acertar() {
    const v = estado[chave];
    entrada.value = v;
    // Até onde vai o trecho grosso do trilho (custom.scss).
    entrada.style.setProperty("--fracao", (entrada.value - min) / (max - min || 1));
    entrada.setAttribute("aria-valuetext", texto(v));

    if (valor) {
      const codigo = tex(v);

      // Durante a animação, o valor muda a cada quadro; o TeX, nem sempre.
      if (codigo !== ultimoTex) {
        ultimoTex = codigo;
        desenharTex(valor, codigo);
      }
    }
  }

  entrada.addEventListener("input", () => {
    estado[chave] = Number(entrada.value);
  });
  estado.on((mudou) => {
    if (mudou === chave) acertar();
  });

  conteiner.append(caixa);
  acertar();
  return entrada;
}

// Caixa de seleção para estado[chave] (verdadeiro ou falso), como mostrar
// ou esconder um objeto. rotulo: o texto ao lado, que pode ter fórmulas
// entre $…$; nome: o que o leitor de tela lê, obrigatório se houver fórmula.
// Devolve o <input>, ou null.
export function criarCaixa(onde, estado, chave, { rotulo = "", nome = "" } = {}) {
  const conteiner = lugar(onde);
  if (!conteiner) return null;

  // O <label> em volta faz o clique no texto marcar a caixa.
  const caixa = document.createElement("label");
  caixa.className = "applet-controle applet-caixa";

  const entrada = document.createElement("input");
  entrada.type = "checkbox";
  entrada.checked = Boolean(estado[chave]);

  const visivel = document.createElement("span");
  rotular(entrada, visivel, rotulo, nome);

  entrada.addEventListener("change", () => {
    estado[chave] = entrada.checked;
  });
  estado.on((mudou) => {
    if (mudou === chave) entrada.checked = Boolean(estado[chave]);
  });

  caixa.append(entrada, visivel);
  conteiner.append(caixa);
  return entrada;
}

// Campo em que se digita o número estado[chave]; aceita 1.5 e 1,5 e mostra
// o valor com numero() de tools/formatar.js, com até `casas` decimais. O
// valor entra com Enter ou ao sair do campo; fora de [min, max], entra a
// ponta mais próxima; um texto que não é número é desfeito. rotulo e nome,
// como na caixa de seleção. Devolve o <input>, ou null.
export function criarCampo(onde, estado, chave, { rotulo = "", nome = "", min = -Infinity, max = Infinity, casas = 2 } = {}) {
  const conteiner = lugar(onde);
  if (!conteiner) return null;

  const caixa = document.createElement("label");
  caixa.className = "applet-controle applet-campo";

  const entrada = document.createElement("input");
  entrada.type = "text";
  entrada.autocomplete = "off";
  entrada.spellcheck = false;
  // Teclado numérico no celular. O do iPhone não tem o sinal de menos:
  // quando o valor pode ser negativo, fica o teclado comum.
  if (min >= 0) {
    entrada.inputMode = "decimal";
  }

  const visivel = document.createElement("span");
  rotular(entrada, visivel, rotulo, nome);

  const mostrar = () => {
    entrada.value = numero(estado[chave], casas);
  };

  function confirmar() {
    const digitado = entrada.value.trim().replace(",", ".").replace("−", "-");
    const lido = Number(digitado);

    if (digitado !== "" && Number.isFinite(lido)) {
      estado[chave] = Math.min(Math.max(lido, min), max);
    }

    mostrar();
  }

  entrada.addEventListener("change", confirmar);
  entrada.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") confirmar();
  });
  // Sem digitar nada, sair do campo mostra o valor atual (que pode ter
  // mudado com o foco no campo, pela animação, por exemplo).
  entrada.addEventListener("blur", mostrar);
  // Com o foco no campo, o que o estudante digita não é apagado.
  estado.on((mudou) => {
    if (mudou === chave && document.activeElement !== entrada) mostrar();
  });

  caixa.append(visivel, entrada);
  conteiner.append(caixa);
  mostrar();
  return entrada;
}

// Botão com uma ação qualquer, com a aparência do "Reiniciar applet".
// Devolve o <button>, ou null.
export function criarBotao(onde, rotulo, acao) {
  const conteiner = lugar(onde);
  if (!conteiner) return null;

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "applet-botao";
  botao.textContent = rotulo;
  botao.addEventListener("click", acao);

  conteiner.append(botao);
  return botao;
}

// Símbolos de tocar e pausar, em SVG (não dependem de uma fonte que os tenha).
const SIMBOLOS = {
  tocar: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 9 5 2 9Z"/></svg>',
  pausar: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2.3v8H2ZM5.7 1H8v8H5.7Z"/></svg>',
};

// Botão Animar/Pausar de uma animação (criarAnimacao, tools/estado.js). Só
// o texto muda; o leitor de tela lê "Animar" ou "Pausar", e não o símbolo.
// Devolve o <button>, ou null.
export function criarBotaoAnimacao(onde, animacao, { tocar = "Animar", pausar = "Pausar" } = {}) {
  const botao = criarBotao(onde, "", () => animacao.alternar());
  if (!botao) return null;

  function acertar() {
    const tocando = animacao.tocando;
    botao.innerHTML = tocando ? SIMBOLOS.pausar : SIMBOLOS.tocar;
    botao.append(tocando ? pausar : tocar);
  }

  animacao.on(acertar);
  acertar();
  return botao;
}
