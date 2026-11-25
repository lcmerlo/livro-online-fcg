// Roda em toda página (filters/site.lua o põe), e por isso é pequeno.

import { watchScrollers } from './scrollers.js';

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
