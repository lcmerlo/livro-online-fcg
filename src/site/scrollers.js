// Uma fórmula ou tabela larga rola dentro da coluna, e precisa estar ao alcance do
// teclado para rolar (WCAG 2.1.1). Só o que de fato transborda vira parada do Tab.

export function keepReachable(element) {
  if (element.scrollWidth > element.clientWidth + 1) element.tabIndex = 0;
  else element.removeAttribute('tabindex');
}

export function watchScrollers() {
  const checkAll = () => document.querySelectorAll('.katex-display, main table, main pre, div.live').forEach(keepReachable);
  addEventListener('load', checkAll);
  addEventListener('resize', checkAll);
  document.addEventListener('prefs-change', () => requestAnimationFrame(checkAll));
}
