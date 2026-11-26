// Roda em toda página (filters/applet.lua o põe), e por isso é pequeno: uma página sem
// applets e sem fórmulas comentadas não carrega mais nada além do painel de opções. Vem
// do livro-base (src/site/boot.js). O painel de acessibilidade está em toda página desde
// a fase 6 da migração (initSettings: os atalhos do Tab e o botão do cabeçalho); antes,
// só se abria pelo botão de cada applet.

import { watchScrollers } from './scrollers.js';
import { initSettings } from './settings.js';

initSettings();
watchScrollers();

// O Quarto dá aos links de anterior e próximo um nome sem o número do capítulo que
// eles mostram, e um comando de voz precisa bater com o que está na tela (WCAG 2.5.3).
document.querySelectorAll('.pagination-link[aria-label]').forEach((link) => link.removeAttribute('aria-label'));

// O nome que o Quarto deixa em inglês: o da busca, que só existe depois que a página
// carrega. A trilha de navegação, no alto da página, já vem do Quarto como "Caminho".
const translations = [['Search', 'Procurar']];
addEventListener('load', () => {
  for (const attribute of ['title', 'aria-label']) {
    for (const [english, portuguese] of translations) {
      document.querySelectorAll(`[${attribute}="${english}"]`).forEach((element) => element.setAttribute(attribute, portuguese));
    }
  }
});

// O botão de "modo de leitura" do Quarto é o ícone que recolhe o menu (decisão E4 do
// livro-base): com ele marcado, styles/page.scss leva o texto para o meio, como numa
// janela estreita. O Quarto marca o botão com a classe `reader`; o <html> acompanha, e
// o nome do botão diz o que ele faz agora. src/site/apply-prefs.html faz a mesma marca
// antes de a página aparecer, a partir do que o Quarto guardou.
const readerToggle = document.querySelector('#quarto-header .quarto-reader-toggle');
if (readerToggle) {
  const name = (collapsed) => {
    const text = collapsed ? 'Mostrar o sumário' : 'Recolher o sumário';
    readerToggle.title = text;
    readerToggle.setAttribute('aria-label', text);
  };
  readerToggle.setAttribute('role', 'button');
  name(document.documentElement.dataset.reader === 'on');
  new MutationObserver(() => {
    const collapsed = readerToggle.classList.contains('reader');
    if (collapsed) document.documentElement.dataset.reader = 'on';
    else delete document.documentElement.dataset.reader;
    name(collapsed);
    // Os quadros dos applets se refazem pela largura nova.
    dispatchEvent(new Event('resize'));
  }).observe(readerToggle, { attributes: true, attributeFilter: ['class'] });
  // Um link com role="button" também responde à barra de espaço.
  readerToggle.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      readerToggle.click();
    }
  });
}

// Dicas e soluções (filters/blocks.lua): abrir uma parte fecha as outras
// do grupo, e um segundo toque a recolhe. Um só listener para a página inteira.
document.addEventListener('click', ({ target }) => {
  const tab = target.closest?.('.reveal-tab');
  if (tab) {
    const group = tab.closest('.reveals');
    for (const other of tab.parentElement.children) {
      const open = other === tab && tab.getAttribute('aria-expanded') !== 'true';
      other.setAttribute('aria-expanded', String(open));
      group.querySelector(`[id="${other.getAttribute('aria-controls')}"]`).hidden = !open;
    }
    return;
  }

  // "Mais uma dica": mostra a próxima; o foco vai para ela, e o leitor de tela a lê.
  const next = target.closest?.('.reveal-next');
  if (next) {
    const total = Number(next.dataset.total);
    const waiting = [...next.parentElement.querySelectorAll(':scope > .reveal-step[hidden]')];
    const [shown] = waiting;
    shown.hidden = false;
    shown.tabIndex = -1;
    if (waiting.length === 1) next.remove();
    else next.textContent = `Mais uma dica (${total - waiting.length + 2} de ${total})`;
    shown.focus({ preventScroll: true });
  }
});

// No menu lateral, marca a seção que está na tela (tools/sidebar-sections.ts pôs as
// seções de cada capítulo lá). A seção atual é a última cujo título já passou do
// terço de cima da tela. O Quarto reescreve os endereços do menu, e por isso as
// seções desta página são reconhecidas pelo caminho, e não pelo texto do href.
const sectionLinks = [...document.querySelectorAll('.sidebar-sections a')].filter((link) => link.hash && link.pathname === location.pathname);
if (sectionLinks.length > 0) {
  const sections = sectionLinks.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  let scheduled = false;
  const mark = () => {
    scheduled = false;
    let current = -1;
    sections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top < innerHeight / 3) current = i;
    });
    sectionLinks.forEach((link, i) => {
      link.classList.toggle('active', i === current);
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(mark);
    }
  }, { passive: true });
  mark();

  // No celular, o menu cobre a página: escolhida a seção, ele se fecha.
  const sidebar = document.getElementById('quarto-sidebar');
  for (const link of sectionLinks) {
    link.addEventListener('click', () => {
      if (sidebar?.classList.contains('show')) document.querySelector('.quarto-btn-toggle')?.click();
    });
  }
}

// As fórmulas comentadas (filters/annotations.lua): só a página que as tem carrega o
// módulo que as arruma.
if (document.querySelector('.annotated')) {
  import('./annotations.js').then(({ drawAnnotations }) => drawAnnotations());
}

if (document.querySelector('.applet[data-applet]')) {
  import('../applet/runtime.js').then(({ startApplets }) => startApplets());
}
