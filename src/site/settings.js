// O painel de acessibilidade, ao alcance de qualquer página: o botão do cabeçalho
// (de _quarto.yml) e a primeira parada do Tab. As escolhas valem na hora e ficam
// guardadas. Sem JavaScript, o botão é um link comum para a página que explica as opções.

import { getPref, isOn, prefs, resetPrefs, setPref } from './prefs.js';

const groups = [
  {
    title: 'Para mover os pontos e mudar os valores dos applets',
    note: 'O teclado funciona sempre: Tab escolhe o ponto ou a faixa de valores; as setas movem o ponto ou mudam o valor.',
    options: [
      { key: 'tapMove', hint: 'Sem arrastar: toque no ponto e, em seguida, no lugar para onde ele deve ir.' },
      { key: 'fields', hint: 'Abaixo de cada applet, as coordenadas de cada ponto; ao lado de cada faixa de valores, o valor dela. Dá para digitar, ou ajustar com ▲ e ▼.' },
      { key: 'bigTargets' },
    ],
  },
  {
    title: 'Para acompanhar os applets',
    options: [
      { key: 'describe', hint: 'Um texto abaixo do applet diz o que está na figura. O leitor de tela já o recebe.' },
      { key: 'reduceMotion', hint: 'As animações avançam em passos, sem movimento contínuo.' },
    ],
  },
  {
    title: 'Para ler',
    options: [{ key: 'contrast' }, { key: 'wideSpacing' }],
  },
];

const textSizes = [['100', 'Normal'], ['115', 'Grande'], ['130', 'Maior'], ['150', 'Muito grande']];

function checkbox({ key, hint }) {
  const hintId = `settings-${key}-hint`;
  return `<label class="settings-option">
    <input type="checkbox" data-pref="${key}" ${hint ? `aria-describedby="${hintId}"` : ''}>
    <span>${prefs[key]}${hint ? `<small id="${hintId}">${hint}</small>` : ''}</span>
  </label>`;
}

const groupHtml = ({ title, note, options }) => `<fieldset>
  <legend>${title}</legend>
  ${options.map(checkbox).join('')}
  ${note ? `<p class="settings-note">${note}</p>` : ''}
</fieldset>`;

const sizeHtml = `<fieldset>
  <legend>${prefs.textSize}</legend>
  <div class="settings-sizes">
    ${textSizes.map(([value, label]) => `<label><input type="radio" name="settings-text-size" data-pref="textSize" value="${value}"> ${label}</label>`).join('')}
  </div>
</fieldset>`;

function buildDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'settings';
  dialog.setAttribute('aria-labelledby', 'settings-title');
  dialog.innerHTML = `<form method="dialog">
    <h2 id="settings-title">Acessibilidade</h2>
    <p>Estas opções ficam guardadas neste navegador e valem para todas as páginas. O padrão é a apresentação mais enxuta.</p>
    ${groups.map(groupHtml).join('')}
    ${sizeHtml}
    <div class="settings-actions">
      <button type="button" class="settings-reset">Restaurar o padrão</button>
      <button type="submit" class="settings-close">Fechar</button>
    </div>
  </form>`;

  const inputs = [...dialog.querySelectorAll('[data-pref]')];

  const sync = () => {
    for (const input of inputs) {
      const value = getPref(input.dataset.pref);
      input.checked = input.type === 'radio' ? input.value === (value ?? '100') : isOn(input.dataset.pref);
    }
  };

  dialog.addEventListener('change', ({ target: { dataset, type, value, checked } }) => {
    if (!dataset.pref) return;
    if (type === 'radio') setPref(dataset.pref, value === '100' ? undefined : value);
    else setPref(dataset.pref, checked ? 'on' : 'off');
  });
  dialog.querySelector('.settings-reset').addEventListener('click', () => {
    resetPrefs();
    sync();
  });
  // Um clique no fundo escurecido chega ao próprio dialog.
  dialog.addEventListener('click', ({ target }) => {
    if (target === dialog) dialog.close();
  });

  dialog.sync = sync;
  document.body.append(dialog);
  return dialog;
}

let dialog = null;

export function openSettings() {
  dialog ??= buildDialog();
  dialog.sync();
  dialog.showModal();
}

function addSkipLinks() {
  const nav = document.createElement('nav');
  nav.className = 'skip-links';
  nav.setAttribute('aria-label', 'Atalhos');
  nav.innerHTML = '<a href="#quarto-document-content">Ir para o conteúdo</a> <button type="button">Abrir as opções de acessibilidade</button>';
  nav.querySelector('button').addEventListener('click', openSettings);
  document.body.prepend(nav);
  // Desde o 1.11, o Quarto põe o próprio atalho, "Pular para o conteúdo principal",
  // que repetiria o primeiro deste (questão E17 do livro-base).
  document.getElementById('quarto-skip-link')?.remove();
}

export function initSettings() {
  addSkipLinks();
  for (const tool of document.querySelectorAll('#quarto-header a[href$="acessibilidade.html"]')) {
    tool.setAttribute('role', 'button');
    tool.setAttribute('aria-haspopup', 'dialog');
    // O Quarto marca os links do cabeçalho de um livro como a página atual, em toda página.
    tool.removeAttribute('aria-current');
    tool.classList.remove('active');
    // O nome vem do texto escondido ao lado do ícone. O Quarto dá ao ícone o mesmo nome
    // (role="img", com o aria-label de _quarto.yml), e o leitor de tela diria
    // "Acessibilidade Acessibilidade". Sem JavaScript, o nome repetido fica: sem o
    // aria-label, o ícone seria uma imagem sem nome.
    tool.querySelector('.bi')?.setAttribute('aria-hidden', 'true');
    tool.addEventListener('click', (event) => {
      event.preventDefault();
      openSettings();
    });
    // Um link com role="button" também precisa responder à barra de espaço.
    tool.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        openSettings();
      }
    });
  }
  // A página que explica as opções tem um botão que abre o painel.
  document.querySelector('[data-open-settings]')?.addEventListener('click', openSettings);
}
