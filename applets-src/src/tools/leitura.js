// applets-src/src/tools/leitura.js
//
// Leitura: uma fórmula que acompanha o applet, na parte .leitura do bloco
// ::: {.applet} (components/applet-bloco.lua), desenhada pelo KaTeX do
// livro, com as mesmas macros dos capítulos (\vet, \norm…).
//   import { criarLeitura } from "../tools/leitura.js";
//   criarLeitura({ id: partes.leitura, tex: () => `\\vec{u} = ${tex.ponto(u())}`, quadros: [board] });
//
// A fórmula é refeita quando um dos quadros se atualiza, no máximo uma vez
// por quadro de animação do navegador, e só se o TeX mudou. A leitura não é
// anunciada pelo leitor de tela a cada mudança: quem descreve o estado é o
// texto de estado (<id>-status), em palavras.

// id: o da parte (null ou ausente: a leitura fica de fora, sem aviso).
// tex: função que devolve o TeX da fórmula (tools/formatar.js).
// quadros: os quadros cujas mudanças refazem a fórmula.
// Devolve { atualizar }, para refazer a fórmula fora de um quadro (num
// reset, por exemplo), ou null se a parte não está na página.
export function criarLeitura({ id, tex, quadros = [] }) {
  const elemento = id ? document.getElementById(id) : null;

  if (!elemento) {
    return null;
  }

  let ultimo = null;
  let agendado = false;

  function desenhar() {
    agendado = false;
    const codigo = tex();

    if (codigo === ultimo) {
      return;
    }

    ultimo = codigo;
    desenharTex(elemento, codigo, { displayMode: true });
  }

  function agendar() {
    if (!agendado) {
      agendado = true;
      requestAnimationFrame(desenhar);
    }
  }

  for (const quadro of quadros) {
    quadro.on("update", agendar);
  }

  desenhar();
  return { atualizar: desenhar };
}

// Desenha o TeX `codigo` no elemento, com o KaTeX da página e as macros do
// livro; serve à leitura e aos controles (tools/controles.js). opcoes vai
// para o KaTeX ({ displayMode: true } numa fórmula em destaque).
export function desenharTex(elemento, codigo, opcoes = {}) {
  const katex = window.katex;

  // Sem KaTeX na página (a página de desenvolvimento, por exemplo), o TeX
  // aparece como texto.
  if (!katex) {
    elemento.textContent = codigo;
    return;
  }

  // O KaTeX desenha na hora, sem esperar a página. Um TeX que ele não
  // entende aparece como texto, com um aviso no console.
  try {
    katex.render(codigo, elemento, opcoes);
  } catch (erro) {
    console.warn("[AppletsLivro] KaTeX:", erro?.message ?? erro);
    elemento.textContent = codigo;
  }
}
