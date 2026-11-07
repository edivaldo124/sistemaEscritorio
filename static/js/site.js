// Comportamento do site público da MFV Advocacia.
// Sem dependências e sem script inline. Efeitos 3D em CSS (perspective + translateZ): o JavaScript só
// escreve variáveis CSS (--rx, --ry, --p, --l ...). Tudo que se move respeita prefers-reduced-motion.
(() => {
  "use strict";

  const html = document.documentElement;
  const anima = html.classList.contains("anima");
  const ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const limitar = (v, min, max) => Math.min(Math.max(v, min), max);

  const cabecalho = document.querySelector("[data-cabecalho]");
  const palco = document.querySelector("[data-palco]");
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

  // 2. Palavras que acendem ao rolar: o texto é dividido em <span class="palavra">; --l vai de 0 a 1.
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

  // 3. Rolagem: cabeçalho, profundidade do palco e brilho das palavras, em um único quadro de animação.
  let quadroRolagem = 0;
  function aoRolar() {
    quadroRolagem = 0;
    const y = window.scrollY;
    if (cabecalho) cabecalho.classList.toggle("cabecalho--rolado", y > 24);

    if (palco && anima) {
      const progresso = limitar(y / (palco.offsetHeight * 0.55), 0, 1);
      palco.style.setProperty("--p", progresso.toFixed(3));
      palco.style.setProperty("--sy", `${Math.min(y, palco.offsetHeight).toFixed(0)}px`);
      // O painel da Home nasce inclinado para trás e se endireita enquanto o visitante rola.
      if (palco.querySelector("[data-painel]")) {
        palco.style.setProperty("--inclina", `${((1 - progresso) * 14).toFixed(2)}deg`);
        palco.style.setProperty("--escala", (0.94 + 0.06 * progresso).toFixed(3));
      }
    }

    if (palavras.length) {
      const altura = window.innerHeight;
      const vistos = new Map();
      palavras.forEach((p) => {
        if (!vistos.has(p.bloco)) {
          const caixa = p.bloco.getBoundingClientRect();
          vistos.set(p.bloco, limitar((altura * 0.9 - caixa.top) / (caixa.height + altura * 0.4), 0, 1));
        }
        const luz = limitar(vistos.get(p.bloco) * (p.total + 1) - p.indice, 0, 1);
        p.span.style.setProperty("--l", luz.toFixed(2));
      });
    }
  }
  const agendarRolagem = () => {
    if (!quadroRolagem) quadroRolagem = window.requestAnimationFrame(aoRolar);
  };
  window.addEventListener("scroll", agendarRolagem, { passive: true });
  window.addEventListener("resize", agendarRolagem, { passive: true });
  aoRolar();

  // 4. Palco: o ponteiro inclina o painel e desloca as camadas em profundidades diferentes (suavizado).
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

  // 5. Partículas douradas: pontos pequenos em profundidades e velocidades diferentes.
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

  // 6. Cartões e fotos com inclinação 3D e brilho que segue o ponteiro.
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

  // 7. Números: contam uma vez quando entram na tela. O valor final já está no HTML.
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

  // 8. Formulário de contato: monta o texto e abre o WhatsApp. Nada é enviado a este site.
  //    Sem JavaScript, o formulário envia só a mensagem (campo "text") ao WhatsApp.
  const formulario = document.querySelector("[data-form-whatsapp]");
  if (formulario) {
    formulario.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const dados = new FormData(formulario);
      const nome = String(dados.get("nome") || "").trim();
      const assunto = String(dados.get("assunto") || "").trim();
      const mensagem = String(dados.get("text") || "").trim();
      const abertura = `Olá! Meu nome é ${nome}.` + (assunto ? ` Assunto: ${assunto}.` : "");
      const url = `${formulario.dataset.whatsapp}&text=${encodeURIComponent(`${abertura}\n\n${mensagem}`)}`;
      window.open(url, "_blank", "noopener");
    });
  }
})();
