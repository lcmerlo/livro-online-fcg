// Desenha todas as fórmulas quando o site é gerado: uma página sem applet não precisa
// de JavaScript para a matemática, e o leitor nunca vê TeX cru enquanto a página
// carrega. Roda depois de `quarto render` (post-render em _quarto.yml), com o Deno que
// vem com o Quarto: não há nada a instalar. Se este passo for pulado, como numa prévia
// parcial, as páginas funcionam mesmo assim: o KaTeX desenha as fórmulas no navegador,
// como o Pandoc deixou preparado.
//
// Vem do livro-base (tools/prerender-math.ts), com duas diferenças:
// - o KaTeX é o vendor/katex/katex.min.js, o mesmo arquivo que as páginas e os applets
//   carregam (e que tests/check-site.mjs usa), lido como módulo CommonJS: o livro não tem o
//   katex.mjs, que lá serve só ao Node;
// - numa página do laboratório, uma fórmula que o KaTeX não desenha não para o render:
//   fica para o KaTeX do navegador, que a mostra em vermelho, como antes (teste.qmd tem
//   macros do MathJax, de um experimento). tests/check-site.mjs a lista, sem reprovar.

const katexSource = Deno.readTextFileSync(new URL('../vendor/katex/katex.min.js', import.meta.url));
const katexModule = { exports: {} as any };
new Function('module', 'exports', katexSource)(katexModule, katexModule.exports);
const katex = katexModule.exports;

const entities: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
    if (code[0] !== '#') return entities[code] ?? whole;
    return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  });

// O KaTeX do Pandoc: o script e o que desenha as fórmulas no DOMContentLoaded. O
// Quarto 1.11 tira o `defer` e cerca o script com duas linhas que guardam e devolvem o
// `window.define`; o 1.9 não. Os padrões servem às duas versões. Os applets carregam o
// KaTeX deles quando precisam (src/applet/tex.js).
const browserKatex = [
  /<script>window\.backupDefine = window\.define; window\.define = undefined;<\/script>/,
  /<script (?:defer="" )?src="[^"]*katex\.min\.js"><\/script>\s*/,
  /<script>window\.define = window\.backupDefine; window\.backupDefine = undefined;<\/script>/,
  /<script>document\.addEventListener\("DOMContentLoaded", function \(\) \{\s*var mathElements[\s\S]*?<\/script>\s*/,
];

// O único comando de HTML que uma fórmula pode usar: a marca de uma parte comentada
// (filters/annotations.lua). O resto da extensão de HTML do KaTeX fica desligado.
const trust = ({ command, attributes }: { command: string; attributes?: Record<string, string> }) =>
  command === '\\htmlData' && Object.keys(attributes ?? {}).every((key) => key === 'data-note');

// O Quarto dá a pasta de saída com o caminho completo, e as páginas a partir da pasta
// do projeto (docs-lab/laboratorio/teste.html).
const outputDir = Deno.env.get('QUARTO_PROJECT_OUTPUT_DIR') ?? '';
const inLab = (file: string) => (file.startsWith('/') ? file : `${Deno.cwd()}/${file}`).startsWith(`${outputDir}/laboratorio/`);
const outputFiles = (Deno.env.get('QUARTO_PROJECT_OUTPUT_FILES') ?? '').split('\n').filter((file) => file.endsWith('.html'));
let drawn = 0;
const failures: string[] = [];
const leftInLab: string[] = [];

for (const file of outputFiles) {
  const html = Deno.readTextFileSync(file);
  const pageFailures: string[] = [];
  const written = html.replace(/<span class="math (inline|display)">([\s\S]*?)<\/span>/g, (whole, mode, code) => {
    const tex = decode(code);
    try {
      const rendered = katex.renderToString(tex, {
        displayMode: mode === 'display',
        throwOnError: true,
        trust,
        strict: (kind: string, message: string) => {
          if (kind === 'unknownSymbol') console.warn(`${file}: caractere desconhecido em "${tex.trim().slice(0, 50)}": ${message}`);
          return 'ignore';
        },
      });
      drawn++;
      return rendered;
    } catch (error) {
      pageFailures.push(`${file}: ${tex.trim().slice(0, 70)}: ${(error as Error).message}`);
      return whole;
    }
  });
  // Uma fórmula que falhou ainda precisa do KaTeX do navegador para aparecer como erro.
  const clean = pageFailures.length ? written : browserKatex.reduce((page, pattern) => page.replace(pattern, ''), written);
  Deno.writeTextFileSync(file, clean);
  if (pageFailures.length && inLab(file)) leftInLab.push(`${file}: ${pageFailures.length}`);
  else failures.push(...pageFailures);
}

if (failures.length) {
  console.error(`KaTeX não desenhou ${failures.length} fórmula(s):\n${failures.join('\n')}`);
  Deno.exit(1);
}
console.log(`Fórmulas desenhadas: ${drawn}.`);
if (leftInLab.length) console.log(`No laboratório, fórmulas que ficaram para o KaTeX do navegador:\n${leftInLab.join('\n')}`);
