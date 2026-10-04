-- Shortcodes para applets do livro.
--   {{< applet segmento id="jxg-segmento-1" rotulo="Descrição acessível" >}}
--   {{< geogebra f2zqppmu titulo="Applet: descrição" >}}

local function texto(valor)
  return pandoc.utils.stringify(valor)
end

local function escapar(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

return {
  ["applet"] = function(args, kwargs)
    local nome = escapar(texto(args[1]))
    local id = escapar(texto(kwargs["id"]))
    local rotulo = escapar(texto(kwargs["rotulo"]))

    -- O bundle só é carregado nas páginas que usam o shortcode.
    quarto.doc.add_html_dependency({
      name = "applets-livro",
      version = "1.0.0",
      scripts = {{ path = "../assets/js/applets-dist/applets-livro.iife.js", attribs = { defer = "" } }},
      stylesheets = { "../assets/js/applets-dist/applets-livro.css" }
    })

    return pandoc.RawBlock("html", string.format(
      '<div id="%s" class="applet-jxg" data-applet="%s" aria-label="%s"></div>\n' ..
      '<p id="%s-status" class="applet-status" role="status" aria-live="polite"></p>\n' ..
      '<button type="button" class="applet-botao" data-reset="%s">Reiniciar applet</button>',
      id, nome, rotulo, id, id))
  end,

  ["geogebra"] = function(args, kwargs)
    local material = escapar(texto(args[1]))
    local titulo = escapar(texto(kwargs["titulo"]))

    return pandoc.RawBlock("html", string.format(
      '<div class="geogebra-container"><iframe ' ..
      'src="https://www.geogebra.org/material/iframe/id/%s/width/800/height/500/border/888888/rc/false/ai/false/sdz/true" ' ..
      'title="%s" width="800" height="500" style="border:0;" loading="lazy" allowfullscreen></iframe></div>\n' ..
      '<p class="applet-link"><a href="https://www.geogebra.org/m/%s">Abrir o applet no GeoGebra</a></p>',
      material, titulo, material))
  end
}
