-- Expande as macros do livro em toda fórmula, para qualquer formato de saída. A
-- fórmula chega ao KaTeX, às prévias e ao PDF já em TeX comum, e nada depende de uma
-- definição que só o navegador conheça. A fonte é uma só: math/macros.json, que os
-- applets e os testes também leem.

local function load_macros()
  local path = pandoc.path.join({ quarto.project.directory or '.', 'math', 'macros.json' })
  local file = assert(io.open(path), 'macros.lua: cannot open ' .. path)
  local macros = pandoc.json.decode(file:read('a'))
  file:close()

  local parsed = {}
  for name, body in pairs(macros) do
    local arity = 0
    for digit in body:gmatch('#(%d)') do arity = math.max(arity, tonumber(digit)) end
    parsed[name:sub(2)] = { body = body, arity = arity }
  end
  return parsed
end

local macros = load_macros()

-- Lê um argumento de macro em `pos`: um {grupo} ou um único símbolo. Devolve o
-- argumento e a posição logo depois dele.
local function read_argument(tex, pos)
  pos = tex:find('%S', pos) or #tex + 1
  if tex:sub(pos, pos) == '{' then
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
  local command = tex:match('^\\%a+', pos)
  local token = command or tex:sub(pos, pos)
  return token, pos + #token
end

local function expand(tex)
  local out, pos = {}, 1
  while pos <= #tex do
    local slash = tex:find('\\', pos, true)
    if not slash then
      out[#out + 1] = tex:sub(pos)
      break
    end
    out[#out + 1] = tex:sub(pos, slash - 1)

    local name = tex:match('^%a+', slash + 1)
    local macro = name and macros[name]
    if macro then
      local body, next_pos = macro.body, slash + 1 + #name
      for i = 1, macro.arity do
        local argument
        argument, next_pos = read_argument(tex, next_pos)
        body = body:gsub('#' .. i, (argument:gsub('%%', '%%%%')))
      end
      out[#out + 1] = expand(body)
      pos = next_pos
    else
      -- Não é uma macro: copia o comando, ou o caractere escapado, como está.
      local length = name and #name or 1
      out[#out + 1] = tex:sub(slash, slash + length)
      pos = slash + length + 1
    end
  end
  return table.concat(out)
end

return {
  {
    Math = function(math_element)
      math_element.text = expand(math_element.text)
      return math_element
    end,
  },
}
