-- Fórmulas comentadas. O autor marca partes de uma fórmula em destaque e escreve os
-- comentários numa lista numerada, no mesmo bloco:
--   ::: {.annotated}
--   $$ d(P,r) = \frac{\note{1}{|ax_0+by_0+c|}}{\note{2}{\sqrt{a^2+b^2}}} $$
--
--   1. ...
--   2. ...
--   :::
-- O comentário n vale para toda parte marcada com \note{n}{...}. Cada comentário
-- começa pelo número dele (o rótulo, na cor da parte; só na página) e por uma cópia
-- da sua parte, e assim a lista diz tudo sozinha: no celular, sem JavaScript, no
-- leitor de tela e no PDF. Em cada forma, src/site/annotations.js acrescenta as
-- linhas (decisões E1, de 2026-11-12, e E18, de 2026-11-17, do livro-base, de onde
-- vem este filtro):
--   sem classe   leva os comentários para perto das partes, onde houver espaço, com
--                uma linha da caixa colorida até cada um
--   .beside      os comentários numa lista, ao lado da fórmula quando cabe, com uma
--                linha da caixa colorida até o rótulo de cada um
--   .legend      só os rótulos em volta da fórmula, cada um ligado às suas caixas, e
--                os comentários na lista, embaixo
-- .beside e .legend não se combinam.

local function warn(message)
  quarto.log.warning(string.format('[annotated] %s: %s', quarto.doc.input_file or '', message))
end

-- O {grupo} em `pos`, depois de espaços opcionais: o conteúdo dele e a posição seguinte.
local function read_group(tex, pos)
  pos = tex:find('%S', pos)
  if not pos or tex:sub(pos, pos) ~= '{' then return nil end
  local depth, i = 0, pos
  while i <= #tex do
    local char = tex:sub(i, i)
    if char == '\\' then i = i + 1
    elseif char == '{' then depth = depth + 1
    elseif char == '}' then
      depth = depth - 1
      if depth == 0 then return tex:sub(pos + 1, i - 1), i + 1 end
    end
    i = i + 1
  end
end

local note_command = '\\note%f[^%a]'

-- \note{n}{parte} -> a parte marcada, para a página, ou só a parte, para os outros
-- formatos. Devolve o TeX novo e, para cada n, o TeX das partes dele.
local function mark_parts(tex, html)
  local parts, out, pos = {}, {}, 1
  while true do
    local start, stop = tex:find(note_command, pos)
    if not start then break end
    local number, after = read_group(tex, stop + 1)
    local part, finish
    if number then part, finish = read_group(tex, after) end
    local n = tonumber(number or '')
    if not (n and part) then
      warn('a marca se escreve \\note{número}{parte da fórmula}')
      break
    end
    if part:find(note_command) then warn('uma marca dentro de outra não é aceita') end
    parts[n] = parts[n] or {}
    table.insert(parts[n], part)
    out[#out + 1] = tex:sub(pos, start - 1)
    out[#out + 1] = html and string.format('\\htmlData{note=%d}{%s}', n, part) or ('{' .. part .. '}')
    pos = finish
  end
  out[#out + 1] = tex:sub(pos)
  return table.concat(out), parts
end

-- "$parte$: " (ou "$a$ e $b$: "), no começo de um comentário.
local function part_copy(list)
  local inlines, seen = pandoc.Inlines({}), {}
  for _, part in ipairs(list) do
    if not seen[part] then
      if #inlines > 0 then inlines:extend({ pandoc.Space(), pandoc.Str('e'), pandoc.Space() }) end
      inlines:insert(pandoc.Math('InlineMath', '\\displaystyle ' .. part))
      seen[part] = true
    end
  end
  inlines:extend({ pandoc.Str(':'), pandoc.Space() })
  return pandoc.Span(inlines, pandoc.Attr('', { 'note-part' }))
end

-- Uma fórmula e a pontuação logo depois dela ficam na mesma linha: um comentário
-- estreito não pode começar uma linha com ", vetor perpendicular".
local function keep_punctuation(inlines)
  local out, i = pandoc.Inlines({}), 1
  while i <= #inlines do
    local here, after = inlines[i], inlines[i + 1]
    local mark, rest
    if here.t == 'Math' and after and after.t == 'Str' then
      mark, rest = after.text:match('^([%.,;:!%?%)]+)(.*)$')
    end
    if mark then
      out:insert(pandoc.Span({ here, pandoc.Str(mark) }, pandoc.Attr('', { 'text-nowrap' })))
      if rest ~= '' then out:insert(pandoc.Str(rest)) end
      i = i + 2
    else
      out:insert(here)
      i = i + 1
    end
  end
  return out
end

local function prepare(div)
  local html = quarto.doc.is_format('html')
  local parts, list

  for _, block in ipairs(div.content) do
    if block.t == 'OrderedList' then
      list = list or block
    elseif not parts and (block.t == 'Para' or block.t == 'Plain') then
      for i, inline in ipairs(block.content) do
        if inline.t == 'Math' and inline.mathtype == 'DisplayMath' then
          inline.text, parts = mark_parts(inline.text, html)
          block.content[i] = inline
          break
        end
      end
    end
  end

  if not parts then
    warn('bloco .annotated sem fórmula em destaque ($$ ... $$)')
    return
  end
  if not list then
    warn('bloco .annotated sem a lista numerada dos comentários')
    return
  end

  local last = #list.content
  for n in pairs(parts) do last = math.max(last, n) end
  for n = 1, last do
    if not parts[n] then warn(string.format('comentário %d sem parte marcada com \\note{%d}{...}', n, n)) end
    if n > #list.content then warn(string.format('\\note{%d} sem o comentário %d na lista', n, n)) end
  end

  for n, item in ipairs(list.content) do
    local opening = pandoc.Inlines({})
    -- O rótulo: o número, num círculo da cor da parte. O leitor de tela não o lê: o
    -- comentário já começa pela parte a que se refere.
    if html then opening:insert(pandoc.Span({ pandoc.Str(tostring(n)) }, pandoc.Attr('', { 'note-label' }, { ['aria-hidden'] = 'true' }))) end
    if parts[n] then opening:insert(part_copy(parts[n])) end
    local first = item[1]
    if first and (first.t == 'Plain' or first.t == 'Para') then
      for i = #opening, 1, -1 do first.content:insert(1, opening[i]) end
    else
      item:insert(1, pandoc.Plain(opening))
    end
    list.content[n] = pandoc.Blocks(item):walk({ Inlines = keep_punctuation })
  end

  if not html then return div.content end
  return div
end

return {
  {
    Div = function(div)
      if div.classes:includes('annotated') then
        if div.classes:includes('beside') and div.classes:includes('legend') then
          warn('.beside e .legend não se combinam: o bloco fica com .beside')
        end
        return prepare(div)
      end
    end,
  },
}
