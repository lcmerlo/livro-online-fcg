// Transforma os valores do CSS (styles/tokens.scss) em atributos do JSXGraph. O applet
// diz um role ou uma cor, e nunca escreve um valor:
//   { role: 'support' }            uma linha de apoio, tracejada
//   { role: 'result' }             o foco da ideia
//   { color: 'blue-oi' }           qualquer cor de _brand.yml, para testes
// Os valores são lidos no container do próprio board, e assim um trecho da página
// pode trocá-los; são lidos de novo quando uma preferência muda (o applet é remontado).

const roles = {
  given: { weight: 'normal' },
  result: { weight: 'strong' },
  support: { weight: 'thin', dash: 2 },
  // Um erro ou contraexemplo não tem cor própria: traços grossos e curtos.
  alert: { weight: 'strong', dash: 1 },
};

// As faces (o face do JSXGraph) cheias, com o fator que deixa a área perto da do
// disco, e as de traço.
const filledFaces = { o: 1, '[]': 1.1, '<>': 1.4, '^': 1.6, v: 1.6, '<': 1.6, '>': 1.6 };
const strokeFaces = ['|', '-', 'x', '+'];
// Os outros nomes que o JSXGraph aceita para as mesmas faces (JXG.normalizePointFace):
// face: 'square' recebe o mesmo acerto de face: '[]'.
const faceNames = { circle: 'o', square: '[]', diamond: '<>', triangleup: '^', A: '^', a: '^', triangledown: 'v', triangleleft: '<', triangleright: '>', cross: 'x', plus: '+', divide: '|', minus: '-' };

export function createTheme(element) {
  const css = getComputedStyle(element);
  const token = (name) => css.getPropertyValue(`--${name}`).trim();
  const measure = (name) => parseFloat(token(name));
  const color = (name = 'text') => token(`color-${name}`) || token(`brand-${name}`) || name;
  const width = (weight = 'normal') => (typeof weight === 'number' ? weight : measure(`stroke-${weight}`));

  // O face e o tamanho que dá a ele a área do disco, com qualquer um dos nomes.
  function faceStyle(face, radius = measure('point-radius')) {
    const known = faceNames[face] ?? face;
    if (strokeFaces.includes(known)) return { face, size: radius + 1, strokeWidth: 2 };
    return { face, size: radius * (filledFaces[known] ?? 1) };
  }

  // Um handle: a forma cheia e um anel translúcido, que se firma sob o
  // cursor e com o foco do teclado; o anel também aumenta a área de captura. Na ponta
  // de um vetor (arrowTip), o disco some e fica só o anel: quem se vê é a seta.
  function handle(colorName = 'given', { face = 'o', arrowTip = false } = {}) {
    const value = color(colorName);
    const capture = measure('capture-radius');
    return {
      fixed: false,
      highlight: true,
      fillColor: value,
      strokeColor: value,
      fillOpacity: 1,
      strokeWidth: measure('ring-width'),
      strokeOpacity: measure('ring-opacity'),
      highlightFillColor: value,
      highlightStrokeColor: value,
      highlightFillOpacity: 1,
      highlightStrokeWidth: measure('ring-width'),
      highlightStrokeOpacity: measure('ring-opacity-active'),
      precision: { mouse: capture, pen: capture, touch: 2.5 * capture },
      tabindex: 0,
      cssClass: 'handle',
      highlightCssClass: 'handle',
      ...(arrowTip ? { face: 'o', size: measure('point-radius'), fillOpacity: 0, highlightFillOpacity: 0 } : faceStyle(face)),
    };
  }

  // Uma figura que o leitor arrasta inteira (translatable). O sinal de que ela se
  // move (o traço engrossa, a região escurece) é do CSS, em .movable: o highlight do
  // próprio JSXGraph redesenha uma seta e tira dela o foco do teclado.
  const movable = () => ({
    fixed: false,
    highlight: false,
    hasInnerPoints: true,
    tabindex: 0,
    cssClass: 'movable',
    highlightCssClass: 'movable',
  });

  // Um ponto que não se move: cheio, ou vazado para a ponta aberta de um intervalo.
  function point({ color: colorName = 'text', face = 'o', open = false } = {}) {
    const value = color(colorName);
    return {
      fillColor: open ? color('board') : value,
      strokeColor: value,
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: open ? 2 : 1,
      ...faceStyle(face),
    };
  }

  function stroke({ role = 'given', color: colorName, weight } = {}) {
    const style = roles[role] ?? roles.given;
    const value = color(colorName ?? (role === 'alert' ? 'text' : role));
    return {
      strokeColor: value,
      highlightStrokeColor: value,
      strokeWidth: width(weight ?? style.weight),
      ...(style.dash && { dash: style.dash }),
    };
  }

  const fill = ({ role = 'given', color: colorName } = {}) => {
    const value = color(colorName ?? role);
    return {
      ...stroke({ role, color: colorName, weight: 'thin' }),
      fillColor: value,
      highlightFillColor: value,
      fillOpacity: measure('region-opacity'),
      highlightFillOpacity: measure('region-opacity'),
    };
  };

  const axis = ({ dir = 'x', step = 1, tex = null, name = '', ticks = true } = {}) => {
    const coordinate = dir === 'x' ? 1 : 2;
    return {
      ...stroke({ role: 'support' }),
      dash: 0,
      fixed: true,
      highlight: false,
      lastArrow: { type: 1, size: 6 },
      name,
      withLabel: Boolean(name),
      needsRegularUpdate: Boolean(tex),
      label: { fontSize: 14, position: 'rt', offset: dir === 'x' ? [-14, 12] : [10, -6] },
      ticks: {
        visible: ticks,
        drawLabels: ticks,
        needsRegularUpdate: Boolean(tex),
        strokeColor: color('support'),
        majorHeight: 6,
        minorTicks: 0,
        insertTicks: false,
        ticksDistance: step,
        drawZero: false,
        generateLabelText: tex
          ? function (tick, zero) {
              const k = Math.round((tick.usrCoords[coordinate] - zero.usrCoords[coordinate]) / step);
              // Num board estreito, os números se alternam em vez de se atropelar.
              const pixels = step * (dir === 'x' ? this.board.unitX : this.board.unitY);
              const stride = Math.ceil((dir === 'x' ? 48 : 18) / pixels);
              return k % stride === 0 ? tex(k * step) : '';
            }
          : undefined,
        label: {
          strokeColor: color('text'),
          fontSize: 12,
          useKatex: Boolean(tex),
          display: 'html',
          ...(dir === 'x' ? { anchorX: 'middle', anchorY: 'top', offset: [0, -6] } : { anchorX: 'right', anchorY: 'middle', offset: [-6, 0] }),
        },
      },
    };
  };

  const grid = ({ step = 1, essential = false } = {}) => ({
    fixed: true,
    highlight: false,
    majorStep: step,
    strokeWidth: 1,
    strokeColor: color(essential ? 'support' : 'grid'),
    strokeOpacity: essential ? 0.35 : 1,
  });

  return { token, measure, color, width, handle, movable, point, stroke, fill, axis, grid };
}

const pointTypes = new Set(['point', 'glider', 'midpoint', 'intersection', 'orthogonalprojection', 'mirrorpoint', 'parallelpoint']);
const fillTypes = new Set(['polygon', 'sector', 'angle', 'nonreflexangle', 'reflexangle', 'minorsector', 'majorsector']);

// A aparência de um objeto nativo do JSXGraph, a partir das mesmas palavras usadas em tudo.
export function styleNative(theme, type, { role, color, weight, face, open, ...attributes }) {
  const name = type.toLowerCase();
  if (pointTypes.has(name)) {
    if (color === undefined && face === undefined && open === undefined) return attributes;
    return { ...theme.point({ color, face, open }), ...attributes };
  }
  if (face !== undefined) attributes.face = face;
  if (role === undefined && color === undefined && weight === undefined) return attributes;
  const style = fillTypes.has(name) ? theme.fill({ role, color }) : theme.stroke({ role, color, weight });
  // Os borders de um polígono são objetos à parte: recebem o traço do mesmo role.
  const borders = name === 'polygon' ? { borders: { ...theme.stroke({ role, color, weight }), dash: 0 } } : {};
  return { ...style, ...borders, ...attributes };
}
