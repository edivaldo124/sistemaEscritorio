// Comportamento do site público da MFV Advocacia.
// Sem dependências e sem script inline. Toda a profundidade é CSS (perspective + translateZ): este arquivo só
// escreve variáveis CSS (--p, --a1, --escala, --rx, --l ...) e troca classes. Tudo que se move respeita
// prefers-reduced-motion (a classe "anima" do <html> é posta por ativar-js.js só quando o visitante não o pediu).
(() => {
  "use strict";

  const html = document.documentElement;
  const anima = html.classList.contains("anima");
  const ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const limitar = (v, min, max) => Math.min(Math.max(v, min), max);
  const suavizar = (t) => t * t * (3 - 2 * t); // smoothstep: começa e termina devagar

  const cabecalho = document.querySelector("[data-cabecalho]");
  const palco = document.querySelector("[data-palco]");
  const trilho = document.querySelector("[data-trilho]");
  const filme = palco ? palco.querySelector("[data-filme]") : null;
  const atos = palco ? Array.from(palco.querySelectorAll("[data-ato]")) : [];
  const manchetes = palco ? Array.from(palco.querySelectorAll("[data-manchetes] .manchete")) : [];
  const medidorFill = document.querySelector("[data-medidor-fill]");
  const medidorValor = document.querySelector("[data-medidor-valor]");
  const palavras = [];

  // 1. Menu móvel: botão com aria-expanded; Esc fecha e devolve o foco ao botão.
  const botaoMenu = document.querySelector("[data-menu-botao]");
  const menu = document.querySelector("[data-menu]");
  if (botaoMenu && menu) {
    const definir = (aberto) => {
      menu.classList.toggle("aberto", aberto);
      botaoMenu.setAttribute("aria-expanded", String(aberto));
      botaoMenu.textContent = aberto ? "Fechar" : "Menu";
    };
    botaoMenu.addEventListener("click", () => definir(botaoMenu.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && botaoMenu.getAttribute("aria-expanded") === "true") {
        definir(false);
        botaoMenu.focus();
      }
    });
    menu.addEventListener("click", (ev) => {
      if (ev.target.closest("a")) definir(false);
    });
  }

  // 2. Abertura: some quando as fontes e a foto da equipe estão prontas (mínimo 0,9 s para a varredura ser
  //    vista, cão de guarda de 2,5 s). "pronto" no <html> libera a rolagem e dispara a entrada do título.
  const abertura = document.querySelector("[data-abertura]");
  const concluirAbertura = () => {
    html.classList.add("pronto");
    if (abertura) {
      abertura.classList.add("abertura--fim");
      try {
        window.sessionStorage.setItem("mfv-abertura", "1");
      } catch (_) {
        /* armazenamento bloqueado: a abertura só não é lembrada */
      }
      window.setTimeout(() => html.classList.remove("abertura-pendente"), 600);
    } else {
      html.classList.remove("abertura-pendente");
    }
  };
  if (abertura && anima && html.classList.contains("abertura-pendente")) {
    const inicio = performance.now();
    const foto = filme ? filme.querySelector("img") : null;
    const esperas = [document.fonts ? document.fonts.ready : Promise.resolve()];
    if (foto && !foto.complete) {
      esperas.push(
        new Promise((resolver) => {
          foto.addEventListener("load", resolver, { once: true });
          foto.addEventListener("error", resolver, { once: true });
        })
      );
    }
    let encerrada = false;
    const encerrar = () => {
      if (encerrada) return;
      encerrada = true;
      window.setTimeout(concluirAbertura, Math.max(0, 900 - (performance.now() - inicio)));
    };
    Promise.all(esperas).then(encerrar, encerrar);
    window.setTimeout(encerrar, 2500);
  } else {
    concluirAbertura();
  }

  // 3. Palavras que acendem ao rolar: o texto é dividido em <span class="palavra">; --l vai de 0 a 1.
  if (anima) {
    document.querySelectorAll("[data-palavras]").forEach((el) => {
      const lista = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      lista.forEach((texto, i) => {
        const span = document.createElement("span");
        span.className = "palavra";
        span.textContent = texto;
        el.append(span);
        if (i < lista.length - 1) el.append(document.createTextNode(" "));
        palavras.push({ span, bloco: el, indice: i, total: lista.length });
      });
    });
  }

  // 4. Trilho cinematográfico da Home. O progresso p (0 a 1) da rolagem dentro do trilho vira:
  //    ato 1 (p até 0,24): o painel se endireita, perde o raio e cresce até cobrir o palco;
  //    ato 2 (o resto): as manchetes dividem o progresso em partes iguais, como no padrão Framerate.
  const temTrilho = Boolean(trilho && palco && filme && anima);
  const ATO1 = 0.24;
  let cobertura = { escala: 1, dx: 0, dy: 0 };
  let alvoP = 0;
  let p = 0;
  let indiceAtual = -1;
  let atoAtual = 1;
  let quadroTrilho = 0;

  // Quanto o painel precisa crescer e se deslocar para cobrir o palco, medido no layout (sem transform).
  const medirCobertura = () => {
    const largura = filme.offsetWidth;
    const altura = filme.offsetHeight;
    if (!largura || !altura) return;
    const escala = Math.max(palco.clientWidth / largura, palco.clientHeight / altura) * 1.02;
    cobertura = {
      escala,
      dx: palco.clientWidth / 2 - (filme.offsetLeft + largura / 2),
      dy: palco.clientHeight / 2 - (filme.offsetTop + altura / 2),
    };
  };

  const pintarTrilho = () => {
    quadroTrilho = 0;
    p += (alvoP - p) * 0.22;
    if (Math.abs(alvoP - p) < 0.0004) p = alvoP;

    const a1 = suavizar(limitar(p / ATO1, 0, 1));
    const q = limitar((p - ATO1) / (1 - ATO1), 0, 1);
    const estilo = palco.style;
    estilo.setProperty("--p", p.toFixed(4));
    estilo.setProperty("--a1", a1.toFixed(4));
    estilo.setProperty("--livre", (1 - a1).toFixed(4));
    estilo.setProperty("--a2", limitar((a1 - 0.6) / 0.4, 0, 1).toFixed(4));
    estilo.setProperty("--escala", (0.94 + (cobertura.escala - 0.94) * a1).toFixed(4));
    estilo.setProperty("--dx", `${(cobertura.dx * a1).toFixed(1)}px`);
    estilo.setProperty("--dy", `${(cobertura.dy * a1).toFixed(1)}px`);
    estilo.setProperty("--inclina", `${((1 - a1) * 12).toFixed(2)}deg`);
    estilo.setProperty("--veu", (a1 * (0.86 + 0.14 * q)).toFixed(3));

    // Manchetes: a ativa entra de baixo, as anteriores saem por cima (classes; o CSS faz a transição).
    const indice = p < ATO1 ? -1 : Math.min(manchetes.length - 1, Math.floor(q * manchetes.length));
    if (indice !== indiceAtual) {
      indiceAtual = indice;
      manchetes.forEach((el, i) => {
        el.classList.toggle("manchete--ativa", i === indice);
        el.classList.toggle("manchete--antes", i < indice);
        el.classList.toggle("manchete--depois", i > indice);
      });
    }

    // Só o ato visível recebe foco, cliques e leitor de tela.
    const ato = a1 > 0.6 ? 2 : 1;
    if (ato !== atoAtual) {
      atoAtual = ato;
      atos.forEach((el) => {
        el.inert = Number(el.dataset.ato) !== ato;
      });
    }

    if (medidorFill) medidorFill.style.height = `${Math.max(4, p * 100).toFixed(1)}%`;
    if (medidorValor) medidorValor.textContent = String(Math.round(p * 100)).padStart(2, "0");

    if (p !== alvoP) quadroTrilho = window.requestAnimationFrame(pintarTrilho);
  };

  const lerProgresso = () => {
    const percurso = trilho.offsetHeight - window.innerHeight;
    return percurso > 0 ? limitar(-trilho.getBoundingClientRect().top / percurso, 0, 1) : 0;
  };

  // 5. Rolagem: cabeçalho, trilho, profundidade do palco interno e brilho das palavras, num único quadro.
  let quadroRolagem = 0;
  function aoRolar() {
    quadroRolagem = 0;
    const y = window.scrollY;
    if (cabecalho) cabecalho.classList.toggle("cabecalho--rolado", y > 24);

    if (temTrilho) {
      alvoP = lerProgresso();
      if (!quadroTrilho) quadroTrilho = window.requestAnimationFrame(pintarTrilho);
    } else if (palco && anima) {
      palco.style.setProperty("--sy", `${Math.min(y, palco.offsetHeight).toFixed(0)}px`);
    }

    if (palavras.length) {
      const altura = window.innerHeight;
      const vistos = new Map();
      palavras.forEach((item) => {
        if (!vistos.has(item.bloco)) {
          const caixa = item.bloco.getBoundingClientRect();
          vistos.set(item.bloco, limitar((altura * 0.9 - caixa.top) / (caixa.height + altura * 0.4), 0, 1));
        }
        const luz = limitar(vistos.get(item.bloco) * (item.total + 1) - item.indice, 0, 1);
        item.span.style.setProperty("--l", luz.toFixed(2));
      });
    }
  }
  const agendarRolagem = () => {
    if (!quadroRolagem) quadroRolagem = window.requestAnimationFrame(aoRolar);
  };
  const aoRedimensionar = () => {
    if (temTrilho) medirCobertura();
    agendarRolagem();
  };
  window.addEventListener("scroll", agendarRolagem, { passive: true });
  window.addEventListener("resize", aoRedimensionar, { passive: true });
  if (temTrilho) {
    medirCobertura();
    if (document.fonts) document.fonts.ready.then(aoRedimensionar);
    window.addEventListener("load", aoRedimensionar, { once: true });
  }
  aoRolar();

  // 6. Palco: o ponteiro inclina o painel e desloca as camadas em profundidades diferentes (suavizado).
  if (palco && anima && ponteiroFino) {
    const alvo = { rx: 0, ry: 0, mx: 0, my: 0, gx: 50, gy: 15 };
    const atual = { ...alvo };
    let rodando = false;

    const escrever = () => {
      let diferenca = 0;
      for (const chave of Object.keys(alvo)) {
        const delta = alvo[chave] - atual[chave];
        atual[chave] += delta * 0.09;
        diferenca += Math.abs(delta);
      }
      palco.style.setProperty("--rx", `${atual.rx.toFixed(2)}deg`);
      palco.style.setProperty("--ry", `${atual.ry.toFixed(2)}deg`);
      palco.style.setProperty("--mx", `${atual.mx.toFixed(1)}px`);
      palco.style.setProperty("--my", `${atual.my.toFixed(1)}px`);
      palco.style.setProperty("--gx", `${atual.gx.toFixed(1)}%`);
      palco.style.setProperty("--gy", `${atual.gy.toFixed(1)}%`);
      if (diferenca > 0.02) window.requestAnimationFrame(escrever);
      else rodando = false;
    };
    const iniciar = () => {
      if (!rodando) {
        rodando = true;
        window.requestAnimationFrame(escrever);
      }
    };

    palco.addEventListener("pointermove", (ev) => {
      const caixa = palco.getBoundingClientRect();
      const nx = limitar(((ev.clientX - caixa.left) / caixa.width) * 2 - 1, -1, 1);
      const ny = limitar(((ev.clientY - caixa.top) / caixa.height) * 2 - 1, -1, 1);
      alvo.rx = -ny * 5;
      alvo.ry = nx * 7;
      alvo.mx = nx * 18;
      alvo.my = ny * 12;
      alvo.gx = (nx * 0.5 + 0.5) * 100;
      alvo.gy = (ny * 0.5 + 0.5) * 100;
      iniciar();
    });
    palco.addEventListener("pointerleave", () => {
      Object.assign(alvo, { rx: 0, ry: 0, mx: 0, my: 0, gx: 50, gy: 15 });
      iniciar();
    });
  }

  // 7. Partículas douradas: pontos pequenos em profundidades e velocidades diferentes.
  const regiaoParticulas = document.querySelector("[data-particulas]");
  if (regiaoParticulas && anima) {
    const aleatorio = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < 16; i += 1) {
      const ponto = document.createElement("i");
      ponto.className = "particula";
      ponto.style.setProperty("--px", `${aleatorio(4, 96).toFixed(1)}%`);
      ponto.style.setProperty("--py", `${aleatorio(6, 92).toFixed(1)}%`);
      ponto.style.setProperty("--ps", `${aleatorio(2, 5).toFixed(1)}px`);
      ponto.style.setProperty("--po", aleatorio(0.25, 0.75).toFixed(2));
      ponto.style.setProperty("--pz", `${Math.round(aleatorio(-140, 220))}px`);
      ponto.style.setProperty("--pd", `${aleatorio(7, 15).toFixed(1)}s`);
      ponto.style.setProperty("--pa", `${(-aleatorio(0, 9)).toFixed(1)}s`);
      regiaoParticulas.append(ponto);
    }
  }

  // 8. Cartões e fotos com inclinação 3D e brilho que segue o ponteiro.
  if (anima && ponteiroFino) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (ev) => {
        const caixa = el.getBoundingClientRect();
        const px = limitar((ev.clientX - caixa.left) / caixa.width, 0, 1);
        const py = limitar((ev.clientY - caixa.top) / caixa.height, 0, 1);
        el.classList.add("inclinando");
        el.style.setProperty("--try", `${((px - 0.5) * 10).toFixed(2)}deg`);
        el.style.setProperty("--trx", `${((0.5 - py) * 8).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("inclinando");
        el.style.setProperty("--try", "0deg");
        el.style.setProperty("--trx", "0deg");
      });
    });
  }

  // 9. Números: contam uma vez quando entram na tela. O valor final já está no HTML.
  const contadores = document.querySelectorAll("[data-contar]");
  if (contadores.length && anima && "IntersectionObserver" in window) {
    const escrever = (el, valor) => {
      el.textContent = Math.round(valor).toLocaleString("pt-BR") + (el.dataset.sufixo || "");
    };
    const animar = (el) => {
      const alvo = Number(el.dataset.contar);
      const duracao = 1400;
      const inicio = performance.now();
      const passo = (agora) => {
        const t = Math.min((agora - inicio) / duracao, 1);
        escrever(el, alvo * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)));
        if (t < 1) window.requestAnimationFrame(passo);
      };
      window.requestAnimationFrame(passo);
    };
    const observador = new IntersectionObserver(
      (itens) => {
        itens.forEach((item) => {
          if (!item.isIntersecting) return;
          observador.unobserve(item.target);
          animar(item.target);
        });
      },
      { threshold: 0.6 }
    );
    contadores.forEach((el) => {
      escrever(el, 0);
      observador.observe(el);
    });
  }

  // 10. Formulário de contato: monta o texto e abre o WhatsApp. Nada é enviado a este site.
  //     Sem JavaScript, o formulário envia só a mensagem (campo "text") ao WhatsApp.
  const formulario = document.querySelector("[data-form-whatsapp]");
  if (formulario) {
    formulario.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const dados = new FormData(formulario);
      const nome = String(dados.get("nome") || "").trim();
      const assunto = String(dados.get("assunto") || "").trim();
      const horario = String(dados.get("horario") || "").trim();
      const mensagem = String(dados.get("text") || "").trim();
      const partes = [`Olá! Meu nome é ${nome}.`];
      if (assunto) partes.push(`Área do caso: ${assunto}.`);
      if (horario) partes.push(`Melhor dia e horário: ${horario}.`);
      const saudacao = partes.join(" ");
      const url = `${formulario.dataset.whatsapp}&text=${encodeURIComponent(`${saudacao}\n\n${mensagem}`)}`;
      window.open(url, "_blank", "noopener");
    });
  }
})();
