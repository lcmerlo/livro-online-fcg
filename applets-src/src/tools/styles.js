import { CORES } from "../cores.js";

export const estiloPontoManipulavel = {
  size: 5,
  strokeWidth: 2,
  strokeColor: CORES.manipulavel,
  fillColor: CORES.manipulavel,
  highlightStrokeColor: CORES.manipulavel,
  highlightFillColor: CORES.manipulavel,
  fixed: false,
};

export const estiloPontoFixo = {
  size: 4,
  strokeWidth: 2,
  strokeColor: CORES.texto,
  fillColor: CORES.superficie,
  highlightStrokeColor: CORES.texto,
  highlightFillColor: CORES.superficie,
  fixed: true,
};

export const estiloRetaPrincipal = {
  strokeColor: CORES.objetoPrincipal,
  strokeWidth: 3,
  highlightStrokeColor: CORES.objetoPrincipal,
};

export const estiloObjetoAuxiliar = {
  strokeColor: CORES.auxiliar,
  strokeWidth: 1.5,
  dash: 2,
  highlightStrokeColor: CORES.auxiliar,
};

export const estiloObjetoConstruido = {
  strokeColor: CORES.construido,
  strokeWidth: 2.5,
  highlightStrokeColor: CORES.construido,
};

export const estiloInvariante = {
  strokeColor: CORES.invariante,
  fillColor: CORES.invariante,
  strokeWidth: 2.5,
  highlightStrokeColor: CORES.invariante,
};

export const estiloErro = {
  strokeColor: CORES.erro,
  fillColor: CORES.erro,
  strokeWidth: 3,
  dash: 1,
  highlightStrokeColor: CORES.erro,
};