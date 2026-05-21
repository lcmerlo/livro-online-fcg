
export function aplicarDescricao(idElemento, idDescricao) {
  const elemento = document.getElementById(idElemento);
  const descricao = document.getElementById(idDescricao);

  if (!elemento || !descricao) return;

  elemento.setAttribute("aria-describedby", idDescricao);
}

export function criarStatusLive(idStatus, textoInicial = "") {
  const status = document.getElementById(idStatus);

  if (!status) return null;


  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = textoInicial;

  return status;
}

export function atualizarStatus(idStatus, texto) {
  const status = document.getElementById(idStatus);

  if (!status) return;

  status.textContent = texto;
}

export function tornarFocavel(elemento, label) {
  if (!elemento) return;

  elemento.setAttribute("tabindex", "0");

  if (label) {
    elemento.setAttribute("aria-label", label);
  }
}

export function aplicarAcessibilidadeBotao(idBotao, label) {
  const botao = document.getElementById(idBotao);

  if (!botao) return;

  if (label) {
    botao.setAttribute("aria-label", label);
  }
}