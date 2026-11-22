// applets-src/src/tools/estado.js
//
// Estado de um applet: os valores que o estudante controla (o número a de
// uma faixa, uma caixa marcada), lidos pela figura e pelos controles
// (tools/controles.js). Mudar um valor redesenha os quadros e avisa quem
// acompanha esse valor; assim a faixa, o campo e a figura ficam sempre de
// acordo, venha a mudança de onde vier.
//   import { criarEstado, criarAnimacao } from "../tools/estado.js";
//   const estado = criarEstado({ a: 1, reta: true }, board);
//   board.create("point", [() => estado.a, 0]);   // ler
//   estado.a = 2;                                 // escrever: redesenha e avisa
//   estado.reiniciar();                           // no reset() do applet
//
// Adaptado de state e animate, de lib/core.js do JSX-quarto, com duas
// diferenças: reiniciar(), que volta tudo ao início, e a animação, que só
// começa a pedido do estudante e para quando outro código muda o mesmo
// valor (diretrizes-tecnicas.md, §4.4).

// valoresIniciais: { chave: valor }, os valores do começo e do reinício.
// quadros: os quadros redesenhados a cada mudança.
// Devolve o estado: estado.<chave> lê e escreve o valor; on(ouvinte) e
// reiniciar() são os dois nomes que uma chave não pode ter.
export function criarEstado(valoresIniciais, ...quadros) {
  const iniciais = { ...valoresIniciais };
  const valores = { ...iniciais };
  const ouvintes = new Set();

  const avisar = (chave, reinicio) => {
    for (const ouvinte of ouvintes) {
      ouvinte(chave, valores[chave], reinicio);
    }
  };

  const estado = {
    // ouvinte(chave, valor, reinicio) é chamado depois de cada mudança;
    // reinicio é true quando a mudança vem de reiniciar(). Devolve a
    // função que desliga o ouvinte.
    on(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },

    // Volta todos os valores ao início e avisa os ouvintes de cada chave,
    // mesmo das que não mudaram: a animação para e cada controle se acerta.
    reiniciar() {
      Object.assign(valores, iniciais);
      quadros.forEach((quadro) => quadro.update());
      Object.keys(valores).forEach((chave) => avisar(chave, true));
    },
  };

  for (const chave of Object.keys(valores)) {
    if (chave in estado) {
      throw new Error(`[AppletsLivro] estado: "${chave}" é um nome reservado`);
    }

    Object.defineProperty(estado, chave, {
      enumerable: true,
      get: () => valores[chave],
      set: (valor) => {
        if (Object.is(valores[chave], valor)) return;
        valores[chave] = valor;
        quadros.forEach((quadro) => quadro.update());
        avisar(chave, false);
      },
    });
  }

  return estado;
}

// Anima estado[chave] entre min e max, com a velocidade em unidades do
// valor por segundo, escolhida pelo efeito visível (diretrizes, §4.5).
//   modo "ida-e-volta" (padrão): vai até uma ponta e volta;
//   modo "repetir": da ponta max, recomeça em min;
//   modo "uma-vez": para em max (tocar de novo recomeça em min).
// A animação nunca começa sozinha: só tocar() a inicia, e quem chama
// tocar() é o botão Animar (criarBotaoAnimacao), a pedido do estudante. Ela
// para quando outro código muda o mesmo valor (o estudante mexe na faixa ou
// no campo) e no reinício do estado.
// Devolve { tocar, pausar, alternar, tocando, on }; on(ouvinte) chama
// ouvinte(tocando) quando a animação começa ou para.
export function criarAnimacao(estado, chave, { min, max, velocidade = 1, modo = "ida-e-volta" } = {}) {
  let quadroPedido = null;
  let instante = 0;
  let sentido = 1;
  // true enquanto a própria animação escreve o valor: essa mudança não a para.
  let escrevendo = false;
  const ouvintes = new Set();

  const avisar = () => ouvintes.forEach((ouvinte) => ouvinte(animacao.tocando));

  const escrever = (valor) => {
    escrevendo = true;
    try {
      estado[chave] = valor;
    } finally {
      escrevendo = false;
    }
  };

  function passo(agora) {
    // No máximo 50 ms por passo: depois de uma aba escondida, o valor não salta.
    const segundos = Math.min(agora - instante, 50) / 1000;
    instante = agora;
    let valor = estado[chave] + sentido * velocidade * segundos;

    if (valor > max || valor < min) {
      const ponta = valor > max ? max : min;

      if (modo === "uma-vez") {
        escrever(ponta);
        quadroPedido = null;
        avisar();
        return;
      }

      if (modo === "repetir") {
        valor = valor > max ? min : max;
      } else {
        valor = ponta;
        sentido = -sentido;
      }
    }

    escrever(valor);
    quadroPedido = requestAnimationFrame(passo);
  }

  const animacao = {
    tocar() {
      if (quadroPedido !== null) return;
      if (modo === "uma-vez" && estado[chave] >= max) escrever(min);
      instante = performance.now();
      quadroPedido = requestAnimationFrame(passo);
      avisar();
    },

    pausar() {
      if (quadroPedido === null) return;
      cancelAnimationFrame(quadroPedido);
      quadroPedido = null;
      avisar();
    },

    alternar() {
      if (animacao.tocando) animacao.pausar();
      else animacao.tocar();
    },

    get tocando() {
      return quadroPedido !== null;
    },

    on(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };

  estado.on((chaveMudada, valor, reinicio) => {
    if (chaveMudada !== chave) return;

    if (reinicio) {
      sentido = 1;
      animacao.pausar();
    } else if (!escrevendo) {
      animacao.pausar();
    }
  });

  return animacao;
}
