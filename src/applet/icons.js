// Os desenhos dos botões dos applets. Um botão de ícone não tem texto à vista: o nome
// vai em aria-label, para o leitor de tela e o comando de voz, e em title, para quem
// passa o mouse.

const svg = (body) => `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  play: svg('<path d="M4 2.5v11l9-5.5z"/>'),
  pause: svg('<path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/>'),
  step: svg('<path d="M3 2.5v11l7.5-5.5zM11 2.5h2.5v11H11z"/>'),
  // Uma volta no sentido anti-horário: recomeçar.
  reset: svg('<path d="M8 3.25a4.75 4.75 0 1 1-4.3 2.73" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.4.9v4.7L5 3.25z"/>'),
  // A pessoa de braços abertos do cabeçalho (a fonte de ícones do site): as opções de
  // acessibilidade.
  access: '<i class="bi bi-universal-access" aria-hidden="true"></i>',
};

export function iconButton(icon, name, className = '') {
  const button = Object.assign(document.createElement('button'), {
    type: 'button',
    className: `applet-button icon ${className}`.trim(),
    title: name,
    innerHTML: icons[icon],
  });
  button.setAttribute('aria-label', name);
  return button;
}
