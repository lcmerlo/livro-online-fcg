// applets-src/src/main.js
//
// Ponto de entrada do bundle dos applets (applets-livro.iife.js).
// O shortcode {{< applet >}} (components/applet.lua) gera, para cada applet:
//   <div id="…" data-applet="nome">   → quadro onde o JSXGraph desenha
//   <p id="…-status" role="status">   → descrição textual para leitores de tela
//   <button data-reset="…">           → botão "Reiniciar applet"
// O bloco ::: {.applet} (components/applet-bloco.lua), de um applet com
// várias partes, gera o mesmo, com data-applet no bloco que envolve as partes:
//   <div id="…" data-applet="nome">   → o bloco
//     <div id="…-<parte>" data-parte="<parte>">  → quadro ou leitura, onde o texto pôs
// Este arquivo encontra esses elementos e liga cada um ao seu applet.

import JXG from "jsxgraph";
// CSS do JSXGraph (navegação, textos, infobox). O Vite o extrai para
// applets-livro.css, carregado pelo shortcode junto com o bundle.
import "../node_modules/jsxgraph/distrib/jsxgraph.css";

import { CORES, paleta } from "./cores.js";

// Registro dos applets: o valor de data-applet no HTML → função que o cria.
// Cada arquivo de applets/ é um applet: o nome é o do arquivo, sem .js, e a
// função de criação é a exportação padrão (export default). Um applet novo
// entra no registro só por existir; tests/verificar-site.mjs usa a mesma regra.
const modulos = import.meta.glob("./applets/*.js", { eager: true, import: "default" });
const applets = Object.fromEntries(
  Object.entries(modulos).map(([caminho, criar]) => [
    caminho.slice("./applets/".length, -".js".length),
    criar,
  ]),
);

// Applets já criados, indexados pelo id do elemento. Evita criar o mesmo
// applet duas vezes e permite localizá-lo depois (por exemplo, no reset).
const instancias = {};

// Cria o applet `nome` no elemento de id `id` e devolve a instância
// (ou null, se o applet não existir no registro ou não puder ser criado).
// Cada função de criação recebe { id, JXG, ...opcoes }: dataset e partes.
function iniciarApplet(nome, id, opcoes = {}) {
  const criar = applets[nome];

  if (!criar) {
    console.warn(`[AppletsLivro] Applet desconhecido: ${nome}`);
    return null;
  }

  // Já iniciado: devolve a instância existente em vez de recriar o quadro.
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

// Volta o applet de id `id` ao estado inicial, usando o reset() que a
// própria instância fornece.
function resetarApplet(id) {
  const instancia = instancias[id];

  if (!instancia || typeof instancia.reset !== "function") {
    console.warn(`[AppletsLivro] Applet sem reset: ${id}`);
    return;
  }

  instancia.reset();
}

// Inicia todos os applets da página: todo elemento com data-applet.
// Os demais atributos data-* seguem como `dataset`, para configurar o applet.
// As partes que o capítulo pôs no bloco seguem como `partes`, do nome da
// parte para o id do elemento: { figura: "cl-figura", leitura: "cl-leitura" }.
// Uma parte ausente fica de fora: o capítulo decide o que mostrar.
function iniciarTodos() {
  document.querySelectorAll("[data-applet]").forEach((elemento) => {
    // Sem id, o JSXGraph não tem onde desenhar.
    if (!elemento.id) {
      console.warn("[AppletsLivro] Applet sem id:", elemento);
      return;
    }

    const partes = Object.fromEntries(
      [...elemento.querySelectorAll("[data-parte]")].map((parte) => [parte.dataset.parte, parte.id]),
    );

    iniciarApplet(elemento.dataset.applet, elemento.id, {
      dataset: elemento.dataset,
      partes,
    });
  });
}

// Procura os applets só depois que todo o HTML da página foi lido.
document.addEventListener("DOMContentLoaded", iniciarTodos);

// Delegação de eventos: um único ouvinte no documento atende todos os
// botões de reinício. closest() cobre cliques em elementos internos ao botão.
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-reset]");

  if (botao) {
    resetarApplet(botao.dataset.reset);
  }
});

// Exportações: no formato IIFE, ficam disponíveis no objeto global
// window.AppletsLivro (útil para testes no console do navegador, como
// AppletsLivro.paleta("blue-oi")).
export {
  CORES,
  paleta,
  applets,
  instancias,
  iniciarApplet,
  iniciarTodos,
  resetarApplet,
};
