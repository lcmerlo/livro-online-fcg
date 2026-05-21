import { cores } from "../cores.js";

export const estiloPontoManipulavel = {
  size: 5,
  strokeWidth: 2,
  strokeColor: cores.manipulavel,
  fillColor: cores.manipulavel,
  highlightStrokeColor: cores.manipulavel,
  highlightFillColor: cores.manipulavel,
  fixed: false,
};

export const estiloPontoFixo = {
  size: 4,
  strokeWidth: 2,
  strokeColor: cores.texto,
  fillColor: cores.superficie,
  highlightStrokeColor: cores.texto,
  highlightFillColor: cores.superficie,
  fixed: true,
};

export const estiloRetaPrincipal = {
  strokeColor: cores.objetoPrincipal,
  strokeWidth: 3,
  highlightStrokeColor: cores.objetoPrincipal,
};

export const estiloObjetoAuxiliar = {
  strokeColor: cores.auxiliar,
  strokeWidth: 1.5,
  dash: 2,
  highlightStrokeColor: cores.auxiliar,
};

export const estiloObjetoConstruido = {
  strokeColor: cores.construido,
  strokeWidth: 2.5,
  highlightStrokeColor: cores.construido,
};

export const estiloInvariante = {
  strokeColor: cores.invariante,
  fillColor: cores.invariante,
  strokeWidth: 2.5,
  highlightStrokeColor: cores.invariante,
};

export const estiloErro = {
  strokeColor: cores.erro,
  fillColor: cores.erro,
  strokeWidth: 3,
  dash: 1,
  highlightStrokeColor: cores.erro,
};

