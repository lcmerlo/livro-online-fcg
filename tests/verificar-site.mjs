// Auditoria automática do livro. Sem dependências: node tests/verificar-site.mjs
//
// Opções:
//   --raiz <pasta>   raiz do projeto (padrão: pasta acima de tests/)
//   --estrito        trata avisos como erros
//
// Fontes (.qmd): caminhos de imagem inválidos e comandos TeX suspeitos.
// Site gerado (docs/): iframes sem title, imagens sem alt, applets não
// registrados, ids duplicados e saltos na hierarquia de títulos.
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

  // Comando TeX inteiramente em maiúsculas (ex.: \MATHBB) não existe.
  for (const m of texto.matchAll(/\\[A-Z]{4,}\b/g)) {
    erro(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `comando TeX suspeito: ${m[0]}`);
  }

  // \color{993300} sem [HTML] não é uma cor válida no MathJax.
  for (const m of texto.matchAll(/\\color\{[0-9A-Fa-f]{6}\}/g)) {
    aviso(`${rel(arquivo)}:${linhaDe(texto, m.index)}`, `cor hexadecimal sem [HTML]: ${m[0]}`);
  }
}

// ---------- Site gerado ----------

const paginas = listar(join(raiz, "docs"), ".html");

if (paginas.length === 0) {
  aviso("docs/", "nenhuma página HTML encontrada; rode `quarto render --to html` antes");
}

const main = join(raiz, "applets-src/src/main.js");
const bloco = existsSync(main) ? readFileSync(main, "utf8").match(/const applets = \{([\s\S]*?)\};/) : null;
const registrados = new Set(bloco ? [...bloco[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]) : []);

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
    if (!registrados.has(m[1])) erro(nome, `applet não registrado em main.js: ${m[1]}`);
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
