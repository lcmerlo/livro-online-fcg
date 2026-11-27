-- Applets num capítulo: uma sintaxe só, do caso mais simples ao mais rico.
--   ::: {.applet name="scalar-multiple" spoken="Múltiplo de um vetor"}
--   :::
-- As partes são opcionais e ficam onde o texto quiser:
--   []{.board name="vectors" spoken="Os vetores"}  a área do desenho
--   []{.controls}                                  sliders e botões
--   [w]{.live}                                     expressão escrita pelo applet
-- Uma parte sozinha na linha vira um bloco; [w]{.live} dentro de uma frase fica em
-- linha. Os atributos de arranjo valem em qualquer div: cols="2", cols="7fr 5fr",
-- cols="auto"; com .middle, as células ficam centradas na altura.
-- Este filtro só normaliza a marcação; src/applet/ faz o resto.
--
-- Vem do livro-base (filters/applet.lua), igual a menos dos comentários.

local project = quarto.project.directory or '.'
local offset = quarto.project.offset or '.'
local part_classes = { 'board', 'controls', 'live' }

local function warn(message)
  quarto.log.warning(string.format('[applet] %s: %s', quarto.doc.input_file or '', message))
end

local function part_class(element)
  for _, class in ipairs(part_classes) do
    if element.classes:includes(class) then return class end
  end
end

-- "2" -> duas colunas iguais; "7fr 5fr" -> essas proporções. minmax(0, ...) deixa a
-- célula encolher abaixo do desenho já feito, e o board pode ser refeito mais estreito.
local function columns_template(value)
  if value:match('^%d+$') then return 'repeat(' .. value .. ', minmax(0, 1fr))' end
  return (value:gsub('([%d%.]+fr)', 'minmax(0, %1)'))
end

local function add_style(attributes, declaration)
  attributes.style = (attributes.style and (attributes.style .. '; ') or '') .. declaration
end

-- A grade de dentro fica num escopo próprio: ela se desfaz numa coluna pela largura
-- que de fato tem (uma container query), e não pela largura da janela.
local function wrap_columns(div)
  local cols = div.attributes.cols
  if not cols then return end
  div.attributes.cols = nil
  local template = cols == 'auto'
    and 'repeat(auto-fit, minmax(min(16rem, 100%), 1fr))'
    or columns_template(cols)
  local grid = pandoc.Div(div.content, pandoc.Attr('', { 'cols' }, { style = '--cols: ' .. template }))
  div.content = pandoc.Blocks({ pandoc.Div({ grid }, pandoc.Attr('', { 'cols-scope' })) })
end

-- spoken="..." é o nome que o leitor de tela diz, a mesma palavra do código (decisão
-- E12 do livro-base); vira aria-label. Um label="..." de antes da troca não é lido: só
-- gera um aviso, e o nome fica faltando, para que tests/check-site.mjs o acuse.
local function take_spoken(attributes, where)
  if attributes.label then
    warn(string.format('%s: label= foi trocado por spoken=, e não é lido', where))
    attributes.label = nil
  end
  if not attributes.spoken then return false end
  attributes['aria-label'] = attributes.spoken
  attributes.spoken = nil
  return true
end

-- Os atributos que o autor escreve -> o que a página precisa.
local function normalize_part(element, class)
  local attributes = element.attributes
  if attributes.name then
    attributes['data-part'] = attributes.name
    attributes.name = nil
  end
  if class == 'board' then
    take_spoken(attributes, string.format('quadro "%s"', attributes['data-part'] or ''))
    if attributes.width then
      add_style(attributes, '--board-width: ' .. attributes.width)
      attributes.width = nil
    end
    if attributes.ratio then
      attributes['data-ratio'] = attributes.ratio
      attributes.ratio = nil
    end
  elseif class == 'live' then
    -- [w]{.live}: o conteúdo dá o nome da expressão. No lugar dele ficam reticências,
    -- que é o que se lê sem JavaScript, no PDF ou se a expressão falhar: o nome é do
    -- código, em inglês, e não deve aparecer para o leitor.
    if not attributes['data-part'] then
      attributes['data-part'] = pandoc.utils.stringify(element.content)
      local dots = pandoc.Str('…')
      element.content = element.t == 'Div' and { pandoc.Plain({ dots }) } or { dots }
    end
    if attributes.of then
      attributes['data-of'] = attributes.of
      attributes.of = nil
    end
  end
  return element
end

local function prepare_applet(div)
  local name = pandoc.utils.stringify(div.attributes.name or '')
  if name == '' then warn('bloco .applet sem name') end

  if not quarto.doc.is_format('html') then
    return pandoc.Div({ pandoc.Para({ pandoc.Emph({
      pandoc.Str('Conteúdo interativo: consulte a versão online do livro.'),
    }) }) }, pandoc.Attr('', { 'applet-placeholder' }))
  end

  local source = pandoc.path.join({ project, 'applets', name .. '.js' })
  local file = io.open(source)
  if file then file:close() else warn('applet sem arquivo: applets/' .. name .. '.js') end

  div.attributes['data-applet'] = name
  div.attributes.name = nil
  div.attributes.role = 'group'
  -- `controls` quer dizer outra coisa em HTML, e o Pandoc o deixaria como está.
  -- show="fields": no laboratório, mostra uma alternativa de acessibilidade sem que o
  -- leitor precise escolhê-la.
  if div.attributes.reset then
    warn('reset= não existe mais: os botões de reiniciar e de acessibilidade ficam acima de cada quadro')
    div.attributes.reset = nil
  end
  for _, name in ipairs({ 'controls', 'show' }) do
    if div.attributes[name] then
      div.attributes['data-' .. name] = div.attributes[name]
      div.attributes[name] = nil
    end
  end
  if not take_spoken(div.attributes, string.format('applet "%s"', name)) then
    warn(string.format('applet "%s" sem spoken', name))
  end
  div.content:insert(pandoc.RawBlock('html', '<noscript><p>Este applet precisa de JavaScript.</p></noscript>'))
  return div
end

return {
  {
    -- Roda primeiro: num parágrafo só dela, uma parte é um bloco.
    Para = function(para)
      local only = #para.content == 1 and para.content[1]
      if only and only.t == 'Span' and part_class(only) then
        return pandoc.Div({ pandoc.Plain(only.content) }, only.attr)
      end
    end,
  },
  {
    Span = function(span)
      local class = part_class(span)
      if class then return normalize_part(span, class) end
    end,
    Div = function(div)
      wrap_columns(div)
      local class = part_class(div)
      if class then normalize_part(div, class) end
      if div.classes:includes('applet') then return prepare_applet(div) end
      return div
    end,
  },
  {
    -- Toda página recebe src/site/boot.js, o que roda em toda página; ele carrega os
    -- applets, onde houver. O caminho do script é relativo à página, e só o filtro o
    -- sabe (quarto.project.offset): por isso ele não está no _quarto.yml.
    Pandoc = function(doc)
      if quarto.doc.is_format('html') then
        quarto.doc.include_text('after-body', string.format(
          '<script type="module" src="%s/src/site/boot.js"></script>', offset))
      end
      return doc
    end,
  },
}
