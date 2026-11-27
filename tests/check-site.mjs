// Verificações das fontes e do site gerado: node check-site.mjs [--strict] [--lab]
// Roda sem instalar nada. Os erros impedem a publicação; os avisos, não.
//   --strict: os avisos também reprovam.
//   --lab:    o laboratório, que não está no site público. Lê o site do perfil lab
//             (_quarto-lab.yml), depois de `quarto render --profile lab --to html`, e
//             confere só as páginas de laboratorio/: as fontes, também as do
//             laboratório, e as outras páginas são conferidas sem --lab.
//   Fontes:   imagens que não existem, títulos usados como definições, TeX mal escrito,
//             cor sem #, nomes do código na prosa (board, slider, handle, glider,
//             state), blocos que saíram (questão E15; em 2026-11-25, os três de antes
//             da E3; em 2026-11-27, os avisos do Quarto) e a marcação de antes do
//             livro-quarto (blocos e applets).
//   Site:     imagens sem alt, iframes sem title, applets sem arquivo ou sem nome, o que
//             os applets carregam e não chegou ao site, ids repetidos, níveis de título
//             pulados, pedidos a outros servidores (também nas folhas de estilo), links
//             internos e âncoras.
//   Fórmulas: as que ficaram em TeX, as que o KaTeX não desenha, caracteres que ele não
//             conhece, página que carrega o KaTeX sem precisar dele.
//   Cores:    cores de applet abaixo de 3:1 sobre o board; cores de teste nos capítulos.
// Vem do livro-base, igual a menos dos comentários, desde a fase 8 do plano de migração
// (antes, tests/verificar-site.mjs): a pasta do site vem de output-dir, e as regras de
// pastas que o livro não tem (modelos/, apendice/) não acham nada. Uma mudança começa lá.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const lab = process.argv.includes('--lab');

// A pasta do site é a de output-dir: docs/ e docs-lab/ aqui, que o GitHub Pages publica;
// _site/ e _site-lab/ no livro-base.
const outputDir = (file, fallback) => {
  const path = join(root, file);
  return (existsSync(path) && readFileSync(path, 'utf8').match(/^[ \t]+output-dir:[ \t]*["']?([^"'\s#]+)/m)?.[1]) || fallback;
};
const siteName = lab ? outputDir('_quarto-lab.yml', '_site-lab') : outputDir('_quarto.yml', '_site');
const site = join(root, siteName);

const errors = [];
const warnings = [];
// No laboratório, uma fórmula que o KaTeX não desenha é só listada: quem decide se ela
// passa é o render (tools/prerender-math.ts), que aqui a deixa passar no laboratório: é o
// experimento das setas de laboratorio/teste.qmd, com macros do MathJax, que o autor
// mantém (fase 7 do plano de migração). No livro-base, o render para nela.
const listed = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);
const rel = (path) => relative(root, path);

function list(folder, extension) {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return entry.name === 'site_libs' || entry.name === 'vendor' ? [] : list(path, extension);
    return path.endsWith(extension) ? [path] : [];
  });
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const blank = (m) => m.replace(/[^\n]/g, ' ');
const withoutComments = (text) => text.replace(/<!--[\s\S]*?-->/g, blank);

// No texto do site, os nomes do código vão em português (questão E16, 2026-11-16): o board
// é quadro, o slider é faixa de valores, o handle é ponto livre, o glider é ponto restrito
// e o state é estado. Os nomes de antes (ponto móvel, ponto deslizante) também não voltam.
// "Ponto móvel" só vale onde o texto fala dos applets (modelos/, apendice/ e as páginas
// da raiz): no texto didático, em capitulos/ e laboratorio/, é o ponto variável da
// geometria analítica, e não o elemento do JSXGraph (o autor, em 2026-11-26).
// O código fica de fora: cercas (também as recuadas ou abertas logo depois do `:` de
// uma lista de definições, como no campo de uma ficha), `código`, atributos {…} (menos
// o spoken, que se ouve), tags HTML e endereços de link. As quebras de linha ficam, para
// o número da linha.
const codeNames = /\b(?:boards?|sliders?|handles?|gliders?|states?)\b|\bpontos? (?:móve(?:l|is)|deslizantes?)\b/gi;
const didactic = (file) => /^(?:capitulos|laboratorio)\//.test(rel(file));
const movingPoint = /^pontos? móve(?:l|is)$/i;
// O que o addStatus escreve é a descrição, a palavra do painel (questão E20, 2026-11-22):
// "texto de estado" dividia a palavra com o state.
const statusName = /\btextos? de estado\b/gi;
const prose = (text) =>
  text
    .replace(/^(?:[ \t]*:)?[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/\{[^{}\n]*\}/g, (m) => blank(m) + [...m.matchAll(/\bspoken="([^"]*)"/g)].map((s) => ` ${s[1]}`).join(''))
    .replace(/<[^>\n]+>/g, blank)
    .replace(/\]\([^)\n]*\)/g, blank);

// Blocos que saíram com a questão E15 (2026-11-19) e, em 2026-11-25, os três de antes da
// E3, que serviam à migração aos poucos dos capítulos do livro-quarto, reescritos do
// zero. Nenhum filtro os conhece mais: .resolution e .answer sairiam como um div comum,
// com a solução à vista do estudante; os outros, sem rótulo nem número. Por isso é erro,
// e não aviso, e vale também para os exemplos de código dos apêndices.
const removedBlocks = [
  [/^:{3,}\s*\{[^}\n]*\.(resolution|answer)(?=[\s}])/gm, (m) => `bloco .${m[1]}, que saiu com a questão E15: use ::: {.solution}`],
  [/^:{3,}\s*\{[^}\n]*\.checkpoint(?=[\s}])/gm, () => 'bloco .checkpoint, que saiu com a questão E15: use ::: {#exr-nome}, um exercício como os outros'],
  [/^:{3,}\s*\{[^}\n]*#exrr-/gm, () => 'exercício #exrr-…, que saiu com a questão E15: use ::: {#exr-nome}'],
  [/^:{3,}\s*\{[^}\n]*\.prerequisites(?=[\s}])/gm, () => 'bloco .prerequisites, que saiu em 2026-11-25: use uma frase no fim do .objective ("Antes de começar: ...")'],
  [/^:{3,}\s*\{[^}\n]*\.interaction(?=[\s}])/gm, () => 'bloco .interaction, que saiu em 2026-11-25: nenhum bloco, a instrução é um parágrafo antes do applet'],
  [/^:{3,}\s*\{[^}\n]*\.pitfall(?=[\s}])/gm, () => 'bloco .pitfall, que saiu em 2026-11-25: use ::: {.note title="Erro comum"}'],
];

// A marcação de antes do livro-quarto, que nenhum filtro conhece: os blocos de antes da
// fase 7 do plano de migração e os applets de antes da fase 5 (os shortcodes applet e
// geogebra, o bloco com nome=, as partes .quadro, .controles e .leitura). Uma .solucao
// sairia com a solução à vista, e um shortcode, como texto na página. É erro também nos
// exemplos de código; só modelos/ e apendice/ a mostram, de propósito (a coluna "antes"
// de modelos/blocos.qmd e o Apêndice F). A troca de cada um está no Apêndice F.
const showsOldSyntax = (file) => /^(?:modelos|apendice)\//.test(rel(file));
const oldSyntax = [
  ...[
    ['\\.bloco-objetivo', '::: {.objective}'],
    ['\\.bloco-pre-requisitos', 'uma frase no fim do .objective ("Antes de começar: ...")'],
    ['\\.bloco-interacao', 'nenhum bloco: a instrução é um parágrafo antes do applet'],
    ['\\.bloco-erro', '::: {.note title="Erro comum"}'],
    ['\\.bloco-checkpoint', '::: {#exr-nome}, com a resposta numa .solution'],
    ['\\.dica', '::: {.hint}'],
    ['\\.(?:solucao|resposta)', '::: {.solution}'],
    ['\\.fig-leg', '::: {.figure-note #fig-nome}'],
  ].map(([name, instead]) => [new RegExp(`^:{3,}\\s*\\{[^}\\n]*?(${name})(?=[\\s}])`, 'gm'), (m) => `bloco ${m[1]}, de antes do livro-base: use ${instead}`]),
  [/\{\{\{?<\s*applet\b/g, () => 'o shortcode applet, de antes do livro-base: use ::: {.applet name="..." spoken="..."}'],
  [/\{\{\{?<\s*geogebra\b/g, () => 'o shortcode geogebra, de antes do livro-base: use um applet de applets/'],
  [/^:{3,}\s*\{[^}\n]*\.applet(?=[\s}])[^}\n]*\snome=/gm, () => 'um bloco .applet com nome=, de antes do livro-base: use ::: {.applet name="..." spoken="..."}'],
  [/^:{3,}\s*\{[^}\n]*?\.(?:quadro|controles|leitura)(?=[\s}])/gm, () => 'uma parte .quadro, .controles ou .leitura, de antes do livro-base: use []{.board name="..."}, []{.controls} ou [nome]{.live}'],
];

// Os avisos do Quarto, de antes da decisão E3 do livro-base, saíram daqui na fase 7 do
// plano de migração (de lá, em 2026-11-27): a folha dos blocos não os desenha, e um aviso
// sairia com a aparência padrão do Quarto, fora do sistema dos blocos. Erro em toda fonte,
// menos em modelos/ e apendice/, que o livro não tem.
const callout = /^:{3,}\s*\{[^}\n]*?\.(callout-[a-z]+)\b/gm;

// ---------- Fontes ----------

// Com --lab, nenhuma: as do laboratório estão nesta lista, conferidas sem --lab.
const sources = lab ? [] : [join(root, 'index.qmd'), join(root, 'acessibilidade.qmd'), ...['capitulos', 'modelos', 'laboratorio', 'apendice'].flatMap((folder) => list(join(root, folder), '.qmd'))];

for (const file of sources.filter(existsSync)) {
  const text = withoutComments(readFileSync(file, 'utf8'));
  const at = (m) => `${rel(file)}:${lineOf(text, m.index)}`;

  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
    if (!/^https?:/.test(m[1]) && !existsSync(resolve(dirname(file), decodeURIComponent(m[1])))) {
      fail(at(m), `imagem não encontrada: ${m[1]}`);
    }
  }
  for (const m of text.matchAll(/^#{2,6}\s+\**(Defini[cç][aã]o|Proposi[cç][aã]o)\b.*$/gm)) {
    fail(at(m), `título de ${m[1].toLowerCase()}: use um bloco {#def-…} ou {#prp-…}`);
  }
  for (const m of text.matchAll(/\\[A-Z]{4,}\b/g)) {
    fail(at(m), `comando TeX suspeito: ${m[0]}`);
  }
  // \color{#993300}, com #, vale em qualquer motor de fórmulas; sem #, só o KaTeX aplica a cor.
  for (const m of text.matchAll(/\\color\{[0-9A-Fa-f]{6}\}/g)) {
    warn(at(m), `cor hexadecimal sem #: ${m[0]}`);
  }
  for (const [pattern, message] of removedBlocks) {
    for (const m of text.matchAll(pattern)) fail(at(m), message(m));
  }
  if (!showsOldSyntax(file)) {
    for (const [pattern, message] of oldSyntax) {
      for (const m of text.matchAll(pattern)) fail(at(m), message(m));
    }
  }
  if (!showsOldSyntax(file)) {
    for (const m of text.matchAll(callout)) fail(at(m), `bloco .${m[1]}, um aviso do Quarto, que saiu: use ::: {.note} ou ::: {.note title="..."}`);
  }
  const reading = prose(text);
  for (const m of reading.matchAll(codeNames)) {
    if (didactic(file) && movingPoint.test(m[0])) continue;
    fail(`${rel(file)}:${lineOf(reading, m.index)}`, `"${m[0]}" no texto do site: diga quadro, faixa de valores, ponto livre, ponto restrito ou estado (questão E16)`);
  }
  for (const m of reading.matchAll(statusName)) {
    fail(`${rel(file)}:${lineOf(reading, m.index)}`, `"${m[0]}" no texto do site: diga descrição; "estado" é só o dos valores que o estudante controla (questão E20)`);
  }
}

// ---------- Site gerado ----------

const pages = list(lab ? join(site, 'laboratorio') : site, '.html');
if (pages.length === 0) {
  if (lab) warn(`${siteName}/`, 'nenhuma página do laboratório: rode `quarto render --profile lab --to html` antes');
  else warn(`${siteName}/`, 'nenhuma página: rode `quarto render` antes');
}

// Cada arquivo de laboratorio/ tem a sua página no site do perfil lab. Sem ela, o
// arquivo não está na lista de _quarto-lab.yml e nunca é gerado nem conferido. E, sem
// --lab, nenhuma página do laboratório: elas não vão ao site público.
if (lab && pages.length) {
  for (const file of list(join(root, 'laboratorio'), '.qmd')) {
    const page = join(site, relative(root, file).replace(/\.qmd$/, '.html'));
    if (!existsSync(page)) fail(rel(file), 'página do laboratório que não foi gerada: ponha o arquivo em _quarto-lab.yml, na parte "Laboratório", e rode `quarto render --profile lab --to html`');
  }
}
if (!lab) {
  for (const page of list(join(site, 'laboratorio'), '.html')) fail(rel(page), 'página do laboratório no site público: ela entra só pelo perfil lab (_quarto-lab.yml)');
}

const appletFiles = new Set(existsSync(join(root, 'applets')) ? readdirSync(join(root, 'applets')).filter((name) => name.endsWith('.js')).map((name) => name.replace(/\.js$/, '')) : []);
const usedApplets = new Set();
const withApplet = [];
const chapterApplets = new Set();
const stylesheets = new Set();
// Um endereço de outro servidor: com protocolo (https://) ou sem (//).
const external = /^(?:https?:)?\/\//i;
const entities = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
    if (code[0] !== '#') return entities[code] ?? whole;
    return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  });

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const name = rel(file);

  // Tudo o que a página carrega vem do site: o que vem de outro servidor some quando ele
  // sai do ar, e o servidor fica sabendo de cada visita. Um link para outro site (<a>)
  // pode. As folhas de estilo locais são conferidas depois: as fontes do Google vinham
  // por elas.
  for (const m of html.matchAll(/<(?:script|link|img|iframe|source|video|audio)\b[^>]*?\s(?:src|href)="([^"]+)"[^>]*>/g)) {
    if (external.test(m[1])) fail(name, `depende de outro servidor: ${m[1]}`);
    else if (/^<link\b/.test(m[0]) && /\srel="stylesheet"/.test(m[0])) stylesheets.add(resolve(dirname(file), m[1].split(/[?#]/)[0]));
  }
  for (const m of html.matchAll(/<iframe\b[^>]*>/g)) {
    if (!/\stitle="[^"]+"/.test(m[0])) fail(name, 'iframe sem title');
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(m[0])) warn(name, `imagem sem alt: ${(m[0].match(/src="([^"]*)"/) ?? [])[1]}`);
  }
  for (const m of html.matchAll(/<div\b[^>]*\bdata-applet="([^"]*)"[^>]*>/g)) {
    usedApplets.add(m[1]);
    withApplet.push(name);
    if (rel(file).startsWith(`${siteName}/capitulos/`)) chapterApplets.add(m[1]);
    if (!appletFiles.has(m[1])) fail(name, `applet sem arquivo: applets/${m[1]}.js`);
    else if (!existsSync(join(site, 'applets', `${m[1]}.js`))) fail(name, `applets/${m[1]}.js não chegou ao site: confira resources, em _quarto.yml`);
    if (!/\saria-label="[^"]+"/.test(m[0])) fail(name, `applet sem spoken (o nome lido): ${m[1]}`);
  }

  // Só o body: o head do Quarto repete ids de estilo de propósito. Só o id de uma tag, e
  // fora dos blocos de código: num trecho de código, como `{.applet id="…"}` no apêndice
  // de migração, o texto também tem id="…", com o < escrito &lt; mas as aspas, às vezes,
  // sem troca.
  const seen = new Set();
  const body = html.slice(html.indexOf('<body')).replace(/<pre\b[\s\S]*?<\/pre>/g, '');
  for (const m of body.matchAll(/<[a-zA-Z][^>]*?\sid="([^"]+)"/g)) {
    if (seen.has(m[1])) fail(name, `id repetido: ${m[1]}`);
    seen.add(m[1]);
  }

  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
  let previous = 0;
  for (const m of main.matchAll(/<h([1-6])\b/g)) {
    const level = Number(m[1]);
    if (previous && level > previous + 1) warn(name, `salto de título: h${previous} para h${level}`);
    previous = level;
  }
}

// O que os applets carregam, além do arquivo de cada um (src/applet/runtime.js e
// tex.js): sem um deles, nenhum applet aparece. Vai ao site por resources, em
// _quarto.yml, que o Quarto não acusa quando falta.
if (withApplet.length) {
  for (const path of ['src/site/boot.js', 'src/applet/runtime.js', 'vendor/jsxgraph/jsxgraphcore.mjs', 'vendor/jsxgraph/jsxgraph.css', 'vendor/katex/katex.min.js', 'math/macros.json']) {
    if (!existsSync(join(site, path))) fail(withApplet[0], `${path} não chegou ao site, e os applets não aparecem: confira resources, em _quarto.yml`);
  }
}

// O que as folhas de estilo pedem: fontes e imagens (url()) e outras folhas (@import).
// No CSS minificado, o @import vem sem espaço: @import"https://…".
for (const sheet of stylesheets) {
  if (!existsSync(sheet)) continue;
  for (const m of readFileSync(sheet, 'utf8').matchAll(/(?:@import\s*(?:url\(\s*)?|url\(\s*)["']?([^"')\s]+)/g)) {
    if (external.test(m[1])) fail(rel(sheet), `depende de outro servidor: ${m[1]}`);
  }
}

// ---------- Fórmulas ----------

// As fórmulas chegam ao site já desenhadas: tools/prerender-math.ts (post-render) passa
// cada uma pelo KaTeX e tira da página o KaTeX do navegador. Aqui, com o mesmo
// vendor/katex/katex.min.js das páginas (que também funciona como módulo do Node):
// - a desenhada guarda o TeX numa anotação, que passa de novo pelo KaTeX, à procura de
//   caracteres que ele não conhece (o desenho sai, mas sem a fonte certa);
// - a que ficou em TeX é erro: ou o KaTeX não a desenha (o estudante a veria em
//   vermelho), ou o post-render não rodou (rode o render inteiro);
// - uma página que ainda carrega katex.min.js sem ter fórmula em TeX é erro: o
//   post-render não a limpou (os applets carregam o KaTeX deles, src/applet/tex.js).
// As macros do livro já vêm expandidas (filters/macros.lua).
const katex = createRequire(import.meta.url)(join(root, 'vendor/katex/katex.min.js'));
let formulas = 0;

function checkTex(code, displayMode, name) {
  const excerpt = code.trim().replace(/\s+/g, ' ').slice(0, 60);
  try {
    katex.renderToString(code, {
      displayMode,
      throwOnError: true,
      strict: (kind, message) => {
        if (kind === 'unknownSymbol') warn(name, `caractere desconhecido em "${excerpt}": ${message}`);
        return 'ignore';
      },
    });
    return null;
  } catch (error) {
    return `"${excerpt}": ${error.message}`;
  }
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const name = rel(file);
  const inLab = rel(file).startsWith(`${siteName}/laboratorio/`);

  for (const m of html.matchAll(/(<span class="katex-display">)?<span class="katex">[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)) {
    formulas++;
    const problem = checkTex(decode(m[2]), Boolean(m[1]), name);
    if (problem) fail(name, `fórmula desenhada que o KaTeX não desenha de novo, ${problem}`);
  }

  let inTex = 0;
  for (const m of html.matchAll(/<span class="math (inline|display)">([\s\S]*?)<\/span>/g)) {
    formulas++;
    inTex++;
    // Sem os delimitadores \( \) e \[ \], que só o modo MathJax do Pandoc põe.
    const code = decode(m[2]).replace(/^\\\(([\s\S]*)\\\)$|^\\\[([\s\S]*)\\\]$/, '$1$2');
    const problem = checkTex(code, m[1] === 'display', name);
    if (problem) (inLab ? listed : errors).push(`${name}: fórmula que o KaTeX não desenha, ${problem}`);
    else fail(name, `fórmula em TeX, sem desenhar, "${code.trim().replace(/\s+/g, ' ').slice(0, 60)}": rode o render inteiro, com o post-render (tools/prerender-math.ts)`);
  }

  if (/<script\b[^>]*\ssrc="[^"]*katex\.min\.js"/.test(html) && inTex === 0) {
    fail(name, 'página que carrega o KaTeX no navegador sem precisar dele: o post-render (tools/prerender-math.ts) devia tê-lo tirado');
  }
}

// Links internos, com as âncoras: o menu lateral leva às seções de todos os capítulos
// (tools/sidebar-sections.ts), e uma seção renomeada não pode deixar um link sem destino.
const idsOf = new Map();
const idsIn = (file) => {
  if (!idsOf.has(file)) idsOf.set(file, existsSync(file) ? new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))) : null);
  return idsOf.get(file);
};
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(m[1]);
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href === '#') continue;
    const [path, fragment] = href.split('#');
    // Um link para uma página que não está na lista do livro, como as do laboratório no
    // site público, sai como link para o .qmd, e o Quarto copia o arquivo-fonte para o
    // site, sem aviso: o link funciona, mas o leitor recebe o arquivo cru.
    if (/\.qmd$/i.test(path.split('?')[0])) {
      fail(rel(file), `link para um arquivo-fonte, que o Quarto copiou em vez de gerar a página: ${href}`);
      continue;
    }
    const target = path ? resolve(dirname(file), decodeURIComponent(path.split('?')[0])) : file;
    const ids = idsIn(target.endsWith('/') || !/\.[a-z0-9]+$/i.test(target) ? join(target, 'index.html') : target);
    if (ids === null) fail(rel(file), `link para uma página que não existe: ${href}`);
    else if (fragment && target.endsWith('.html') && !ids.has(decodeURIComponent(fragment))) fail(rel(file), `link para uma âncora que não existe: ${href}`);
  }
}

// ---------- Cores ----------

// Com --lab, nada: o tema é o mesmo do site público. O tema é o que index.html carrega:
// a pasta do site guarda versões antigas de bootstrap-*.min.css entre renderizações.
const themeLink = lab || !existsSync(join(site, 'index.html')) ? null : readFileSync(join(site, 'index.html'), 'utf8').match(/href="(site_libs\/bootstrap\/bootstrap-(?!dark-|icons)[^"]+\.css)"/)?.[1];
const theme = themeLink && existsSync(join(site, themeLink)) ? join(site, themeLink) : null;
if (theme) {
  const css = readFileSync(theme, 'utf8');
  const variable = (name) => css.match(new RegExp(`--${name}:\\s*([^;}]+)`))?.[1]?.trim().toLowerCase();

  const luminance = (color) => {
    let hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color)?.[1];
    if (!hex) return null;
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)];
    return x === null || y === null ? null : (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };

  const board = variable('color-board');
  for (const role of ['given', 'result', 'support', 'text']) {
    const value = variable(`color-${role}`);
    if (!value) {
      fail('styles/tokens.scss', `--color-${role} não existe`);
      continue;
    }
    const ratio = contrast(value, board);
    if (ratio !== null && ratio < 3) warn('styles/tokens.scss', `--color-${role} (${value}) tem contraste ${ratio.toFixed(2)}:1 sobre o quadro; o mínimo é 3:1`);
  }
} else if (pages.length && !lab) {
  warn(`${siteName}/`, 'CSS do tema não encontrado; as cores não foram conferidas');
}

// Num capítulo, a cor de um applet vem de um role; as cores de teste ficam no laboratório.
const testColor = /\bcolor:\s*['"][a-z-]+-(?:ds|oi|tb|tm|td|cb|d2)['"]/;
for (const name of chapterApplets) {
  const source = join(root, 'applets', `${name}.js`);
  if (!existsSync(source)) continue;
  const code = readFileSync(source, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  if (testColor.test(code)) warn(`applets/${name}.js`, 'cor de teste num applet usado em capítulo: use os papéis (role)');
}

// ---------- Resultado ----------

const unique = (items) => [...new Set(items)].map((item) => `  - ${item}`).join('\n');
if (warnings.length) console.log(`Avisos (${warnings.length}):\n${unique(warnings)}\n`);
if (errors.length) console.log(`Erros (${errors.length}):\n${unique(errors)}\n`);
if (listed.length) console.log(`No laboratório, sem reprovar (${new Set(listed).size}):\n${unique(listed)}\n`);
const failed = errors.length > 0 || (strict && warnings.length > 0);
const what = lab ? 'Verificação do laboratório' : 'Verificação';
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const summary = [count(pages.length, 'página', 'páginas'), count(formulas, 'fórmula', 'fórmulas'), count(usedApplets.size, 'applet usado', 'applets usados'), count(warnings.length, 'aviso', 'avisos')];
console.log(failed ? `${what} falhou.` : `${what} concluída: ${summary.join(', ')}.`);
process.exit(failed ? 1 : 0);
