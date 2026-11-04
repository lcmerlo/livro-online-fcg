// applets-src/vite.config.js
//
// Configuração do Vite para gerar o bundle dos applets (npm run build).
// Saída: ../assets/js/applets-dist/applets-livro.iife.js e applets-livro.css,
// carregados nas páginas do livro pelo shortcode {{< applet >}}.
// Não edite os arquivos gerados: são sobrescritos a cada build.

import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // Caminhos relativos no bundle, para funcionar em qualquer subpasta
  // (como no GitHub Pages).
  base: "./",
  build: {
    // A saída fica fora de applets-src/, dentro da pasta de assets do livro.
    outDir: "../assets/js/applets-dist",
    // Fora da raiz do projeto Vite, a limpeza da pasta precisa ser explícita.
    emptyOutDir: true,
    // Modo biblioteca: um único arquivo JS a partir de src/main.js.
    lib: {
      entry: resolve(import.meta.dirname, "src/main.js"),
      // Nome do objeto global que recebe as exportações de main.js
      // (window.AppletsLivro).
      name: "AppletsLivro",
      // IIFE: roda direto no navegador com <script>, sem import nem módulos.
      formats: ["iife"],
      // Nome fixo, sem hash, porque applet.lua aponta para ele.
      fileName: () => "applets-livro.iife.js",
      // Nome do CSS extraído (estilos do JSXGraph): applets-livro.css
      cssFileName: "applets-livro"
    }
  }
});
