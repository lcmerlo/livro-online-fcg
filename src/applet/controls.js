// Controles em HTML simples, ligados ao state: mexer num deles muda o valor, e
// qualquer mudança do valor, venha de onde vier, ajusta o controle. Aparecem na ordem
// do código, que é também a ordem do Tab. Cada um tem um nome fixo, em texto, para o
// leitor de tela; o que se vê pode ter fórmulas, escondidas dele.

import { parseNumber, plain, tex as texFormat, text as textFormat } from '../math/format.js';
import { iconButton, icons } from './icons.js';
import { drawSteady, drawTex, writeCaption } from './tex.js';

let groupCount = 0;
const evaluate = (v) => (typeof v === 'function' ? v() : v);
// Somas de passos decimais deixam restos (0.30000000000000004): fora com eles.
const tidy = (v) => Number(v.toFixed(10));

// ---- stepper: campo com ▲ e ▼ ----

// Os triângulos dos botões: ponta para cima aumenta, ponta para baixo diminui.
const triangle = (d) => `<svg viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
const triangles = { up: triangle('M5 .4 9.6 5.6H.4z'), down: triangle('M.4 .4h9.2L5 5.6z') };

// Um número para digitar, com ▲ e ▼ empilhados à direita, um sobre o outro (pedido de
// 2026-11-12). É a alternativa de quem escolheu os campos no painel de acessibilidade:
// para as coordenadas de um handle (access.js) e para o valor de um slider (abaixo).
// No teclado, as setas para cima e para baixo fazem o mesmo que os triângulos, e por
// isso eles ficam fora do caminho do Tab. Os triângulos são menores que os 24 px de um
// alvo: o próprio campo, que é maior, faz o mesmo (WCAG 2.5.8, exceção "equivalente");
// com "pontos maiores" no painel, crescem até os 24 px.
//   said        o que o número é, lido em voz alta: "a", "x da ponta de u"
//   label       o nome do campo, se for outro: "Valor de a"
//   shown()     o texto do campo: "1.5", "36°"
//   nudge(±1)   um passo para cima ou para baixo
//   enter(n)    o número digitado (parseNumber já leu)
//   watch(f)    chama f quando o valor muda por outro caminho
export function stepper({ said, label = said, shown, nudge, enter, watch, signal }) {
  const element = document.createElement('span');
  element.className = 'stepper';
  element.innerHTML = `<input type="text" role="spinbutton" autocomplete="off" spellcheck="false">
    <span class="stepper-arrows"><button type="button" tabindex="-1">${triangles.up}</button><button type="button" tabindex="-1">${triangles.down}</button></span>`;
  const input = element.querySelector('input');
  const [up, down] = element.querySelectorAll('button');
  input.setAttribute('aria-label', label);
  for (const [button, verb] of [[up, 'Aumentar'], [down, 'Diminuir']]) {
    button.setAttribute('aria-label', `${verb} ${said}`);
    button.title = verb;
  }

  const on = (target, type, handler) => target.addEventListener(type, handler, { signal });
  const show = () => {
    const value = shown();
    input.setAttribute('aria-valuetext', value);
    if (document.activeElement !== input) input.value = value;
  };
  const confirm = () => {
    const typed = parseNumber(input.value);
    if (typed !== null) enter(typed);
    input.value = shown();
  };

  on(up, 'click', () => nudge(1));
  on(down, 'click', () => nudge(-1));
  on(input, 'change', confirm);
  on(input, 'keydown', (event) => {
    if (event.key === 'Enter') confirm();
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      nudge(event.key === 'ArrowUp' ? 1 : -1);
      input.value = shown();
    }
  });
  on(input, 'blur', show);
  watch(show);
  show();
  return element;
}

// O <label> do HTML de um controle, com o caption à vista. Com fórmulas, o leitor de
// tela ouve o caption em texto (format.js: plain), e não o que o KaTeX desenhou.
function labelled(kind, caption, input) {
  const wrapper = document.createElement('label');
  wrapper.className = `control ${kind}`;
  const visible = document.createElement('span');
  writeCaption(visible, caption);
  if (caption.includes('$')) {
    visible.setAttribute('aria-hidden', 'true');
    input.setAttribute('aria-label', plain(caption));
  }
  return [wrapper, visible];
}

// pace(draw) devolve a função que pede a escrita de um número: durante uma animação,
// ela escreve menos vezes do que a figura se move. keepWidth(element, draw) desenha
// e, enquanto o leitor mexe, não deixa o número encolher (src/applet/applet.js).
// fields: o leitor escolheu os campos com ▲ e ▼ no painel de acessibilidade.
export function createControls({ state, place, signal, pace = (draw) => draw, keepWidth = (element, draw) => draw(), fields = false }) {
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal });

  // O campo de um slider: a alternativa a ele, para quem não arrasta ou quer um valor
  // exato. Só existe para quem a escolheu, e é montado a partir do próprio slider, sem
  // código no applet. slider traz o que o campo tira dele ({ spoken, min, max, step });
  // o resto é a opção `field` de addSlider. read e write convertem entre o valor
  // guardado e o que o leitor vê (voltas e graus, por exemplo); step é o passo dos ▲▼,
  // no valor guardado; unit vai depois do número, no campo ("36°"); e text, se houver,
  // escreve o número inteiro, em texto simples ("π/6"). O leitor digita do mesmo
  // jeito: parseNumber aceita 3/2, pi/6 e 36°.
  function sliderField(key, slider, { read = (v) => v, write = (v) => v, step, unit = '', text, digits = 2 }) {
    const { spoken, min, max } = slider;
    const limits = () => [evaluate(min), evaluate(max)];
    const clamp = (value) => Math.min(Math.max(value, limits()[0]), limits()[1]);
    // O passo dos ▲▼: o do campo, se dado; senão, o do slider ou, se ele for miúdo,
    // cerca de 1/40 do intervalo.
    const size = () => step ?? Math.max(slider.step, tidy(Math.ceil((limits()[1] - limits()[0]) / 40 / slider.step - 1e-9) * slider.step));
    return stepper({
      said: plain(spoken),
      label: `Valor de ${plain(spoken)}`,
      shown: () => (text ? text(read(state[key])) : textFormat.number(read(state[key]), digits) + evaluate(unit)),
      nudge: (direction) => {
        state[key] = clamp(tidy(Math.round((state[key] + direction * size()) / size()) * size()));
      },
      enter: (typed) => {
        state[key] = clamp(write(typed));
      },
      watch: (show) => state.on(show),
      signal,
    });
  }

  // Slider para o número state[key]. name é o nome dele em TeX ("a", "x"), como o do
  // handle e o do slider do JSXGraph; spoken, o que o leitor de tela diz ("ângulo x";
  // sem ele, o name em texto ou, se não sobrar nada, a key). tex(v) escreve o valor em
  // TeX, ao lado do trilho, e text(v), em texto simples, para o leitor de tela. Com os
  // campos, o que se vê é "a =" e o campo, sem o número repetido (pedido de
  // 2026-11-12). `field` ajusta o campo ({ read, write, step, unit, text, digits }) ou o
  // dispensa (false).
  function addSlider(key, { min = 0, max = 1, step = 0.1, name = key, spoken = plain(name) || key, tex = (v) => `${name} = ${texFormat.number(v)}`, text = (v) => textFormat.number(v), field = {}, part } = {}) {
    const wrapper = document.createElement('span');
    wrapper.className = 'control slider';
    const input = Object.assign(document.createElement('input'), { type: 'range', step });
    input.setAttribute('aria-label', plain(spoken));
    const readout = document.createElement('span');
    readout.className = 'control-value';
    readout.setAttribute('aria-hidden', 'true');
    wrapper.append(input, readout);
    const withField = fields && field !== false;
    if (withField) {
      readout.classList.add('is-name');
      drawTex(readout, `${name} =`);
      wrapper.append(sliderField(key, { spoken, min, max, step }, field));
    }

    let lastTex = null;
    const drawReadout = pace(() => {
      if (withField) return;
      const code = tex(state[key]);
      if (code !== lastTex) {
        lastTex = code;
        keepWidth(readout, () => drawSteady(readout, code));
      }
    });
    // O thumb acompanha o valor a cada frame; o número ao lado, no ritmo de pace.
    const sync = () => {
      const [low, high] = [evaluate(min), evaluate(max)];
      input.min = low;
      input.max = high;
      const value = Math.min(Math.max(state[key], low), high);
      if (value !== state[key]) state[key] = value;
      input.value = value;
      input.style.setProperty('--fraction', (input.value - low) / (high - low || 1));
      input.setAttribute('aria-valuetext', text(value));
      drawReadout();
    };

    on(input, 'input', () => {
      state[key] = Number(input.value);
    });
    state.on(sync);
    place(part).append(wrapper);
    sync();
    return input;
  }

  // Checkbox para o booleano state[key]: mostrar ou esconder alguma coisa. caption é o
  // texto à vista, com fórmulas entre cifrões: "mostrar a reta de $\vec{u}$".
  function addCheckbox(key, { caption = key, part } = {}) {
    const input = Object.assign(document.createElement('input'), { type: 'checkbox', checked: Boolean(state[key]) });
    const [wrapper, visible] = labelled('checkbox', caption, input);
    on(input, 'change', () => {
      state[key] = input.checked;
    });
    state.on((changed) => {
      if (changed === key) input.checked = Boolean(state[key]);
    });
    wrapper.append(input, visible);
    place(part).append(wrapper);
    return input;
  }

  // Radio (escolha exclusiva) para state[key]. options: [[value, caption], ...] ou
  // { value: caption }, com o caption à vista de cada opção; spoken é o nome do grupo,
  // que só se ouve.
  function addRadio(key, { options, spoken = '', part } = {}) {
    const pairs = Array.isArray(options) ? options : Object.entries(options);
    const group = document.createElement('span');
    group.className = 'control radio';
    group.setAttribute('role', 'radiogroup');
    if (spoken) group.setAttribute('aria-label', plain(spoken));
    const name = `control-radio-${++groupCount}`;
    const inputs = pairs.map(([value, caption]) => {
      const input = Object.assign(document.createElement('input'), { type: 'radio', name, checked: state[key] === value });
      const [wrapper, visible] = labelled('radio-option', caption, input);
      on(input, 'change', () => {
        if (input.checked) state[key] = value;
      });
      wrapper.append(input, visible);
      group.append(wrapper);
      return [value, input];
    });
    state.on((changed) => {
      if (changed === key) for (const [value, input] of inputs) input.checked = state[key] === value;
    });
    place(part).append(group);
    return group;
  }

  // Campo de texto para o número state[key], sempre à vista. Um slider não precisa
  // dele: quem prefere digitar escolhe os campos no painel de acessibilidade. Enter ou
  // sair do campo confirma; fora de [min, max], entra a ponta mais próxima; o que não
  // é número é desfeito. caption é o texto à vista antes do campo.
  function addNumberField(key, { caption = key, min = -Infinity, max = Infinity, digits = 2, part } = {}) {
    const input = Object.assign(document.createElement('input'), { type: 'text', autocomplete: 'off', spellcheck: false });
    // O teclado numérico do iPhone não tem o sinal de menos: valores negativos ficam com o completo.
    if (min >= 0) input.inputMode = 'decimal';
    const [wrapper, visible] = labelled('number', caption, input);
    const show = () => {
      input.value = textFormat.number(state[key], digits);
    };
    const confirm = () => {
      const value = parseNumber(input.value);
      if (value !== null) state[key] = Math.min(Math.max(value, min), max);
      show();
    };
    on(input, 'change', confirm);
    on(input, 'keydown', (event) => {
      if (event.key === 'Enter') confirm();
    });
    on(input, 'blur', show);
    state.on((changed) => {
      if (changed === key && document.activeElement !== input) show();
    });
    wrapper.append(visible, input);
    place(part).append(wrapper);
    show();
    return input;
  }

  // Um botão com o caption à vista ou, com `icon` (src/applet/icons.js), só com o
  // desenho: o caption passa a ser o nome lido e o que aparece ao passar o mouse. Como
  // nos outros controles, o caption pode ter fórmulas entre cifrões.
  function addButton(caption, action, { icon, part } = {}) {
    const element = icon ? iconButton(icon, plain(caption)) : Object.assign(document.createElement('button'), { type: 'button', className: 'applet-button' });
    if (!icon) {
      writeCaption(element, caption);
      if (caption.includes('$')) element.setAttribute('aria-label', plain(caption));
    }
    on(element, 'click', action);
    place(part).append(element);
    return element;
  }

  // Botão de animar e pausar; com menos movimento, ele avança um passo por toque.
  // captions troca o nome de cada desenho, lido e mostrado sob o cursor, como o caption
  // de addButton: { play: 'Animar', pause: 'Pausar', step: 'Avançar um passo' }.
  function addPlayButton(animation, { captions = {}, part } = {}) {
    const names = { play: 'Animar', pause: 'Pausar', step: 'Avançar um passo', ...captions };
    const element = addButton(names.play, () => animation.toggle(), { icon: 'play', part });
    const sync = () => {
      const kind = animation.stepped ? 'step' : animation.playing ? 'pause' : 'play';
      element.innerHTML = icons[kind];
      element.title = plain(names[kind]);
      element.setAttribute('aria-label', plain(names[kind]));
    };
    animation.on(sync);
    sync();
    return element;
  }

  return { addSlider, addCheckbox, addRadio, addNumberField, addButton, addPlayButton };
}
