// As preferências do leitor. Ficam guardadas no navegador e viram atributos data-* no
// <html>, para o CSS reagir a elas; src/site/apply-prefs.html repete isso antes de a
// página aparecer. Uma preferência em que ninguém mexeu simplesmente não existe.

const storageKey = 'book-prefs';

export const prefs = {
  tapMove: 'Tocar no ponto e depois no destino',
  fields: 'Campos para digitar os pontos e os valores',
  bigTargets: 'Pontos maiores e mais fáceis de pegar',
  describe: 'Mostrar a descrição em texto do que muda',
  reduceMotion: 'Reduzir movimento',
  contrast: 'Contraste alto',
  wideSpacing: 'Mais espaço entre as linhas',
  textSize: 'Tamanho do texto',
};

// O que cada preferência segue enquanto o leitor não escolhe.
const systemDefaults = {
  reduceMotion: '(prefers-reduced-motion: reduce)',
  contrast: '(prefers-contrast: more)',
};

// Onde o localStorage está bloqueado, as escolhas valem até a página ser fechada.
let unsaved = {};

function read() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? {};
  } catch {
    return unsaved;
  }
}

function write(values) {
  unsaved = values;
  try {
    localStorage.setItem(storageKey, JSON.stringify(values));
  } catch {}
}

export function getPref(key) {
  const saved = read()[key];
  if (saved !== undefined) return saved;
  return systemDefaults[key] && matchMedia(systemDefaults[key]).matches ? 'on' : undefined;
}

export const isOn = (key) => getPref(key) === 'on';

export function setPref(key, value) {
  const values = read();
  if (value === undefined) {
    delete values[key];
    delete document.documentElement.dataset[key];
  } else {
    values[key] = value;
    document.documentElement.dataset[key] = value;
  }
  write(values);
  document.dispatchEvent(new CustomEvent('prefs-change', { detail: { key } }));
}

export function resetPrefs() {
  for (const key of Object.keys(read())) setPref(key, undefined);
}
