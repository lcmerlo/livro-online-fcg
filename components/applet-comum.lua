-- O que o shortcode {{< applet >}} (applet.lua) e o bloco ::: {.applet}
-- (applet-bloco.lua) têm em comum: o bundle, o KaTeX da página, o texto de
-- estado e o botão "Reiniciar". Carregado pelos dois com
-- require("applet-comum").

local M = {}

function M.texto(valor)
  return valor and pandoc.utils.stringify(valor) or ""
end

function M.escapar(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

-- As macros do livro, de math/macros.json (a lista que filters/macros.lua
-- expande nas fórmulas do texto), em JSON. Lidas uma vez por página.
local macros_json = nil
local function macros_em_json()
  if not macros_json then
    local caminho = pandoc.path.join({ quarto.project.directory or ".", "math", "macros.json" })
    local arquivo = assert(io.open(caminho), "applet-comum.lua: não abre " .. caminho)
    macros_json = pandoc.json.encode(pandoc.json.decode(arquivo:read("a")))
    arquivo:close()
  end
  return macros_json
end

-- Todo applet usa o KaTeX da página: nos nomes dos objetos, nas leituras e nos
-- rótulos dos controles, com as macros do livro. O Pandoc só carrega o KaTeX
-- em páginas com fórmulas, e as macros das fórmulas do texto já vêm expandidas
-- (filters/macros.lua): nas páginas com applet, o KaTeX vem daqui, de
-- vendor/katex/, com as macros definidas no próprio KaTeX. __defineMacro é a
-- função que as extensões do KaTeX usam para isso (a do mhchem, por exemplo);
-- como não é uma função pública, um aviso no console denuncia uma versão nova
-- sem ela (e o verificador também). Vale até a fase 5 da migração, que apaga
-- estes filtros.
local function carregar_katex()
  -- O caminho é relativo à página: as de uma pasta (laboratorio/) sobem um nível.
  local katex = (quarto.project.offset or ".") .. "/vendor/katex/"
  -- As macros entram no KaTeX que estiver na página quando ela acaba de
  -- carregar: numa página com fórmulas ainda em TeX (sem o post-render), o
  -- KaTeX do Pandoc chega depois deste, com defer, e toma o lugar dele. Este
  -- DOMContentLoaded vem antes do que inicia os applets (o bundle, com defer,
  -- se inscreve depois).
  local macros = string.format([[
<script>
document.addEventListener("DOMContentLoaded", function () {
  var macros = %s;
  if (typeof window.katex.__defineMacro !== "function") {
    console.warn("[macros] esta versão do KaTeX não tem __defineMacro; as macros do livro não chegaram aos applets");
    return;
  }
  for (var nome in macros) {
    window.katex.__defineMacro(nome, macros[nome]);
  }
});
</script>]], macros_em_json())
  -- Um elemento por dependência, nesta ordem: o Quarto 1.11 põe no <head> os
  -- elementos de um `head` movendo-os enquanto os percorre, e pula um a cada
  -- dois. O script vem antes da folha, como o do Pandoc: o Quarto cerca o
  -- primeiro script do KaTeX da página com as linhas que guardam e devolvem o
  -- window.define, e põe a segunda antes da primeira folha do KaTeX.
  quarto.doc.add_html_dependency({
    name = "katex-applets-script",
    head = string.format('<script src="%skatex.min.js"></script>', katex),
  })
  quarto.doc.add_html_dependency({
    name = "katex-applets-folha",
    head = string.format('<link rel="stylesheet" href="%skatex.min.css">', katex),
  })
  quarto.doc.add_html_dependency({ name = "katex-applets-macros", head = macros })
end

-- O bundle e o KaTeX só são carregados nas páginas que têm applet.
function M.carregar_bundle()
  quarto.doc.add_html_dependency({
    name = "applets-livro",
    version = "1.0.0",
    scripts = {{ path = "../assets/js/applets-dist/applets-livro.iife.js", attribs = { defer = "" } }},
    stylesheets = { "../assets/js/applets-dist/applets-livro.css" }
  })
  carregar_katex()
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
