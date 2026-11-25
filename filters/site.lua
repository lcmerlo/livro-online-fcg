-- Toda página HTML recebe src/site/boot.js, o que roda em toda página: a marca da
-- seção atual no menu, o botão que recolhe o menu e os nomes que o Quarto deixa em
-- inglês. O caminho do script é relativo à página, e só o filtro o sabe
-- (quarto.project.offset): por isso ele não está no _quarto.yml.

local offset = quarto.project.offset or '.'

return {
  Pandoc = function(doc)
    if quarto.doc.is_format('html') then
      quarto.doc.include_text('after-body', string.format(
        '<script type="module" src="%s/src/site/boot.js"></script>', offset))
    end
    return doc
  end,
}
