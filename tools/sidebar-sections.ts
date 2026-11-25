// Põe as seções de cada capítulo no menu lateral, como subitens que se recolhem, no
// lugar da coluna "Neste capítulo" que o Quarto poria à direita. Roda depois de
// `quarto render` (post-render em _quarto.yml), com o Deno que vem com o Quarto.
//
// O menu de cada página ganha as seções de todos os capítulos: dá para ver o que um
// capítulo traz antes de abri-lo. As seções são os títulos de nível 2 (##) de cada
// página gerada; um título marcado com .unlisted fica de fora. É HTML puro
// (<details>), e funciona sem JavaScript; src/site/boot.js só marca a seção que está
// na tela.
//
// Numa prévia parcial (`quarto preview`, ao salvar um capítulo), só a página salva é
// refeita: o menu das outras mostra as seções antigas dela até o próximo `quarto render`.

const outputFiles = (Deno.env.get('QUARTO_PROJECT_OUTPUT_FILES') ?? '').split('\n').filter((file) => file.endsWith('.html'));

const dirname = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/')));

// "capitulos" + "../index.html" -> "index.html"
function resolve(folder: string, href: string) {
  const parts = folder ? folder.split('/') : [];
  for (const piece of href.split('/')) {
    if (piece === '..') parts.pop();
    else if (piece !== '.' && piece !== '') parts.push(piece);
  }
  return (folder.startsWith('/') ? '/' : '') + parts.filter(Boolean).join('/');
}

const attribute = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const withoutTags = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

type Section = { id: string; title: string };
const known = new Map<string, Section[]>();

// Os títulos de nível 2 de uma página gerada, na ordem em que aparecem.
function sectionsOf(file: string): Section[] {
  if (known.has(file)) return known.get(file)!;
  let sections: Section[] = [];
  try {
    const html = Deno.readTextFileSync(file);
    const main = html.match(/<main\b[\s\S]*<\/main>/)?.[0] ?? '';
    sections = [...main.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)]
      .map(([, attributes, title]) => ({ id: attribute(attributes, 'data-anchor-id') ?? '', title: title.trim(), classes: attribute(attributes, 'class') ?? '' }))
      .filter(({ id, classes }) => id && !classes.split(/\s+/).includes('unlisted'))
      .map(({ id, title }) => ({ id, title }));
  } catch {
    // Página que ainda não foi gerada: fica sem subitens até o próximo render completo.
  }
  known.set(file, sections);
  return sections;
}

const chapterItem =
  /<li class="sidebar-item">(\s*<div class="sidebar-item-container">\s*<a href="([^"#]+)" class="sidebar-item-text sidebar-link( active)?">([\s\S]*?)<\/a>\s*<\/div>\s*)<\/li>/g;

let added = 0;

for (const file of outputFiles) {
  const html = Deno.readTextFileSync(file);
  const start = html.indexOf('<nav id="quarto-sidebar"');
  const end = start < 0 ? -1 : html.indexOf('</nav>', start);
  if (end < 0) continue;

  const folder = dirname(file);
  const sidebar = html.slice(start, end).replace(chapterItem, (whole, inside, href, active, label) => {
    const sections = sectionsOf(resolve(folder, href));
    if (sections.length === 0) return whole;
    added++;
    const name = withoutTags(label.match(/<span class="chapter-title">([\s\S]*?)<\/span>/)?.[1] ?? label);
    const items = sections
      .map(({ id, title }) => `<li><a href="${active ? '' : href}#${id}" class="sidebar-link">${title}</a></li>`)
      .join('\n');
    return `<li class="sidebar-item has-sections">${inside}<details class="sidebar-sections"${active ? ' open' : ''}>
<summary><span class="visually-hidden">Seções de ${name}</span></summary>
<ul class="list-unstyled">
${items}
</ul>
</details>
</li>`;
  });

  Deno.writeTextFileSync(file, html.slice(0, start) + sidebar + html.slice(end));
}

console.log(`Seções no menu lateral: ${added} listas em ${outputFiles.length} páginas.`);
