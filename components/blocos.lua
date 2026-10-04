-- Insere um rótulo visível no início dos blocos didáticos (.bloco-*),
-- para que o tipo do bloco não dependa só da cor da borda.

local rotulos = {
  ["bloco-objetivo"] = "Objetivo",
  ["bloco-pre-requisitos"] = "Pré-requisitos",
  ["bloco-exemplo"] = "Exemplo",
  ["bloco-applet"] = "Applet",
  ["bloco-erro"] = "Erro comum",
  ["bloco-checkpoint"] = "Checkpoint",
}

function Div(div)
  for _, classe in ipairs(div.classes) do
    local rotulo = rotulos[classe]
    if rotulo then
      local titulo = pandoc.Para({ pandoc.Span({ pandoc.Str(rotulo) }, pandoc.Attr("", { "bloco-rotulo" })) })
      div.content:insert(1, titulo)
      return div
    end
  end
end
