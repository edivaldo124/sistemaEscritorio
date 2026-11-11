// Marca o <html> antes da primeira pintura:
//  - "js": o CSS sabe que o menu móvel e as cenas são controláveis;
//  - "anima": o visitante não pediu movimento reduzido, então os efeitos 3D e de rolagem podem rodar;
//  - "abertura-pendente": primeira página desta aba, então a abertura da Home pode aparecer
//    (o CSS só a mostra onde a marcação existe; site.js a encerra e grava a visita no sessionStorage).
document.documentElement.classList.add("js");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("anima");
  try {
    if (!window.sessionStorage.getItem("mfv-abertura")) document.documentElement.classList.add("abertura-pendente");
  } catch (_) {
    /* armazenamento bloqueado: segue sem abertura */
  }
}
