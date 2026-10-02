
export function conectarBotaoReset(idBotao, funcaoReset) {
  const botao = document.getElementById(idBotao);

  if (!botao || typeof funcaoReset !== "function") return;

  botao.addEventListener("click", () => {
    funcaoReset();
  });
}

export function alternarVisibilidade(objetos, visivel) {
  const lista = Array.isArray(objetos) ? objetos : [objetos];

  lista.forEach((objeto) => {
    if (!objeto) return;

    if (visivel) {
      objeto.showElement();
    } else {
      objeto.hideElement();
    }

    if (objeto.board && typeof objeto.board.update === "function") {
      objeto.board.update();
    }
  });
}

export function conectarBotaoAlternancia(
  idBotao,
  objetos,
  textoMostrar = "Mostrar",
  textoOcultar = "Ocultar"
) {
  const botao = document.getElementById(idBotao);

  if (!botao) return;

  let visivel = true;

  botao.textContent = textoOcultar;

  botao.addEventListener("click", () => {
    visivel = !visivel;
    alternarVisibilidade(objetos, visivel);
    botao.textContent = visivel ? textoOcultar : textoMostrar;
  });
}

export function conectarSlider(idSlider, funcaoAtualizar) {
  const slider = document.getElementById(idSlider);

  if (!slider || typeof funcaoAtualizar !== "function") return;

  slider.addEventListener("input", () => {
    funcaoAtualizar(Number(slider.value));
  });
}

