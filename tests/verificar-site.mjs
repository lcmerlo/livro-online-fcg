// Auditoria automática do livro: node tests/verificar-site.mjs
// Roda sem instalar nada: o KaTeX das fórmulas é o de vendor/katex/, o mesmo
// arquivo que as páginas carregam.
//
// Opções:
//   --raiz <pasta>   raiz do projeto (padrão: pasta acima de tests/)
//   --estrito        trata avisos como erros
//   --lab            confere o site do perfil lab (docs-lab/, de
//                    `quarto render --profile lab`), com as páginas de laboratorio/
//
// Fontes (.qmd): caminhos de imagem inválidos, títulos de definição/proposição,
// comandos TeX suspeitos, blocos que nenhum filtro do livro conhece (os de antes
// da fase 7 da migração e os avisos do Quarto) e a marcação dos applets de antes
// da fase 5 (os shortcodes applet e geogebra, o bloco com nome=, as partes
// .quadro, .controles e .leitura); as de laboratorio/ também sem --lab.
// Site gerado (docs/ ou docs-lab/): iframes sem title, imagens sem alt, applets sem
// arquivo em applets/ ou sem o nome lido (spoken), o que os applets carregam e não
// chegou ao site, ids duplicados, saltos na hierarquia de títulos e pedidos a
// outros servidores (no HTML e nas folhas de estilo que as páginas carregam).
// Fórmulas (no site gerado, onde já vêm desenhadas por tools/prerender-math.ts):
// as que ficaram em TeX, as que o KaTeX não desenha, caracteres que ele não
// conhece e página que ainda carrega o KaTeX sem precisar dele.
// Cores (no CSS gerado): as cores dos papéis dos applets com contraste abaixo de
// 3:1 sobre o fundo do quadro, e cor de teste (de uma paleta de teste de
// _brand.yml) em applet usado no livro (fora de laboratorio/).
// Links internos e âncoras são verificados pelo lychee no workflow.
//
// Protótipos (`estado: prototipo` no cabeçalho do capítulo; diretrizes
// técnicas, §1.4): continua erro o que quebra a página (imagem que não
// existe, fórmula que o KaTeX não desenha, id repetido, applet sem arquivo);
// os avisos e as conferências de forma (título de definição) viram uma
// contagem, a ver na reescrita do capítulo. A contagem não reprova nem com
// --estrito.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const estrito = args.includes("--estrito");
const indiceRaiz = args.indexOf("--raiz");
const raiz = resolve(
  indiceRaiz >= 0 ? args[indiceRaiz + 1] : join(dirname(fileURLToPath(import.meta.url)), ".."),
);
// A pasta do site gerado: a do site público ou a do perfil lab (_quarto-lab.yml).
const saida = args.includes("--lab") ? "docs-lab" : "docs";

const erros = [];
const avisos = [];
// As páginas do laboratório são testes e modelos, alguns com exemplos que não
// funcionam de propósito (macros só da página, em teste.qmd): o que se acha nelas é
// listado à parte e não reprova, nem com --estrito. Os blocos delas passaram à
// sintaxe nova na fase 7 da migração, e os applets, na fase 5 (plano de migração do
// livro-base).
const noLaboratorio = [];
const doLaboratorio = (arquivo) => /^(docs-lab\/)?laboratorio\//.test(arquivo);
const erro = (arquivo, msg) => (doLaboratorio(arquivo) ? noLaboratorio : erros).push(`${arquivo}: ${msg}`);
const aviso = (arquivo, msg) => (doLaboratorio(arquivo) ? noLaboratorio : avisos).push(`${arquivo}: ${msg}`);

function listar(pasta, extensao) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) return item.name === "site_libs" ? [] : listar(caminho, extensao);
    return caminho.endsWith(extensao) ? [caminho] : [];
  });
}

const rel = (caminho) => caminho.slice(raiz.length + 1);

// Estado de cada fonte, lido do cabeçalho; sem a linha, o capítulo é tratado
// como revisado (index.qmd, capítulo novo).
const estados = new Map();
function prototipo(fonte) {
  if (!estados.has(fonte)) {
    const cabecalho = existsSync(fonte) ? readFileSync(fonte, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] : "";
    const estado = cabecalho?.match(/^estado:\s*(\S+)/m)?.[1] ?? "revisado";
    if (estado !== "prototipo" && estado !== "revisado") aviso(rel(fonte), `estado desconhecido: ${estado} (use prototipo ou revisado)`);
    estados.set(fonte, estado === "prototipo");
  }
  return estados.get(fonte);
}
// A fonte de uma página do site: docs/capitulos/x.html vem de capitulos/x.qmd.
const fonteDe = (pagina) => join(raiz, rel(pagina).slice(saida.length + 1).replace(/\.html$/, ".qmd"));

// Num protótipo, avisos e conferências de forma só entram na contagem.
const emPrototipos = new Set();
const capitulosPrototipo = new Set();
function avisoOuConta(fonte, arquivo, msg, comoErro = false) {
  if (prototipo(fonte)) {
    emPrototipos.add(`${arquivo}: ${msg}`);
    capitulosPrototipo.add(rel(fonte));
  } else if (comoErro) erro(arquivo, msg);
  else aviso(arquivo, msg);
}

// Blocos que nenhum filtro do livro conhece desde a fase 7 da migração
// (filters/blocks.lua): os do livro de antes dela, os três de antes que o livro-base
// tinha (saíram de lá em 2026-11-25) e os avisos do Quarto, que ficaram sem estilo. Uma .solucao sairia
// com a solução à vista; os outros, sem rótulo, sem número ou com a aparência
// padrão do Quarto. Por isso é erro, também nos exemplos de código. A troca de cada
// um está no Apêndice F do livro-base, seção "No capítulo".
const blocosSemFiltro = [
  ["\\.bloco-objetivo", "::: {.objective}"],
  ["\\.(?:bloco-pre-requisitos|prerequisites)", 'uma frase no fim do .objective ("Antes de começar: ...")'],
  ["\\.(?:bloco-interacao|interaction)", "nenhum bloco: a instrução é um parágrafo antes do applet"],
  ["\\.(?:bloco-erro|pitfall)", '::: {.note title="Erro comum"}'],
  ["\\.bloco-checkpoint", "::: {#exr-nome}, com a resposta numa .solution"],
  ["\\.dica", "::: {.hint}"],
  ["\\.(?:solucao|resposta)", "::: {.solution}"],
  ["#exrr-[^\\s}]*", "::: {#exr-nome}, com a solução numa .solution"],
  ["\\.fig-leg", "::: {.figure-note #fig-nome}"],
  ["\\.callout-[a-z]+", '::: {.note} ou ::: {.note title="..."}'],
].map(([nome, troca]) => [new RegExp(`^:{3,}\\s*\\{[^}\\n]*?(${nome})(?=[\\s}])`, "gm"), troca]);

// A marcação dos applets de antes da fase 5 da migração. O sistema antigo saiu, com
// os shortcodes applet e geogebra (components/): o Quarto deixaria o shortcode na
// página como texto, e um bloco com nome= ficaria sem applet. Erro também nos
// exemplos de código. A troca de cada um está no Apêndice F do livro-base, seção "No
// capítulo"; um applet do GeoGebra se reescreve pela tabela "Do GeoGebra para a base".
const appletsDeAntes = [
  [/\{\{\{?<\s*applet\b/g, "o shortcode applet", '::: {.applet name="..." spoken="..."}'],
  [/\{\{\{?<\s*geogebra\b/g, "o shortcode geogebra", "um applet de applets/"],
  [/^:{3,}\s*\{[^}\n]*\.applet(?=[\s}])[^}\n]*\snome=/gm, "um bloco .applet com nome=", '::: {.applet name="..." spoken="..."}'],
  [/^:{3,}\s*\{[^}\n]*?\.(?:quadro|controles|leitura)(?=[\s}])/gm, "uma parte .quadro, .controles ou .leitura", '[]{.board name="..."}, []{.controls} ou [nome]{.live}'],
];

const semComentarios = (texto) => texto.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
const linhaDe = (texto, indice) => texto.slice(0, indice).split("\n").length;

// ---------- Fontes .qmd ----------

const fontes = [
  join(raiz, "index.qmd"),
  join(raiz, "acessibilidade.qmd"),
  ...listar(join(raiz, "capitulos"), ".qmd"),
  ...listar(join(raiz, "laboratorio"), ".qmd"),
];

for (const arquivo of fontes.filter(existsSync)) {
  const texto = semComentarios(readFileSync(arquivo, "utf8"));

  for (const m of texto.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
    const alvo = m[1];
    if (/^https?:/.test(alvo)) continue;
    const onde = `${rel(arquivo)}:${linhaDe(texto, m.index)}`;
    if (!existsSync(resolve(dirname(arquivo), decodeURIComponent(alvo)))) {
      erro(onde, `imagem não encontrada: ${alvo}`);
    }
  }

  // Definições e proposições são blocos {#def-…}/{#prp-…}, não títulos.
  for (const m of texto.matchAll(/^#{2,6}\s+\**(Defini[cç][aã]o|Proposi[cç][aã]o)\b.*$/gm)) {
    avisoOuConta(arquivo, `${rel(arquivo)}:${linhaDe(texto, m.index)}`, `título de ${m[1].toLowerCase()}: use um bloco {#def-…} ou {#prp-…}`, true);
  }

  // Comando TeX inteiramente em maiúsculas (ex.: \MATHBB) não existe.
  for (const m of texto.matchAll(/\\[A-Z]{4,}\b/g)) {
    erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `comando TeX suspeito: ${m[0]}`);
  }

  for (const [padrao, troca] of blocosSemFiltro) {
    for (const m of texto.matchAll(padrao)) {
      erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `bloco ${m[1]}, que nenhum filtro do livro conhece desde a fase 7 da migração: use ${troca}`);
    }
  }

  for (const [padrao, oQue, troca] of appletsDeAntes) {
    for (const m of texto.matchAll(padrao)) {
      erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `${oQue}, do sistema de applets que saiu na fase 5 da migração: use ${troca}`);
    }
  }

  // Forma do guia (guia-editorial.md, §4): \color{#993300}, com #, que vale
  // em qualquer motor de fórmulas; sem #, só o KaTeX aplica a cor.
  for (const m of texto.matchAll(/\\color\{[0-9A-Fa-f]{6}\}/g)) {
    avisoOuConta(arquivo, `${rel(arquivo)}:${linhaDe(texto, m.index)}`, `cor hexadecimal sem #: ${m[0]}`);
  }
}

// ---------- Site gerado ----------

const paginas = listar(join(raiz, saida), ".html");

if (paginas.length === 0) {
  const render = saida === "docs" ? "quarto render --to html" : "quarto render --profile lab --to html";
  aviso(`${saida}/`, `nenhuma página HTML encontrada; rode \`${render}\` antes`);
}

// Sem --lab, nenhuma página do laboratório: elas não vão ao site público.
if (saida === "docs") {
  for (const arquivo of paginas.filter((p) => rel(p).startsWith("docs/laboratorio/"))) {
    erro(rel(arquivo), "página do laboratório no site público: ela entra só pelo perfil lab (_quarto-lab.yml)");
  }
}

// Os applets: um por arquivo de applets/, com o nome do arquivo, que
// src/applet/runtime.js carrega pelo nome escrito no capítulo.
const pastaApplets = join(raiz, "applets");
const registrados = new Set(
  existsSync(pastaApplets)
    ? readdirSync(pastaApplets).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -".js".length))
    : [],
);
// Applets que alguma página do livro usa, fora do laboratório; e as páginas com
// applet, também as do laboratório.
const usados = new Set();
const comApplet = [];
// As folhas de estilo locais que as páginas carregam, conferidas depois.
const folhas = new Set();
// Um endereço de outro servidor: com protocolo (https://) ou sem (//).
const deFora = /^(?:https?:)?\/\//i;

for (const arquivo of paginas) {
  const html = readFileSync(arquivo, "utf8");
  const nome = rel(arquivo);
  const fonte = fonteDe(arquivo);

  // Tudo o que a página carrega vem do site (plano de migração do livro-base,
  // fase 2): o que vem de outro servidor some quando ele sai do ar, e o servidor
  // fica sabendo de cada visita. Um link para outro site (<a>) pode. É erro também
  // no laboratório: o que uma página carrega vem da configuração do livro, e só as
  // páginas com fórmulas mostram de onde vem o KaTeX.
  for (const m of html.matchAll(/<(?:script|link|img|iframe|source|video|audio)\b[^>]*?\s(?:src|href)="([^"]+)"[^>]*>/g)) {
    if (deFora.test(m[1])) erros.push(`${nome}: depende de outro servidor: ${m[1]}`);
    else if (/^<link\b/.test(m[0]) && /\srel="stylesheet"/.test(m[0])) {
      folhas.add(resolve(dirname(arquivo), m[1].split(/[?#]/)[0]));
    }
  }

  for (const m of html.matchAll(/<iframe\b[^>]*>/g)) {
    if (!/\stitle="[^"]+"/.test(m[0])) erro(nome, "iframe sem title");
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(m[0])) avisoOuConta(fonte, nome, `imagem sem alt: ${(m[0].match(/src="([^"]*)"/) ?? [])[1]}`);
  }

  // Todo applet precisa do nome que o leitor de tela diz: o spoken="..." do
  // capítulo, que filters/applet.lua faz aria-label.
  for (const m of html.matchAll(/<div\b[^>]*\bdata-applet="([^"]*)"[^>]*>/g)) {
    if (!doLaboratorio(nome)) usados.add(m[1]);
    comApplet.push(nome);
    if (!registrados.has(m[1])) erro(nome, `applet sem arquivo: applets/${m[1]}.js`);
    else if (!existsSync(join(raiz, saida, "applets", `${m[1]}.js`))) {
      erro(nome, `applets/${m[1]}.js não chegou ao site: confira resources, em _quarto.yml`);
    }
    if (!/\saria-label="[^"]+"/.test(m[0])) erro(nome, `applet sem spoken (o nome lido): ${m[1]}`);
  }

  // Só o <body>: o <head> do Quarto repete ids de estilos em todas as páginas.
  // Sem os blocos de código: o Pandoc não troca as aspas no texto de um <pre>, e
  // um exemplo como ::: {#x .applet …} pareceria um segundo id="x".
  const vistos = new Set();
  const dentroDoBody = html.slice(html.indexOf("<body")).replace(/<pre\b[\s\S]*?<\/pre>/g, "");
  for (const m of dentroDoBody.matchAll(/\sid="([^"]+)"/g)) {
    if (vistos.has(m[1])) erro(nome, `id duplicado: ${m[1]}`);
    vistos.add(m[1]);
  }

  const corpo = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
  let anterior = 0;
  for (const m of corpo.matchAll(/<h([1-6])\b/g)) {
    const nivel = Number(m[1]);
    if (anterior && nivel > anterior + 1) avisoOuConta(fonte, nome, `salto de título: h${anterior} para h${nivel}`);
    anterior = nivel;
  }
}

// O que os applets carregam, além do arquivo de cada um (src/applet/runtime.js e
// tex.js): sem um deles, nenhum applet aparece. Tudo vai ao site por resources, em
// _quarto.yml, que o Quarto não acusa quando falta.
if (comApplet.length) {
  for (const arquivo of ["src/site/boot.js", "src/applet/runtime.js", "vendor/jsxgraph/jsxgraphcore.mjs", "vendor/jsxgraph/jsxgraph.css", "vendor/katex/katex.min.js", "math/macros.json"]) {
    if (!existsSync(join(raiz, saida, arquivo))) erro(comApplet[0], `${arquivo} não chegou ao site, e os applets não aparecem: confira resources, em _quarto.yml`);
  }
}

// O que as folhas de estilo pedem: fontes e imagens (url()) e outras folhas
// (@import). O Cosmo e o _brand.yml pediam fontes ao Google por aqui.
for (const folha of folhas) {
  if (!existsSync(folha)) continue;
  const css = readFileSync(folha, "utf8");
  for (const m of css.matchAll(/(?:@import\s*(?:url\(\s*)?|url\(\s*)["']?([^"')\s]+)/g)) {
    if (deFora.test(m[1])) erro(rel(folha), `depende de outro servidor: ${m[1]}`);
  }
}

// ---------- Fórmulas ----------

// As fórmulas chegam ao site já desenhadas: tools/prerender-math.ts (post-render)
// passa cada uma pelo KaTeX e tira da página o KaTeX do navegador. Aqui, com o
// mesmo vendor/katex/katex.min.js (que também funciona como módulo do Node):
// - a que ficou em TeX é erro: ou o KaTeX não a desenha (o estudante a veria em
//   vermelho), ou o post-render não rodou (rode o render inteiro);
// - a desenhada guarda o TeX numa anotação, que passa de novo pelo KaTeX, à procura
//   de caracteres que ele não conhece (o desenho sai, mas sem a fonte certa);
// - uma página que ainda carrega katex.min.js sem ter fórmula em TeX é erro: o
//   post-render não a limpou (os applets carregam o KaTeX deles, src/applet/tex.js).
// As macros do livro já vêm expandidas (filters/macros.lua, com a lista de
// math/macros.json).
let katex = null;
let formulas = 0;
try {
  katex = createRequire(import.meta.url)(join(raiz, "vendor/katex/katex.min.js"));
} catch (e) {
  if (paginas.length) erro("vendor/katex/", `KaTeX não encontrado: ${e.message}`);
}

if (katex && paginas.length) {
  const entidades = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: " " };
  const decodificar = (texto) =>
    texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (inteira, e) => {
      if (e[0] !== "#") return entidades[e] ?? inteira;
      return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    });

  // Passa o TeX pelo KaTeX; devolve a mensagem de erro, ou null se ele o desenha.
  function conferirTex(tex, emDestaque, arquivo, nome) {
    const trecho = tex.trim().replace(/\s+/g, " ").slice(0, 60);
    try {
      katex.renderToString(tex, {
        displayMode: emDestaque,
        throwOnError: true,
        strict: (codigo, mensagem) => {
          if (codigo === "unknownSymbol") avisoOuConta(fonteDe(arquivo), nome, `caractere que o KaTeX não conhece em "${trecho}": ${mensagem}`);
          return "ignore";
        },
      });
      return null;
    } catch (e) {
      return `"${trecho}": ${e.message}`;
    }
  }

  for (const arquivo of paginas) {
    const nome = rel(arquivo);
    const html = readFileSync(arquivo, "utf8");

    for (const m of html.matchAll(/(<span class="katex-display">)?<span class="katex">[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)) {
      formulas++;
      const falha = conferirTex(decodificar(m[2]), Boolean(m[1]), arquivo, nome);
      if (falha) erro(nome, `fórmula desenhada que o KaTeX não desenha de novo, ${falha}`);
    }

    let emTex = 0;
    for (const m of html.matchAll(/<span class="math (inline|display)">([\s\S]*?)<\/span>/g)) {
      formulas++;
      emTex++;
      // Sem os delimitadores \( \) e \[ \], que só o modo MathJax do Pandoc põe.
      const tex = decodificar(m[2]).replace(/^\\\(([\s\S]*)\\\)$|^\\\[([\s\S]*)\\\]$/, "$1$2");
      const falha = conferirTex(tex, m[1] === "display", arquivo, nome);
      if (falha) erro(nome, `fórmula que o KaTeX não desenha, ${falha}`);
      else erro(nome, `fórmula em TeX, sem desenhar, "${tex.trim().replace(/\s+/g, " ").slice(0, 60)}": rode o render inteiro, com o post-render (tools/prerender-math.ts)`);
    }

    if (/<script\b[^>]*\ssrc="[^"]*katex\.min\.js"/.test(html) && emTex === 0) {
      erro(nome, "página que carrega o KaTeX no navegador sem precisar dele: o post-render (tools/prerender-math.ts) devia tê-lo tirado");
    }
  }
}

// ---------- Cores ----------

// O CSS do tema que as páginas carregam: o link de docs/index.html, porque
// docs/ guarda versões antigas de bootstrap-*.min.css entre renderizações.
const indiceSite = join(raiz, saida, "index.html");
const linkTema = existsSync(indiceSite)
  ? readFileSync(indiceSite, "utf8").match(/href="(site_libs\/bootstrap\/bootstrap-(?!dark-|icons)[^"]+\.css)"/)?.[1]
  : undefined;
const cssTema = linkTema && existsSync(join(raiz, saida, linkTema)) ? readFileSync(join(raiz, saida, linkTema), "utf8") : "";

// Variáveis CSS de um texto, com o primeiro valor de cada uma (o do :root,
// que vem antes das regras @media), em minúsculas.
function variaveis(texto) {
  const mapa = new Map();
  for (const m of texto.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
    if (!mapa.has(m[1])) mapa.set(m[1], m[2].trim().toLowerCase());
  }
  return mapa;
}

// Contraste WCAG 2 entre duas cores hexadecimais (#abc ou #aabbcc); null se
// uma delas não for hexadecimal.
function luminancia(cor) {
  let hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(cor)?.[1];
  if (!hex) return null;
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const [la, lb] = [luminancia(a), luminancia(b)];
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

if (!cssTema) {
  if (paginas.length) aviso(`${saida}/`, "CSS do tema não encontrado; as cores não foram verificadas");
} else {
  const doLivro = variaveis(cssTema);

  // As cores dos papéis (role) que os applets leem (src/applet/theme.js) e a do
  // texto, sobre o fundo do quadro: linhas e pontos precisam de 3:1 (§32).
  const fundo = doLivro.get("--color-board");
  for (const papel of ["given", "result", "support", "text"]) {
    const valor = doLivro.get(`--color-${papel}`);
    if (valor === undefined) {
      erro("styles/tokens.scss", `--color-${papel} não existe no CSS do livro`);
      continue;
    }
    const razao = contraste(valor, fundo);
    if (razao !== null && razao < 3) {
      aviso("styles/tokens.scss", `--color-${papel} (${valor}) tem contraste ${razao.toFixed(2)}:1 sobre o fundo do quadro; o mínimo para linhas e pontos é 3:1`);
    }
  }
}

// As cores das paletas de teste de _brand.yml (Okabe–Ito, Tableau, IBM e as
// outras, com o sufixo da paleta) ficam nos applets do laboratório; no livro, a cor
// vem do papel (role; diretrizes-tecnicas.md, §4.5).
const corDeTeste = /\bcolor:\s*['"][a-z-]+-(?:ds|oi|tb|tm|td|cb|d2)['"]/;
for (const nomeApplet of usados) {
  const arquivo = join(pastaApplets, `${nomeApplet}.js`);
  if (!existsSync(arquivo)) continue;
  const codigo = readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (corDeTeste.test(codigo)) {
    aviso(rel(arquivo), "cor de teste num applet usado no livro: use os papéis (role)");
  }
}

// ---------- Resultado ----------

const resumo = (lista) => [...new Set(lista)].map((l) => `  - ${l}`).join("\n");
if (avisos.length) console.log(`Avisos (${avisos.length}):\n${resumo(avisos)}\n`);
if (erros.length) console.log(`Erros (${erros.length}):\n${resumo(erros)}\n`);
if (emPrototipos.size) {
  console.log(`Em protótipos: ${emPrototipos.size} avisos, a ver na reescrita de cada capítulo (${capitulosPrototipo.size} capítulos).\n`);
}
if (noLaboratorio.length) {
  console.log(`No laboratório, sem reprovar (${new Set(noLaboratorio).size}):\n${resumo(noLaboratorio)}\n`);
}

const falhou = erros.length > 0 || (estrito && avisos.length > 0);
console.log(
  falhou
    ? "Verificação falhou."
    : `Verificação concluída: ${paginas.length} páginas, ${fontes.length} fontes, ${formulas} fórmulas, ${avisos.length} avisos.`,
);
process.exit(falhou ? 1 : 0);
