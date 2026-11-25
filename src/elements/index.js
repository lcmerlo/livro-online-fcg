// Os objetos do livro para o JSXGraph: board.create('vector', [A, B], { name: '\\vec{u}' }),
// com a sintaxe de qualquer objeto nativo. Cada um reúne coisas que sempre se usam
// juntas. Um objeto novo precisa merecer o lugar: pelo menos dois applets precisam
// dele, ele significa uma ideia matemática só, e o que mais ele aceitar vai direto
// para o JSXGraph.

import { registerHandle } from './handle.js';
import { registerVectors } from './vector.js';
import { registerMarks } from './marks.js';

export function registerElements(JXG) {
  const names = new Set();
  const register = (name, create) => {
    JXG.registerElement(name, create);
    names.add(name.toLowerCase());
  };
  registerHandle(register, JXG);
  registerVectors(register, JXG);
  registerMarks(register, JXG);
  return names;
}
