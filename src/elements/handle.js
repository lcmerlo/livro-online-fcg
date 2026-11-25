// handle: o ponto que o leitor move. Um comando para o que sempre anda junto: a
// aparência que diz "isto se move", uma área de captura generosa, o teclado, um nome
// para o leitor de tela, a permanência dentro do board, o reset e as alternativas
// ao arraste.
//   board.create('handle', [1, 2], { name: 'A' });
//   board.create('handle', [1, 2, line], { name: 'P' });      // preso a uma reta ou curva
// color, face (a do JSXGraph: 'o', '[]', '<>'..., com o tamanho acertado para a área
// do disco), arrowTip (a ponta de um vetor: só o anel, sem o disco e sem o nome à
// vista), step (o passo dos botões do campo),
// spoken (o nome para o leitor de tela; sem ele, vem de `name`), caption (o nome à
// vista antes dos campos das coordenadas, em "P = (..., ...)"; sem ele, $name$).
//
// A malha padrão: um ponto livre se prende aos décimos, e as coordenadas dele são
// números como 1.3 e -0.5, que as expressões escrevem exatos (pedido de 2026-11-12).
// Quem escreve snapToGrid decide: snapToGrid: false solta o ponto; snapToGrid: true,
// com snapSizeX e snapSizeY, escolhe outra malha (a do JSXGraph é a dos inteiros).

import { plain } from '../math/format.js';

const tenths = { snapToGrid: true, snapSizeX: 0.1, snapSizeY: 0.1 };

export function registerHandle(register) {
  register('handle', (board, parents, { color, face, arrowTip = false, spoken, step, caption, name = '', ...attributes }) => {
    const withLabel = Boolean(name) && !arrowTip;
    const type = parents.length === 3 ? 'glider' : 'point';
    const choosesGrid = Object.keys(attributes).some((key) => key.toLowerCase() === 'snaptogrid');
    const grid = type === 'point' && !choosesGrid ? tenths : {};
    const handle = board.create(type, parents, { ...board.theme.handle(color, { face, arrowTip }), ...grid, name, withLabel, ...attributes });

    handle.spokenName = spoken ?? (plain(name) || 'ponto');
    handle.caption = caption ?? (name ? `$${name}$` : handle.spokenName);
    handle.step = step;
    handle.start = [handle.X(), handle.Y()];
    board.handles.push(handle);

    // Leitor de tela: o que isto é; e as setas vão para o ponto, não para a navegação.
    handle.rendNode?.setAttribute('role', 'application');
    handle.rendNode?.setAttribute('aria-roledescription', type === 'glider' ? 'ponto restrito' : 'ponto livre');
    handle.rendNode?.setAttribute('aria-label', `${handle.spokenName}. Use as setas para mover.`);
    return handle;
  });
}
