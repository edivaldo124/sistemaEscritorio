---
name: framerate-scroll-video-site
description: Cria landing pages cinematográficas no estilo dos templates Framerate (ex. "Coworking Space / Local Office") — hero em vídeo controlado pelo scroll (ScrollyVideo), manchetes gigantes que trocam conforme o progresso, tela de loading e medidor de scroll — em Next.js com export estático, com backend opcional (Cloudflare D1 + Drizzle, login com ChatGPT). Use sempre que o usuário pedir um site/landing page com vídeo que avança no scroll, "scroll video", "scrollytelling", hero cinematográfico, site no estilo Framer/Framerate, ou quiser reaproveitar/adaptar o template Coworking Space para outra marca (coworking, imobiliária, hotel, restaurante, produto, portfólio), mesmo que não cite o template pelo nome.
---

# Framerate Scroll-Video Site

Template de origem: **Coworking Space** (marca fictícia "LOCAL / OFFICE", NYC), dos templates do Framerate (`sites.framerate.space`). O projeto completo está em `assets/template/` — sempre parta dele em vez de reescrever do zero, porque os detalhes de timing, tipografia e o fallback do loader já estão calibrados.

## O que o template entrega

Uma página única, sem rolagem de conteúdo "normal": a seção hero tem `500svh` de altura e um vídeo fixo (sticky) cujo frame avança conforme o usuário rola. Por cima do vídeo:

1. **Loader em tela cheia** — wordmark, barra que varre, endereço. Some quando a página, as fontes e o vídeo estão prontos (com watchdog de 4s).
2. **Nav** — wordmark à esquerda, local/ano à direita (texto 10px caixa-alta, tracking 0.14em).
3. **Pilha de manchetes** — array `HEADLINES` (eyebrow, título em 2 linhas, detalhe). O progresso do scroll (0–1) é dividido igualmente entre os itens; a ativa entra com reveal por máscara (linhas sobem de `translateY(112%)`), as anteriores saem para cima.
4. **CTA com seta em círculo** — link (mailto no original) com círculo de 44px que inverte no hover.
5. **Medidor de scroll** — linha vertical de 1px que enche + contador `00–100`, atualizados via ref (sem re-render a cada frame).

Para o detalhamento linha a linha (props do ScrollyVideo, cada classe CSS, tokens, curvas de easing, responsivo), leia `references/anatomia.md`.

## Fluxo de trabalho

### 1. Entender a nova marca
Pergunte (ou deduza do pedido) só o essencial: nome/wordmark, local + ano para a nav, 3–5 manchetes, texto e destino do CTA, URL do vídeo, cor de destaque. Se o usuário não tiver vídeo, mantenha o vídeo do template como placeholder e avise.

### 2. Copiar o template
```bash
bash <skill>/scripts/new_site.sh <destino>
```
O script copia `assets/template/` para o destino e renomeia o `package.json`. Depois: `npm install` (Node ≥ 22.13).

### 3. Customizar — onde mexer
| O quê | Arquivo |
|---|---|
| Vídeo (`HERO_VIDEO`), manchetes (`HEADLINES`), textos do loader, nav, CTA, `aria-label`s | `app/page.tsx` |
| Título, descrição, favicon | `app/layout.tsx` + `public/` |
| Cores (`--white`, `--ink`, `--black`), cor do ponto de status (`#d4ff49`), fonte, tamanhos | `app/globals.css` |
| Duração do scroll (quanto vídeo por rolagem) | `.hero-scroll-track { height: 500svh }` |
| Testes de regressão | `tests/rendered-html.test.mjs` |

Regras que mantêm a qualidade do original:
- **Manchetes curtas**: 2 linhas de 2–4 palavras cada. O `h1` vai até 186px com `letter-spacing: -0.085em` e `line-height: 0.84`; frases longas quebram o layout. Cada linha é um item do array `title`.
- **Chaves únicas**: `key={headline.title.join("-")}` e `key={line}` — evite linhas repetidas entre manchetes.
- Mantenha o `aria-live`, os `aria-hidden` das manchetes inativas e o bloco `prefers-reduced-motion`.
- Atualize o meter por `ref` (como no original) — usar `setState` em `onChange` causa re-render a cada frame.
- Troque o `lang="en"` do `<html>` se o site for em outro idioma (ex. `pt-BR`).
- Vídeo: MP4 H.264 com keyframes frequentes (ex. `ffmpeg -i in.mp4 -c:v libx264 -g 1 -an -movflags +faststart out.mp4` ou `-g 5` se ficar pesado), sem áudio, idealmente < 15–20 MB. Keyframes esparsos deixam o scrub travado.

### 4. Adicionar seções (se pedirem)
O original é só o hero (o teste até proíbe `editorial-section|site-footer`). Se o usuário quiser mais conteúdo, adicione seções **depois** de `</section>` do hero dentro de `<main>`, reutilizando a linguagem visual: fundo `--black`, eyebrows 10px caixa-alta, títulos pesados com tracking negativo, padding lateral `clamp(22px, 4vw, 64px)`. Remova a asserção correspondente do teste.

### 5. Backend opcional
Só se o site precisar de dados ou login: banco D1 com Drizzle, rota de API de exemplo e helpers de "Sign in with ChatGPT". Leia `references/backend-opcional.md` — note que isso exige trocar o export estático pelo build do vinext.

### 6. Verificar
- `npm run build` deve gerar `dist/` sem erros; `npm run lint`.
- Abra o build num servidor estático (ex. `npx serve dist`) e role: o vídeo deve avançar, as manchetes trocar, o meter ir de 00 a 100, e o loader sumir em ≤ 4s.
- Se tiver Playwright, tire screenshots em 0%, 50% e 100% do scroll, em desktop e 390px de largura.

## Armadilhas conhecidas do template
Leia antes de depurar algo estranho:
- **`next dev` + `assetPrefix`**: o `assetPrefix: './'` só vale em produção. Em dev ele quebraria a hidratação e a página ficaria presa no loader — por isso o condicional. Não remova.
- **`onReady` do ScrollyVideo não dispara no caminho HTML5** (sem WebCodecs). O watchdog de 4s em `page.tsx` existe para isso; não apague.
- **Dois builds convivendo**: `next.config.ts` faz export estático (`output: 'export'`, `distDir: 'dist'`), enquanto `vite.config.ts`/`worker/` são do starter vinext (Cloudflare). O script `npm test` importa `dist/server/index.js`, que só existe no build vinext — com o export estático o teste de renderização falha. Para site estático, valide pelo navegador ou adapte o teste para ler `dist/index.html`.
- **Asserção desatualizada**: o teste espera a string `hf_20260824_104803_bb3f7d79` em `page.tsx` (nome antigo do vídeo), mas o código usa `.../hero.mp4`. Ao trocar o vídeo, atualize ou remova essa asserção.
- **Sites servidos em subpasta** (`/template-sites/<slug>/`): por isso URLs de assets são relativas. Use caminhos relativos (`favicon-nyc.svg`, não `/favicon-nyc.svg`).
- `images: { unoptimized: true }` é obrigatório no export estático se usar `next/image`.
- O CSS importa Tailwind v4 via PostCSS, mas o template não usa classes utilitárias — é CSS puro em `globals.css`. Pode usar Tailwind em seções novas se quiser.
