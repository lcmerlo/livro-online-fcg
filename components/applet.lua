-- Shortcodes para applets do livro. A saída vem num <div class="bloco-applet">;
-- orientações e perguntas ficam em volta, no bloco .bloco-interacao.
--   {{< applet nome-do-applet id="jxg-nome-do-applet-1" rotulo="Descrição acessível" >}}
--   {{< applet nome-do-applet id="…" rotulo="…" arranjo="estreito centro" >}}
--   {{< geogebra f2zqppmu titulo="Applet: descrição" >}}
-- Um applet com várias partes (quadros, leituras) usa o bloco ::: {.applet},
-- de applet-bloco.lua.

local comum = require("applet-comum")

return {
  ["applet"] = function(args, kwargs)
    local nome = comum.escapar(comum.texto(args[1]))
    local id = comum.escapar(comum.texto(kwargs["id"]))
    local rotulo = comum.escapar(comum.texto(kwargs["rotulo"]))
    -- Classes de arranjo do quadro (custom.scss): estreito, centro.
    local arranjo = comum.escapar(comum.texto(kwargs["arranjo"]))
    local classes = arranjo == "" and "applet-jxg" or ("applet-jxg " .. arranjo)

    if rotulo == "" then
      comum.avisar(string.format('applet "%s" sem rotulo', id))
    end

    comum.carregar_bundle()

    return pandoc.RawBlock("html", string.format(
      '<div class="bloco-applet">\n' ..
      '<div id="%s" class="%s" data-applet="%s" aria-label="%s"></div>\n' ..
      '%s\n' ..
      '</div>',
      id, classes, nome, rotulo, comum.estado_e_reinicio(id)))
  end,

  ["geogebra"] = function(args, kwargs)
    local material = comum.escapar(comum.texto(args[1]))
    local titulo = comum.escapar(comum.texto(kwargs["titulo"]))

    return pandoc.RawBlock("html", string.format(
      '<div class="bloco-applet">\n' ..
      '<div class="geogebra-container"><iframe ' ..
      'src="https://www.geogebra.org/material/iframe/id/%s/width/800/height/500/border/888888/rc/false/ai/false/sdz/true" ' ..
      'title="%s" width="800" height="500" style="border:0;" loading="lazy" allowfullscreen></iframe></div>\n' ..
      '<p class="applet-link"><a href="https://www.geogebra.org/m/%s">Abrir o applet no GeoGebra</a></p>\n' ..
      '</div>',
      material, titulo, material))
  end
}
