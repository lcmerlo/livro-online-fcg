import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    outDir: "../assets/js/applets-dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/main.js"),
      name: "AppletsLivro",
      formats: ["iife"],
      fileName: () => "applets-livro.iife.js",
      cssFileName: "applets-livro"
    }
  }
});
