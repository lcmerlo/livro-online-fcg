-- Insere um rótulo visível no início dos blocos didáticos (.bloco-*),
-- para que o tipo do bloco não dependa só da cor da borda.

local rotulos = {
  ["bloco-objetivo"] = "Objetivo",
  ["bloco-pre-requisitos"] = "Antes de começar",
  ["bloco-interacao"] = "Interação",
  ["bloco-erro"] = "Erro comum",
  ["bloco-checkpoint"] = "Checkpoint",
}

-- Dicas e resoluções: sequências de divs .dica e .solucao (em geral no fim
-- de um #exm, #exr ou #exrr) viram abas recolhíveis, que começam fechadas e se
-- fecham ao clicar de novo na aba ativa. Cada .dica vira uma aba "Dica";
-- cada .solucao, uma aba "Resolução"; cada .resposta (em .bloco-checkpoint),
-- uma aba "Resposta". Havendo mais de uma aba do mesmo tipo, elas são
-- numeradas (Dica 1, Dica 2…).

-- Os filtros do Quarto já leram os tabsets quando este filtro roda,
-- por isso eles são criados com quarto.Tabset.
local function abas_numeradas(titulo, conteudos)
  local abas = pandoc.List({})
  for i, conteudo in ipairs(conteudos) do
    local t = #conteudos > 1 and (titulo .. " " .. i) or titulo
    abas:insert(quarto.Tab({ title = t, content = conteudo }))
  end
  return abas
end

-- Abas recolhíveis: nenhuma aberta no início; clicar na aba ativa a fecha.
local script_abas_recolhiveis = [[
<script>
document.querySelectorAll(".abas-recolhiveis .panel-tabset").forEach(function (abas) {
  function fechar() {
    abas.querySelectorAll(".nav-link").forEach(function (l) {
      l.classList.remove("active");
      l.setAttribute("aria-selected", "false");
    });
    abas.querySelectorAll(".tab-pane").forEach(function (p) {
      p.classList.remove("active", "show");
    });
  }
  fechar();
  // Captura em window: roda antes do Bootstrap, que já ativaria a aba.
  window.addEventListener("click", function (e) {
    var link = e.target.closest(".nav-link");
    if (link && abas.contains(link) && link.classList.contains("active")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      fechar();
    }
  }, true);
});
</script>
]]

-- Tipos de aba, na ordem em que aparecem: classe da sub-div e título.
local tipos_aba = {
  { classe = "dica", titulo = "Dica" },
  { classe = "solucao", titulo = "Resolução" },
  { classe = "resposta", titulo = "Resposta" },
}

-- grupos: conteúdos de cada tipo, indexados pela classe.
local function abas_recolhiveis(grupos)
  local abas = pandoc.List({})
  for _, tipo in ipairs(tipos_aba) do
    abas:extend(abas_numeradas(tipo.titulo, grupos[tipo.classe] or {}))
  end
  quarto.doc.include_text("after-body", script_abas_recolhiveis)
  return pandoc.Div({ quarto.Tabset({ tabs = abas }) }, pandoc.Attr("", { "abas-recolhiveis" }))
end

-- Classe de tipo de aba da div (dica, solucao, resposta), ou nil.
local function tipo_da_div(bloco)
  if bloco.t ~= "Div" then
    return nil
  end
  for _, tipo in ipairs(tipos_aba) do
    if bloco.classes:includes(tipo.classe) then
      return tipo.classe
    end
  end
end

-- Agrupa cada sequência de .dica/.solucao/.resposta consecutivas num só
-- conjunto de abas.
function Blocks(blocos)
  local saida, grupos, vazio = pandoc.Blocks({}), {}, true
  local function fechar_grupo()
    if not vazio then
      saida:insert(abas_recolhiveis(grupos))
      grupos, vazio = {}, true
    end
  end
  for _, bloco in ipairs(blocos) do
    local tipo = tipo_da_div(bloco)
    if tipo then
      grupos[tipo] = grupos[tipo] or {}
      table.insert(grupos[tipo], bloco.content)
      vazio = false
    else
      fechar_grupo()
      saida:insert(bloco)
    end
  end
  fechar_grupo()
  return saida
end

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
