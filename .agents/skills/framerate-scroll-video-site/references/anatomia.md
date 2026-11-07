# Anatomia do template Coworking Space

## Sumário
1. Estrutura de arquivos
2. Stack e versões
3. `app/page.tsx` — lógica
4. `app/globals.css` — sistema visual
5. Responsivo e acessibilidade

---

## 1. Estrutura de arquivos (`assets/template/`)
```
app/
  page.tsx          # toda a landing (client component)
  layout.tsx        # metadata, favicon, <html lang>
  globals.css       # todo o CSS (puro, sem utilitários)
  chatgpt-auth.ts   # helpers opcionais de login (ver backend-opcional.md)
public/             # favicon-nyc.svg (🗽 em quadrado #0c0c0c), favicon.svg, ícones padrão
db/                 # index.ts (getDb com D1) + schema.ts vazio
drizzle/            # pasta de migrations (journal vazio)
examples/d1/        # exemplo de tabela notes + rota GET/POST
worker/index.ts     # entry do Cloudflare Worker (vinext) + otimização de imagem
tests/rendered-html.test.mjs
.openai/hosting.json   # { "d1": null, "r2": null }
next.config.ts  vite.config.ts  drizzle.config.ts  eslint.config.mjs
tsconfig.json  postcss.config.mjs  pnpm-workspace.yaml  scrolly-video.d.ts
```

## 2. Stack e versões
- Next `^16.3.3`, React/ReactDOM `19.2.6`, TypeScript `5.9.3`
- `scrolly-video` `0.0.24` (import `scrolly-video/dist/ScrollyVideo.esm.jsx`; tipos em `scrolly-video.d.ts`)
- Tailwind `4.2.1` via `@tailwindcss/postcss` (instalado, não usado no hero)
- Opcional: `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`, `vinext 1.0.0-beta.2`, `vite 8`, `wrangler 4.92`, `@cloudflare/vite-plugin`, `@openai/sites-vite-plugin`
- ESLint 9 flat config: recommended + typescript-eslint + react + react-hooks + jsx-a11y + next core-web-vitals
- Node `>=22.13.0`

## 3. `app/page.tsx`

`"use client"`. Constantes:
- `HERO_VIDEO = "https://sites.framerate.space/template-assets/coworking-space/hero.mp4"`
- `HEADLINES`: array de `{ eyebrow, title: [linha1, linha2], detail }`. Conteúdo original:
  1. "Manhattan / New York" — "Work in the / heart of NYC." — "Flexible spaces for people building what's next."
  2. "For the people building what's next" — "Make space / for what's next." — "Room to focus, meet, move, and make the day your own."
  3. "A city that keeps you moving" — "Stay close / to the energy." — "Work in the middle of everything worth stepping out for."
  4. "The workday, in its best light" — "Your next move / starts here." — "Come find your place in the heart of New York."

Estado:
- `videoReady` — `onReady` do ScrollyVideo **ou** watchdog `setTimeout(4000)`.
- `siteReady` — `Promise.all([window load, document.fonts.ready])`.
- `isLoaded = videoReady && siteReady` → tira `site-loading` do body (que trava o scroll com `overflow:hidden`) e adiciona `is-complete` ao loader.
- `activeHeadline` (state) + `headlineIndexRef` (evita setState redundante).
- `meterFillRef`, `meterValueRef` — DOM direto.

Props do `<ScrollyVideo>`:
```tsx
src={HERO_VIDEO} cover sticky full trackScroll lockScroll={false}
transitionSpeed={8} frameThreshold={0.02} useWebCodecs
onReady={() => setVideoReady(true)}
onChange={(percentage) => { ... }}
```
`onChange`: `progress = clamp(percentage, 0, 1)`; `value = round(progress*100)` com `padStart(2,"0")`; `nextHeadline = min(len-1, floor(progress / (1/len)))`; altura do fill = `max(4, progress*100)%`.

Classes de estado por manchete: `is-active` (index === ativo), `is-before` (index < ativo), `is-after` (index > ativo).

Marcação (ordem): `.site-loader` (topline: wordmark + "NYC / 2026"; center: eyebrow "Preparing your place in the city", `.site-loader-bar>span`, status "Loading"; bottomline: "11 West 24th Street" + "New York, NY") → `<main.site-shell>` → `<section.hero-scroll-track#top>` → ScrollyVideo → `.hero-tint` → `.hero-overlay` (`header.site-nav`, `.hero-copy > .headline-stack > .headline-state*`, `.scroll-meter`).

Cada `.headline-state`: `p.eyebrow.hero-eyebrow` (com `span.status-dot` que fica verde-limão quando `videoReady`) → `h1` com `span.headline-line > span` por linha → `.hero-bottomline` (p + `a.circle-arrow-link` com `span` texto + `span.circle-arrow` "↓"). CTA original: `mailto:hello@localoffice.nyc?subject=Explore%20Spaces`.

## 4. `app/globals.css`

**Tokens**: `--white: #f7f7f4` (off-white quente), `--ink: #111111`, `--black: #0c0c0c`. Destaque: `#d4ff49` (status dot pronto). Brancos translúcidos: `rgba(247,247,244, .28 / .4 / .5 / .58 / .7 / .72 / .74)`.

**Tipografia**: `Arial, Helvetica, sans-serif` (sem webfont — é proposital, o teste exige), body 15px, antialiased.
- Microtexto (eyebrow, nav-location, labels do meter/loader): 10px, peso 700, `letter-spacing: 0.12–0.14em`, caixa-alta, `line-height: 1.3`.
- Wordmark: 12px, peso 800, `letter-spacing: -0.03em`.
- H1: `clamp(62px, 11.3vw, 186px)`, peso 800, `letter-spacing: -0.085em`, `line-height: 0.84`, `max-width: 1200px`.
- Detalhe: 16px / 1.25, `max-width: 270px`. CTA: 11px, 700, `0.1em`, caixa-alta.

**Layout**: padding lateral global `clamp(22px, 4vw, 64px)`; padding vertical 24px topo / 28px base.
- `.hero-scroll-track`: `height: 500vh; height: 500svh` (fallback + svh).
- `.hero-tint` e `.hero-overlay`: `position: sticky; top: 0; height: 100vh; margin-top: -100vh` — truque para empilhar sobre o vídeo sticky. Overlay tem `pointer-events: none` e reativa em nav/CTA. Tint quase transparente (`rgba(0,0,0,.015)`) — aumente se o vídeo for claro e o texto perder contraste.
- `.hero-copy`: absoluto em `top: 50%`, `translateY(-42%)`. `.headline-stack`: altura `clamp(380px, 39vw, 560px)`; estados empilhados com `inset: 0`.
- `.hero-bottomline`: flex, `margin-top: auto` (gruda no fim da pilha), largura `min(670px, 100%)`.
- `.scroll-meter`: absoluto canto inferior direito, grid `1px | minmax(0,170px)`, `min-height: 104px`.
- z-index: vídeo 0, tint 1, overlay 2, loader 30.

**Movimento**:
- Easing principal: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out).
- Linha do h1: `transform 780ms`; segunda linha atrasa 75ms. Fora: `±112%`.
- Eyebrow/bottomline: opacity 260ms + transform 460ms, deslocamento `±14px`, delays 90ms / 150ms.
- Estado inteiro: opacity 260ms.
- Loader: fade 500ms; barra `loader-sweep` 1.35s ease-in-out infinite (35% de largura, de 0 a `translateX(385%)`).
- Círculo do CTA: background/color 180ms. Fill do meter: `height 120ms linear`.

## 5. Responsivo e acessibilidade
`@media (max-width: 720px)`: overlay `min-height: 560px`, padding 22/24; nav-location 9px; `.hero-copy` `top: 46%`, `translateY(-40%)`; pilha 410px; H1 `clamp(54px, 15vw, 108px)`, `line-height .86`; bottomline vira coluna com gap 26px, 15px; meter `right/bottom 22px`, coluna 116px, `min-height 90px`, label 9px.

`@media (prefers-reduced-motion: reduce)`: `scroll-behavior: auto` e remove transições de manchetes e loader.

A11y presente: `aria-label` na section, wordmark, CTA e meter; `aria-live="polite"` no loader e na pilha; `aria-hidden` nas manchetes inativas e no loader concluído; `-webkit-tap-highlight-color: transparent`.
