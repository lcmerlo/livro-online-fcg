import JXG from "jsxgraph";

import { CORES } from "./cores.js";
import { criarSegmento } from "./applets/segmento.js";

const applets = {
  segmento: criarSegmento,
};

const instancias = {};

function iniciarApplet(nome, id, opcoes = {}) {
  const criar = applets[nome];

  if (!criar) {
    console.warn(`[AppletsLivro] Applet desconhecido: ${nome}`);
    return null;
  }

  if (instancias[id]) {
    return instancias[id];
  }

  const instancia = criar({
    id,
    JXG,
    ...opcoes,
  });

  if (instancia) {
    instancias[id] = instancia;
  }

  return instancia;
}

function resetarApplet(id) {
  const instancia = instancias[id];

  if (!instancia || typeof instancia.reset !== "function") {
    console.warn(`[AppletsLivro] Applet sem reset: ${id}`);
    return;
  }

  instancia.reset();
}

function iniciarTodos() {
  document.querySelectorAll("[data-applet]").forEach((elemento) => {
    if (!elemento.id) {
      console.warn("[AppletsLivro] Applet sem id:", elemento);
      return;
    }

    iniciarApplet(elemento.dataset.applet, elemento.id, {
      dataset: elemento.dataset,
    });
  });
}

const AppletsLivro = {
  CORES,
  applets,
  instancias,
  iniciarApplet,
  iniciarTodos,
  resetarApplet,
};

window.AppletsLivro = AppletsLivro;

document.addEventListener("DOMContentLoaded", iniciarTodos);

export {
  CORES,
  applets,
  instancias,
  iniciarApplet,
  iniciarTodos,
  resetarApplet,
};
