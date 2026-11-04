-- Bloco de um applet com várias partes (quadros e leituras), escrito no
-- capítulo (guia-editorial.md, §3 e §6):
--
--   ::::: {.applet nome="nome-do-applet" id="nda" rotulo="Descrição do applet"}
--   :::: {.grid}
--   ::: {#nda-figura .quadro .g-col-12 .g-col-md-6 rotulo="Descrição do quadro"}
--   :::
--   ::: {#nda-leitura .leitura .g-col-12 .g-col-md-6}
--   :::
--   ::::
--   :::::
--
-- O bloco vira a parte interativa do applet, como a do shortcode
-- {{< applet >}} (applet.lua): <div class="bloco-applet" data-applet="…">,
-- com as partes onde o texto as pôs (numa .grid, num .grupo, numa célula…),
-- o texto de estado e o botão "Reiniciar" no fim. Cada parte tem id
-- <id>-<parte>; o applet a recebe pelo nome da parte, em `partes`
-- (applets-src/src/main.js).
--   .quadro   → <div class="applet-jxg" aria-label="rotulo">, onde o JSXGraph desenha
--   .leitura  → <div class="applet-leitura">, onde o applet escreve uma fórmula

local comum = require("applet-comum")

-- Classe da parte no capítulo → classe no HTML.
local PARTES = { quadro = "applet-jxg", leitura = "applet-leitura" }

local function tipo_da_parte(div)
  for tipo in pairs(PARTES) do
    if div.classes:includes(tipo) then
      return tipo
    end
  end
  return nil
end

local function trocar_classe(classes, velha, nova)
  local resultado = pandoc.List({ nova })
  for _, classe in ipairs(classes) do
    if classe ~= velha then
      resultado:insert(classe)
    end
  end
  return resultado
end

local function preparar_parte(div, tipo, id_applet)
  local prefixo = id_applet .. "-"

  if div.identifier:sub(1, #prefixo) ~= prefixo or #div.identifier == #prefixo then
    comum.avisar(string.format('parte "%s" do applet "%s": o id deve ser %s<parte>', div.identifier, id_applet, prefixo))
  else
    div.attributes["data-parte"] = div.identifier:sub(#prefixo + 1)
  end

  div.classes = trocar_classe(div.classes, tipo, PARTES[tipo])

  if tipo == "quadro" then
    local rotulo = comum.texto(div.attributes["rotulo"])
    if rotulo == "" then
      comum.avisar(string.format('quadro "%s" sem rotulo', div.identifier))
    end
    div.attributes["rotulo"] = nil
    div.attributes["aria-label"] = rotulo
  else
    -- O Pandoc só carrega o MathJax em páginas com fórmulas; esta fórmula
    -- vazia garante que a leitura tenha o MathJax para desenhar a sua.
    div.content = pandoc.Blocks({ pandoc.Plain({ pandoc.Math("InlineMath", "") }) })
  end

  return div
end

local function preparar_applet(div)
  local id = div.identifier
  local nome = comum.texto(div.attributes["nome"])
  local rotulo = comum.texto(div.attributes["rotulo"])

  if id == "" or nome == "" then
    comum.avisar("bloco .applet sem id ou sem nome")
  end
  if rotulo == "" then
    comum.avisar(string.format('applet "%s" sem rotulo', id))
  end

  comum.carregar_bundle()

  div.content = div.content:walk({
    traverse = "topdown",
    Div = function(interno)
      local tipo = tipo_da_parte(interno)
      if tipo then
        return preparar_parte(interno, tipo, id), false
      end
    end,
  })

  div.classes = trocar_classe(div.classes, "applet", "bloco-applet")
  div.attributes["nome"] = nil
  div.attributes["rotulo"] = nil
  div.attributes["data-applet"] = nome
  -- As partes formam um grupo, com o nome do applet para o leitor de tela.
  div.attributes["role"] = "group"
  div.attributes["aria-label"] = rotulo
  div.content:insert(pandoc.RawBlock("html", comum.estado_e_reinicio(comum.escapar(id))))

  return div
end

return {
  {
    -- De fora para dentro: o bloco é visto antes das partes.
    traverse = "topdown",
    Div = function(div)
      if div.classes:includes("applet") then
        return preparar_applet(div), false
      end
      if tipo_da_parte(div) then
        comum.avisar(string.format('parte "%s" fora de um bloco .applet', div.identifier))
      end
    end,
  },
}
