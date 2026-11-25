-- Blocos didáticos. O autor escreve o que o trecho é; este filtro põe o rótulo visível
-- e junta dicas e soluções num grupo que fica fechado até o leitor pedir.
-- Dois blocos têm rótulo (decisões E3, de 2026-11-12, e E15, de 2026-11-19, do
-- livro-base):
--   ::: {.objective} ... :::     o objetivo; o que é preciso saber antes é uma frase dele
--   ::: {.note title="Erro comum"} ... :::     uma observação, com o título que o
--                                trecho pedir; sem título, "Observação"
-- Uma pergunta para conferir é um exercício do Quarto, ::: {#exr-nome}, como o exercício
-- com dica e o resolvido (E15).
-- E as partes que se abrem, dentro de um exercício ou de um exemplo:
--   ::: {.hint} ... :::   ::: {.solution} ... :::      (decisão E15, de 2026-11-19)
-- O Quarto também tem um ambiente .solution, do tipo da demonstração, que deixaria o
-- texto à vista: por isso este filtro roda antes dele (`at: pre-ast`, em _quarto.yml).
-- Rodar antes também quer dizer: rodar antes dos outros filtros do projeto (macros,
-- fórmulas comentadas, applets), que recebem as abas já montadas.
--
-- Vem do livro-base (filters/blocks.lua), sem os três blocos de antes que ele ainda
-- aceita (.prerequisites, .interaction, .pitfall): nenhum capítulo do livro os usa
-- (escolha do autor, 2026-11-25). Os blocos do livro de antes da fase 7 da migração
-- (.bloco-*, .dica, .solucao, .resposta, #exrr-…) e os avisos do Quarto (.callout-…)
-- não têm mais filtro nem estilo: tests/verificar-site.mjs dá erro num capítulo que
-- os use, porque uma .solucao, por exemplo, sairia com a solução à vista.
--
-- Duas escolhas valem para o livro todo, em _quarto.yml, e podem ser trocadas num
-- trecho com um atributo no div que o envolve (é assim que o laboratório compara):
--   reveal: tabs | inline | steps | accordion      como dicas e soluções aparecem
--   block-labels: run-in | above                   rótulo na frase ou em linha própria

local options = { reveal = 'tabs', labels = 'run-in' }

local labels = {
  objective = 'Objetivo',
  note = 'Observação',
}

local reveal_classes = { 'hint', 'solution' }
local letters = 'abcdefghijklmnopqrstuvwxyz'

local function raw(html)
  return pandoc.RawBlock('html', html)
end

local function escape(text)
  return (text:gsub('&', '&amp;'):gsub('<', '&lt;'):gsub('>', '&gt;'):gsub('"', '&quot;'))
end

-- ---------- Rótulos ----------

-- O rótulo do bloco: o de `title`, se o autor escreveu um, ou o da classe.
local function label_of(div)
  for _, class in ipairs(div.classes) do
    if labels[class] then return div.attributes.title or labels[class] end
  end
end

local function has_label(block)
  local first = block and (block.t == 'Para' or block.t == 'Plain') and block.content[1]
  return first and first.t == 'Span' and first.classes:includes('block-label')
end

local function add_label(div, style)
  local label = label_of(div)
  local first = div.content[1]
  -- Um trecho com escolha própria já passou por aqui.
  if not label or has_label(first) then return nil end
  div.attributes.title = nil

  if style == 'run-in' and first and (first.t == 'Para' or first.t == 'Plain') then
    -- Na mesma linha do texto, como o título de uma definição.
    first.content:insert(1, pandoc.Space())
    first.content:insert(1, pandoc.Span({ pandoc.Str(label .. '.') }, pandoc.Attr('', { 'block-label', 'run-in' })))
  else
    div.content:insert(1, pandoc.Para({ pandoc.Span({ pandoc.Str(label) }, pandoc.Attr('', { 'block-label' })) }))
  end
  return div
end

-- ---------- Dicas e soluções ----------

local function reveal_class(block)
  if block.t ~= 'Div' then return nil end
  for _, class in ipairs(reveal_classes) do
    if block.classes:includes(class) then return class end
  end
end

-- Cada solução fica com as dicas escritas antes dela. Dicas sem solução depois
-- formam uma unidade só de dicas.
local function units_of(items)
  local units, pending = {}, {}
  for _, item in ipairs(items) do
    if item.class == 'hint' then
      table.insert(pending, item.content)
    else
      table.insert(units, { hints = pending, solution = item.content })
      pending = {}
    end
  end
  if #pending > 0 then table.insert(units, { hints = pending }) end
  return units
end

-- As partes que o leitor pode abrir, na ordem: cada dica ao lado da sua solução. Só
-- há número quando ele distingue alguma coisa.
local function parts_of(items)
  local units = units_of(items)
  local with_hints, with_solution = 0, 0
  for _, unit in ipairs(units) do
    if #unit.hints > 0 then with_hints = with_hints + 1 end
    if unit.solution then with_solution = with_solution + 1 end
  end

  local parts, hint_number, solution_number = {}, 0, 0
  for _, unit in ipairs(units) do
    if #unit.hints > 0 then
      hint_number = hint_number + 1
      table.insert(parts, { label = with_hints > 1 and ('Dica ' .. hint_number) or 'Dica', hints = unit.hints })
    end
    if unit.solution then
      solution_number = solution_number + 1
      table.insert(parts, { label = with_solution > 1 and ('Solução ' .. solution_number) or 'Solução', content = unit.solution })
    end
  end
  return parts
end

-- "Dica" -> "Dica a"; "Dica 2" -> "Dica 2a".
local function lettered(label, i)
  return label .. (label:match('%d$') and '' or ' ') .. letters:sub(i, i)
end

local function details(title, content, name)
  local blocks = pandoc.Blocks({ raw(string.format('<details class="reveal"%s><summary>%s</summary>', name and (' name="' .. name .. '"') or '', escape(title))) })
  blocks:extend(content)
  blocks:insert(raw('</details>'))
  return blocks
end

-- O que uma parte mostra quando aberta. Uma dica só: o texto dela. Várias: uma
-- sanfona (Dica a, Dica b...) ou, em `steps`, uma de cada vez, a pedido.
local function part_content(part, id, style)
  if not part.hints then return part.content end
  if #part.hints == 1 then return part.hints[1] end

  local blocks = pandoc.Blocks({})
  for i, hint in ipairs(part.hints) do
    if style == 'steps' then
      blocks:insert(raw(string.format('<div class="reveal-step"%s>', i > 1 and ' hidden' or '')))
      blocks:extend(hint)
      blocks:insert(raw('</div>'))
    else
      blocks:extend(details(lettered(part.label, i), hint))
    end
  end
  if style == 'steps' then
    blocks:insert(raw(string.format('<button type="button" class="reveal-next" data-total="%d">Mais uma dica (2 de %d)</button>', #part.hints, #part.hints)))
  end
  return blocks
end

local group_count = 0

-- Um grupo de dicas e soluções seguidas.
local function reveal_group(items, style)
  group_count = group_count + 1
  local id = 'reveal-' .. group_count
  local parts = parts_of(items)
  local blocks = pandoc.Blocks({})

  -- Fora do site (PDF): tudo à vista, com o nome em negrito.
  if not quarto.doc.is_format('html') then
    for _, part in ipairs(parts) do
      if part.hints and #part.hints > 1 then
        for i, hint in ipairs(part.hints) do
          blocks:insert(pandoc.Para({ pandoc.Strong({ pandoc.Str(lettered(part.label, i) .. '.') }) }))
          blocks:extend(hint)
        end
      else
        blocks:insert(pandoc.Para({ pandoc.Strong({ pandoc.Str(part.label .. '.') }) }))
        blocks:extend(part.hints and part.hints[1] or part.content)
      end
    end
    return blocks
  end

  -- Sanfona: um item embaixo do outro, com o <details> do navegador.
  if style == 'accordion' then
    for _, part in ipairs(parts) do
      blocks:extend(details(part.label, part_content(part, id, style), id))
    end
    return blocks
  end

  -- Abas que se recolhem: uma linha de botões e, embaixo, o que foi aberto. `inline`
  -- e `steps` usam o mesmo HTML, com outra aparência (styles/blocks.scss).
  local buttons = {}
  for i, part in ipairs(parts) do
    buttons[i] = string.format(
      '<button type="button" class="reveal-tab" id="%s-tab-%d" aria-expanded="false" aria-controls="%s-%d">%s</button>',
      id, i, id, i, escape(part.label))
  end
  blocks:insert(raw(string.format('<div class="reveals%s">\n<div class="reveal-tabs">%s</div>',
    style == 'inline' and ' inline' or '', table.concat(buttons))))
  for i, part in ipairs(parts) do
    blocks:insert(raw(string.format(
      '<div class="reveal-panel" id="%s-%d" role="group" aria-labelledby="%s-tab-%d" data-label="%s" hidden>',
      id, i, id, i, escape(part.label))))
    blocks:extend(part_content(part, id, style))
    blocks:insert(raw('</div>'))
  end
  blocks:insert(raw('</div>'))
  return blocks
end

local function group_reveals(blocks, style)
  local out, items = pandoc.Blocks({}), {}

  local function close_group()
    if #items > 0 then
      out:extend(reveal_group(items, style))
      items = {}
    end
  end

  for _, block in ipairs(blocks) do
    local class = reveal_class(block)
    if class then
      table.insert(items, { class = class, content = block.content })
    else
      close_group()
      out:insert(block)
    end
  end
  close_group()
  return out
end

-- ---------- Escolhas do livro e de um trecho ----------

local function read_options(meta)
  if meta.reveal then options.reveal = pandoc.utils.stringify(meta.reveal) end
  if meta['block-labels'] then options.labels = pandoc.utils.stringify(meta['block-labels']) end
end

-- ::: {reveal="accordion"} ou ::: {block-labels="run-in"}: vale para o que está dentro.
local function scoped(div)
  local reveal, label_style = div.attributes.reveal, div.attributes['block-labels']
  if not reveal and not label_style then return nil end
  div.attributes.reveal, div.attributes['block-labels'] = nil, nil
  return div:walk({
    Div = label_style and function(inner) return add_label(inner, label_style) end or nil,
    Blocks = reveal and function(blocks) return group_reveals(blocks, reveal) end or nil,
  })
end

return {
  { Meta = read_options },
  { Div = scoped },
  { Div = function(div) return add_label(div, options.labels) end },
  { Blocks = function(blocks) return group_reveals(blocks, options.reveal) end },
}
