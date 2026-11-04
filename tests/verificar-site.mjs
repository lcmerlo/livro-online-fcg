// Auditoria automática do livro. Sem dependências: node tests/verificar-site.mjs
//
// Opções:
//   --raiz <pasta>   raiz do projeto (padrão: pasta acima de tests/)
//   --estrito        trata avisos como erros
//
// Fontes (.qmd): caminhos de imagem inválidos, títulos de definição/proposição
// e comandos TeX suspeitos.
// Site gerado (docs/): iframes sem title, imagens sem alt, applets sem
// arquivo em applets-src/src/applets/, quadros e blocos de applet sem rótulo,
// ids duplicados e saltos na hierarquia de títulos.
// Cores (no CSS gerado): a página de desenvolvimento (applets-src/index.html)
// com valores diferentes dos do livro, cores dos applets com contraste abaixo
// de 3:1 sobre o fundo do quadro e cores de teste (paleta()) em applet usado
// no livro.
// Links internos e âncoras são verificados pelo lychee no workflow.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const estrito = args.includes("--estrito");
const indiceRaiz = args.indexOf("--raiz");
const raiz = resolve(
  indiceRaiz >= 0 ? args[indiceRaiz + 1] : join(dirname(fileURLToPath(import.meta.url)), ".."),
);

const erros = [];
const avisos = [];
const erro = (arquivo, msg) => erros.push(`${arquivo}: ${msg}`);
const aviso = (arquivo, msg) => avisos.push(`${arquivo}: ${msg}`);

function listar(pasta, extensao) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) return item.name === "site_libs" ? [] : listar(caminho, extensao);
    return caminho.endsWith(extensao) ? [caminho] : [];
  });
}

const rel = (caminho) => caminho.slice(raiz.length + 1);
const semComentarios = (texto) => texto.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
const linhaDe = (texto, indice) => texto.slice(0, indice).split("\n").length;

// ---------- Fontes .qmd ----------

const fontes = [join(raiz, "index.qmd"), ...listar(join(raiz, "capitulos"), ".qmd")];

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
    erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `título de ${m[1].toLowerCase()}: use um bloco {#def-…} ou {#prp-…}`);
  }

  // Comando TeX inteiramente em maiúsculas (ex.: \MATHBB) não existe.
  for (const m of texto.matchAll(/\\[A-Z]{4,}\b/g)) {
    erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `comando TeX suspeito: ${m[0]}`);
  }

  // No MathJax, \color{993300} não aplica cor; a forma correta é \color{#993300}.
  for (const m of texto.matchAll(/\\color\{[0-9A-Fa-f]{6}\}/g)) {
    aviso(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `cor hexadecimal sem #: ${m[0]}`);
  }
}

// ---------- Site gerado ----------

const paginas = listar(join(raiz, "docs"), ".html");

if (paginas.length === 0) {
  aviso("docs/", "nenhuma página HTML encontrada; rode `quarto render --to html` antes");
}

// Applets registrados: um por arquivo de applets-src/src/applets/, com o nome
// do arquivo (a mesma regra de main.js).
const pastaApplets = join(raiz, "applets-src/src/applets");
const registrados = new Set(
  existsSync(pastaApplets)
    ? readdirSync(pastaApplets).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -".js".length))
    : [],
);
// Applets que alguma página do livro usa.
const usados = new Set();

for (const arquivo of paginas) {
  const html = readFileSync(arquivo, "utf8");
  const nome = rel(arquivo);

  for (const m of html.matchAll(/<iframe\b[^>]*>/g)) {
    if (!/\stitle="[^"]+"/.test(m[0])) erro(nome, "iframe sem title");
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(m[0])) aviso(nome, `imagem sem alt: ${(m[0].match(/src="([^"]*)"/) ?? [])[1]}`);
  }

  for (const m of html.matchAll(/data-applet="([^"]*)"/g)) {
    usados.add(m[1]);
    if (!registrados.has(m[1])) erro(nome, `applet sem arquivo applets-src/src/applets/${m[1]}.js`);
  }

  // Quadro (.applet-jxg) e bloco de applet com várias partes precisam de
  // nome para o leitor de tela: o rotulo do shortcode ou do bloco.
  for (const m of html.matchAll(/<div\b[^>]*>/g)) {
    const quadro = /\sclass="(?:[^"]*\s)?applet-jxg[\s"]/.test(m[0]);
    const bloco = /\sclass="(?:[^"]*\s)?bloco-applet[\s"]/.test(m[0]) && /\sdata-applet=/.test(m[0]);
    if ((quadro || bloco) && !/\saria-label="[^"]+"/.test(m[0])) {
      erro(nome, `${quadro ? "quadro" : "applet"} sem rotulo: ${(m[0].match(/\sid="([^"]*)"/) ?? [])[1]}`);
    }
  }

  // Só o <body>: o <head> do Quarto repete ids de estilos em todas as páginas.
  const vistos = new Set();
  const dentroDoBody = html.slice(html.indexOf("<body"));
  for (const m of dentroDoBody.matchAll(/\sid="([^"]+)"/g)) {
    if (vistos.has(m[1])) erro(nome, `id duplicado: ${m[1]}`);
    vistos.add(m[1]);
  }

  const corpo = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
  let anterior = 0;
  for (const m of corpo.matchAll(/<h([1-6])\b/g)) {
    const nivel = Number(m[1]);
    if (anterior && nivel > anterior + 1) aviso(nome, `salto de título: h${anterior} para h${nivel}`);
    anterior = nivel;
  }
}

// ---------- Cores ----------

// O CSS do tema que as páginas carregam: o link de docs/index.html, porque
// docs/ guarda versões antigas de bootstrap-*.min.css entre renderizações.
const indiceSite = join(raiz, "docs/index.html");
const linkTema = existsSync(indiceSite)
  ? readFileSync(indiceSite, "utf8").match(/href="(site_libs\/bootstrap\/bootstrap-(?!dark-|icons)[^"]+\.css)"/)?.[1]
  : undefined;
const cssTema = linkTema && existsSync(join(raiz, "docs", linkTema)) ? readFileSync(join(raiz, "docs", linkTema), "utf8") : "";

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
  if (paginas.length) aviso("docs/", "CSS do tema não encontrado; as cores não foram verificadas");
} else {
  const doLivro = variaveis(cssTema);

  // A página de desenvolvimento repete à mão as variáveis do livro, que fora
  // dele não existem; uma diferença faz a página mostrar outra coisa.
  const paginaDev = join(raiz, "applets-src/index.html");
  const raizDev = existsSync(paginaDev) ? readFileSync(paginaDev, "utf8").match(/:root\s*\{([^}]*)\}/)?.[1] ?? "" : "";
  for (const [nome, valor] of variaveis(raizDev)) {
    const noLivro = doLivro.get(nome);
    if (noLivro === undefined) aviso("applets-src/index.html", `${nome} não existe no CSS do livro`);
    else if (noLivro !== valor) aviso("applets-src/index.html", `${nome} vale ${valor}, mas no livro vale ${noLivro}`);
  }

  // Cores que os applets leem (cor("--cor-…") em cores.js), menos as de
  // fundo, sobre o fundo do quadro: linhas e pontos precisam de 3:1 (§32).
  const fonteCores = join(raiz, "applets-src/src/cores.js");
  const lidas = existsSync(fonteCores)
    ? [...readFileSync(fonteCores, "utf8").matchAll(/cor\("(--cor-[\w-]+)"\)/g)].map((m) => m[1])
    : [];
  const fundo = doLivro.get("--cor-superf-suave");
  for (const nome of lidas.filter((n) => !n.startsWith("--cor-superf"))) {
    const valor = doLivro.get(nome);
    if (valor === undefined) {
      aviso("applets-src/src/cores.js", `${nome} não existe no CSS do livro`);
      continue;
    }
    const razao = contraste(valor, fundo);
    if (razao !== null && razao < 3) {
      aviso("applets-src/src/cores.js", `${nome} (${valor}) tem contraste ${razao.toFixed(2)}:1 sobre o fundo do quadro; o mínimo para linhas e pontos é 3:1`);
    }
  }
}

// As cores de teste (paleta(), de cores.js) ficam nos testes; no livro, a
// cor vem do papel didático (diretrizes-tecnicas.md, §4.5).
for (const nomeApplet of usados) {
  const arquivo = join(pastaApplets, `${nomeApplet}.js`);
  if (!existsSync(arquivo)) continue;
  const codigo = readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/\bpaleta\s*\(/.test(codigo)) {
    aviso(rel(arquivo), "cor de teste (paleta) num applet usado no livro: use as cores dos papéis (CORES)");
  }
}

// ---------- Resultado ----------

const resumo = (lista) => [...new Set(lista)].map((l) => `  - ${l}`).join("\n");
if (avisos.length) console.log(`Avisos (${avisos.length}):\n${resumo(avisos)}\n`);
if (erros.length) console.log(`Erros (${erros.length}):\n${resumo(erros)}\n`);

const falhou = erros.length > 0 || (estrito && avisos.length > 0);
console.log(
  falhou
    ? "Verificação falhou."
    : `Verificação concluída: ${paginas.length} páginas, ${fontes.length} fontes, ${avisos.length} avisos.`,
);
process.exit(falhou ? 1 : 0);
