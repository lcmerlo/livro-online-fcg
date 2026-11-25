// Os valores que o leitor controla (o número de um slider, uma checkbox marcada). Ler
// é state.a; escrever é state.a = 2, que redesenha os boards e avisa os listeners
// desse valor, venha a mudança de onde vier.

import { holdSteady } from '../math/format.js';

export function createState(initial, redraw) {
  const start = { ...initial };
  const values = { ...initial };
  const listeners = new Set();

  const notify = (key, isReset) => {
    for (const listener of listeners) listener(key, values[key], isReset);
  };

  const state = {
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      Object.assign(values, start);
      redraw();
      for (const key of Object.keys(values)) notify(key, true);
    },
    snapshot: () => ({ ...values }),
    restore(saved) {
      for (const key of Object.keys(values)) if (key in saved) state[key] = saved[key];
    },
  };

  for (const key of Object.keys(values)) {
    if (key in state) throw new Error(`state: "${key}" is a reserved name`);
    Object.defineProperty(state, key, {
      enumerable: true,
      get: () => values[key],
      set(value) {
        if (Object.is(values[key], value)) return;
        values[key] = value;
        redraw();
        notify(key, false);
      },
    });
  }
  return state;
}

// Anima state[key] entre min e max, a `speed` unidades por segundo. Só começa a pedido
// (o botão de animar) e para quando outra coisa muda o mesmo valor. mode: 'bounce' vai
// e volta; 'loop' recomeça; 'once' para no fim. Com menos movimento, cada toque avança
// um passo, sem movimento contínuo.
// steady (true, false ou uma função): enquanto a animação roda, os números são
// escritos de modo que as expressões não tremam (src/math/format.js, applet.js).
export function createAnimation(state, key, { min, max, speed = 1, mode = 'bounce', steps = 10, steady = true, reduced = () => false } = {}) {
  let frame = null;
  let lastTime = 0;
  let direction = 1;
  let writing = false;
  let holding = false;
  const listeners = new Set();

  const notify = () => listeners.forEach((listener) => listener(animation.playing));

  const hold = (on) => {
    if (on === holding) return;
    holding = on;
    holdSteady(on);
  };

  const write = (value) => {
    writing = true;
    try {
      state[key] = value;
    } finally {
      writing = false;
    }
  };

  // O próximo valor, e se a animação continua depois dele.
  function advance(value) {
    if (value <= max && value >= min) return [value, true];
    const edge = value > max ? max : min;
    if (mode === 'once') return [edge, false];
    if (mode === 'loop') return [value > max ? min : max, true];
    direction = -direction;
    return [edge, true];
  }

  function stop() {
    frame = null;
    hold(false);
    notify();
  }

  const wantsSteady = () => Boolean(typeof steady === 'function' ? steady() : steady);

  function tick(now) {
    // No máximo 50 ms por frame: depois de uma aba escondida, o valor não salta.
    const seconds = Math.min(now - lastTime, 50) / 1000;
    lastTime = now;
    hold(wantsSteady());
    const [value, goesOn] = advance(state[key] + direction * speed * seconds);
    write(value);
    // Escrever o valor pode ter pausado a animação (um listener que reinicia, por exemplo).
    if (frame === null) return;
    if (goesOn) frame = requestAnimationFrame(tick);
    else stop();
  }

  const animation = {
    play() {
      if (frame !== null) return;
      if (mode === 'once' && state[key] >= max) write(min);
      hold(wantsSteady());
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
      notify();
    },
    pause() {
      if (frame === null) return;
      cancelAnimationFrame(frame);
      stop();
    },
    step() {
      if (mode === 'once' && state[key] >= max) return write(min);
      write(advance(state[key] + (direction * (max - min)) / steps)[0]);
    },
    toggle() {
      if (reduced()) animation.step();
      else if (animation.playing) animation.pause();
      else animation.play();
    },
    get playing() {
      return frame !== null;
    },
    get stepped() {
      return reduced();
    },
    // Os números estão sendo estabilizados agora.
    get steady() {
      return holding;
    },
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  state.on((changed, _, isReset) => {
    if (changed !== key) return;
    if (isReset) direction = 1;
    if (isReset || !writing) animation.pause();
  });

  return animation;
}
