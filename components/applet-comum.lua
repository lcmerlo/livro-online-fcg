-- O que o shortcode {{< applet >}} (applet.lua) e o bloco ::: {.applet}
-- (applet-bloco.lua) têm em comum: o bundle, a fórmula que carrega o KaTeX,
-- o texto de estado e o botão "Reiniciar". Carregado pelos dois com
-- require("applet-comum").

local M = {}

function M.texto(valor)
  return valor and pandoc.utils.stringify(valor) or ""
end

function M.escapar(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

-- O bundle só é carregado nas páginas que têm applet.
function M.carregar_bundle()
  quarto.doc.add_html_dependency({
    name = "applets-livro",
    version = "1.0.0",
    scripts = {{ path = "../assets/js/applets-dist/applets-livro.iife.js", attribs = { defer = "" } }},
    stylesheets = { "../assets/js/applets-dist/applets-livro.css" }
  })
end

-- O Pandoc só carrega o KaTeX em páginas com fórmulas, e todo applet usa o
-- KaTeX da página: nos nomes dos objetos, nas leituras e nos rótulos dos
-- controles. Esta fórmula sem conteúdo visível, uma por applet (custom.scss
-- a esconde), garante o carregamento. Uma fórmula vazia não serve: o script
-- do Pandoc que desenha as fórmulas da página para ao encontrá-la, e as
-- seguintes ficariam em TeX.
function M.formula_para_katex()
  return pandoc.Plain({ pandoc.Math("InlineMath", "{}") })
end

-- Texto de estado e botão "Reiniciar" do applet de id `id` (já escapado),
-- no fim da parte interativa.
function M.estado_e_reinicio(id)
  return string.format(
    '<p id="%s-status" class="applet-status" role="status" aria-live="polite"></p>\n' ..
    '<button type="button" class="applet-botao" data-reset="%s">Reiniciar applet</button>',
    id, id)
end

-- Aviso no render, com o nome do arquivo.
function M.avisar(mensagem)
  quarto.log.warning(string.format("[applet] %s: %s", quarto.doc.input_file or "", mensagem))
end

return M
