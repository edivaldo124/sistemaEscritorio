// Marca o <html> antes da primeira pintura:
//  - "js": o CSS sabe que o menu móvel e as cenas são controláveis;
//  - "anima": o visitante não pediu movimento reduzido, então os efeitos 3D e de rolagem podem rodar.
document.documentElement.classList.add("js");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("anima");
}
