// Componentes de interface compartilhados (site público e painel interno):
//  - toasts: fechar e sumir sozinhos; window.mostrarToast(mensagem, tipo)
//  - formulários com data-api: enviam JSON para /api/* e redirecionam (antes em app.js, que nenhum template carregava)
//  - confirmação: form[data-confirmar="texto"] abre o diálogo #confirm-dialog (antes em modal.js, que usava ids inexistentes)
(() => {
  "use strict";

  const regiaoToasts = () => document.querySelector("[data-toasts]");

  function fecharToast(toast) {
    if (toast) toast.hidden = true;
  }

  function mostrarToast(mensagem, tipo = "info") {
    const regiao = regiaoToasts();
    if (!regiao) return;
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo} toast--sem-icone`;
    toast.setAttribute("role", tipo === "erro" ? "alert" : "status");
    toast.setAttribute("data-toast", "");

    const texto = document.createElement("p");
    texto.className = "toast__mensagem";
    texto.textContent = mensagem;

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "toast__fechar";
    fechar.setAttribute("data-toast-fechar", "");
    fechar.setAttribute("aria-label", "Fechar aviso");
    fechar.textContent = "×";

    toast.append(texto, fechar);
    regiao.append(toast);
    if (tipo !== "erro") window.setTimeout(() => fecharToast(toast), 6000);
  }
  window.mostrarToast = mostrarToast;

  document.addEventListener("click", (ev) => {
    const botao = ev.target.closest("[data-toast-fechar]");
    if (botao) fecharToast(botao.closest("[data-toast]"));
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-toast]").forEach((toast) => {
      if (!toast.classList.contains("toast--erro")) window.setTimeout(() => fecharToast(toast), 6000);
    });
  });

  // Diálogo de confirmação (usa <dialog> nativo: foco preso, Esc fecha)
  function pedirConfirmacao(texto) {
    const dialogo = document.getElementById("confirm-dialog");
    if (!dialogo || typeof dialogo.showModal !== "function") return Promise.resolve(window.confirm(texto));
    const mensagem = document.getElementById("confirm-dialog-message");
    if (mensagem) mensagem.textContent = texto;
    return new Promise((resolver) => {
      const concluir = (resposta) => {
        dialogo.removeEventListener("click", aoClicar);
        dialogo.removeEventListener("close", aoFechar);
        if (dialogo.open) dialogo.close();
        resolver(resposta);
      };
      const aoClicar = (ev) => {
        if (ev.target.closest("[data-modal-accept]")) concluir(true);
        else if (ev.target.closest("[data-modal-cancel]")) concluir(false);
      };
      const aoFechar = () => concluir(false);
      dialogo.addEventListener("click", aoClicar);
      dialogo.addEventListener("close", aoFechar);
      dialogo.showModal();
    });
  }

  async function enviarParaApi(formulario) {
    const botao = formulario.querySelector('[type="submit"]');
    if (botao) botao.disabled = true;
    try {
      const dados = Object.fromEntries(new FormData(formulario).entries());
      const resposta = await fetch(formulario.dataset.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(dados),
      });
      if (resposta.ok) {
        if (formulario.dataset.redirect) {
          window.location.assign(formulario.dataset.redirect);
          return;
        }
        mostrarToast("Salvo.", "sucesso");
        return;
      }
      let detalhe = "Não foi possível salvar. Confira os campos e tente de novo.";
      try {
        const corpo = await resposta.json();
        if (corpo && typeof corpo.error === "string") detalhe = corpo.error;
      } catch (_) {
        /* resposta sem JSON: mantém a mensagem padrão */
      }
      mostrarToast(detalhe, "erro");
    } catch (_) {
      mostrarToast("Sem conexão com o servidor. Tente de novo em instantes.", "erro");
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  document.addEventListener("submit", (ev) => {
    const formulario = ev.target;
    if (!(formulario instanceof HTMLFormElement)) return;

    if (formulario.dataset.confirmar && formulario.dataset.confirmado !== "1") {
      ev.preventDefault();
      pedirConfirmacao(formulario.dataset.confirmar).then((ok) => {
        if (!ok) return;
        formulario.dataset.confirmado = "1";
        formulario.requestSubmit();
      });
      return;
    }
    delete formulario.dataset.confirmado;

    if (formulario.dataset.api) {
      ev.preventDefault();
      enviarParaApi(formulario);
    }
  });
})();
