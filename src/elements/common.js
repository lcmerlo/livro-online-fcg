// Pequenas funções usadas pelos objetos do livro.

export const evaluate = (value) => (typeof value === 'function' ? value() : value);

export const isPoint = (object) => typeof object?.X === 'function';

// Um par de números ou de funções, ou uma função que devolve o par -> par de coordenadas do JSXGraph.
export const coords = (source) => (typeof source === 'function' ? [() => source()[0], () => source()[1]] : source);

// Um ponto do board: ele mesmo, ou um ponto escondido nas coordenadas dadas.
export const asPoint = (board, source, attributes = {}) =>
  isPoint(source) ? source : board.create('point', coords(source), { visible: false, ...attributes });

export const positionOf = (source) => {
  if (isPoint(source)) return [source.X(), source.Y()];
  return typeof source === 'function' ? source() : source.map(evaluate);
};

// Um vetor dado como seta, função ou par -> as componentes dele.
export function componentsOf(vector) {
  if (typeof vector?.Direction === 'function') return vector.Direction();
  return typeof vector === 'function' ? vector() : vector.map(evaluate);
}

// Uma parte de um objeto composto aparece quando o objeto aparece e a condição dela vale.
export const visibleWith = (attributes, condition = true) => ({
  visible: () => evaluate(condition) !== false && (attributes.visible === undefined || evaluate(attributes.visible) !== false),
});
