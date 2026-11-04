// applets-src/src/tools/leitura.js
//
// Leitura: uma fórmula que acompanha o applet, na parte .leitura do bloco
// ::: {.applet} (components/applet-bloco.lua), desenhada pelo MathJax do
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
    const mathjax = window.MathJax;

    // Sem MathJax na página (a página de desenvolvimento, por exemplo), o
    // TeX aparece como texto.
    if (!mathjax?.startup?.promise) {
      elemento.textContent = codigo;
      return;
    }

    // Cada fórmula espera a anterior (e a primeira, a página inteira): o
    // MathJax não desenha duas vezes ao mesmo tempo.
    mathjax.startup.promise = mathjax.startup.promise
      .then(() => {
        // Outra fórmula já foi pedida: esta não precisa ser desenhada.
        if (codigo !== ultimo) {
          return null;
        }

        mathjax.typesetClear([elemento]);
        elemento.textContent = `\\[${codigo}\\]`;
        return mathjax.typesetPromise([elemento]);
      })
      .catch((erro) => console.warn("[AppletsLivro] MathJax:", erro?.message ?? erro));
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
