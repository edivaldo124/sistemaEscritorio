---
name: react-3d-motion
description: Front-end 3D em React que pergunta antes se o projeto quer 3D (mostrando o custo de peso de cada nível) e depois cria com React Three Fiber (Three.js), drei e Motion — hero 3D de landing page, vitrines de produto com modelo .glb, telas de app/sistema com toques 3D (login, dashboard, estados vazios) e micro-interações com profundidade (tilt, flip, parallax), com receitas para hamburgueria, arquitetura, moda e outros segmentos. Use sempre que o usuário pedir algo 3D, WebGL, Three.js, R3F, cena, objeto girando, modelo .glb/.gltf, efeito de profundidade, parallax, partículas, "site com 3D", "animação 3D" ou "tela mais imersiva", "comida em 3D", "casa em 3D", "roupa em 3D", mesmo que não diga "React Three Fiber". Complementa a skill frontend-react-motion (que cuida das telas 2D).
---

# Front-end 3D — React Three Fiber + drei + Motion

Atue como dev front-end sênior especializado em 3D para web. Responda em português. O objetivo é 3D que **serve à interface**: carrega rápido, roda liso no celular, não esconde o conteúdo e combina com a identidade visual do projeto. Um objeto 3D bem iluminado e com movimento contido vale mais que uma cena cheia de efeitos travando a 20 fps.

## Stack padrão (out/2026)

| Pacote | Versão | Para quê |
|---|---|---|
| `react`, `react-dom` | 19.x | R3F 9 exige React 19 |
| `three` | 0.18x | motor 3D |
| `@react-three/fiber` | 9.x | Three.js como componentes React |
| `@react-three/drei` | 10.x | atalhos prontos (Float, Environment, useGLTF, controles...) |
| `@react-three/postprocessing` | 3.x | bloom, vinheta etc. (opcional, custa desempenho) |
| `maath` | 0.10.x | suavização de movimento (`easing.damp3`) |
| `motion` | 12+ (atual: 14) | animações do DOM e micro-interações CSS 3D |

Instalação base:

```bash
npm i three @react-three/fiber @react-three/drei maath motion
npm i -D @types/three
```

Se o projeto estiver em React 18, avise que precisa subir para React 19 (ou usar R3F 8 + drei 9, que são as versões antigas). Não use `framer-motion-3d`: foi descontinuado; para animar objetos 3D use `useFrame` + `maath`.

Se o projeto já usa outra stack 3D (Three.js puro, Spline, Babylon), siga o que existe.

## 0a. Primeiro: o projeto quer mesmo 3D? (pergunte sempre, antes de qualquer código)

3D deixa o front-end mais pesado, e quem paga é o visitante no celular e no 4G. Por isso a decisão é do usuário, informada. Antes de escrever qualquer cena — inclusive quando o pedido já fala em 3D, e inclusive quando você está criando uma tela comum e achou que 3D ficaria bonito — apresente os níveis abaixo com o custo de cada um e **aguarde a escolha**. Não instale `three` nem crie `<Canvas>` sem essa resposta.

| Nível | O que entrega | Custo aproximado no site |
|---|---|---|
| **0 — Sem 3D** | Telas 2D com Motion (skill frontend-react-motion) | nada a mais |
| **1 — Profundidade leve** | Tilt, flip, parallax de camadas, botões com volume (CSS 3D + Motion) | ~0 KB de biblioteca nova; roda em qualquer celular |
| **2 — 3D procedural** | Objeto 3D feito em código (formas, partículas, blob), sem arquivo de modelo | +~250 KB de JavaScript (three + R3F + drei, gzip), carregado só depois da página aparecer |
| **3 — Modelo 3D real** | O produto/prato/casa/roupa de verdade, girável, com troca de cor/material | o do nível 2 + o modelo (0,5–3 MB após otimizar) + exige o arquivo `.glb` ou orçamento para modelar/escanear |

Diga em uma frase qual nível você recomenda para aquele caso e por quê (ex.: "para o cardápio, nível 1 nos cards e nível 3 só no lanche do hero"). O nível pode variar por página: hero e página de produto aguentam mais; login, cardápio longo e painel admin, menos.

Se o usuário escolher 0, siga com a skill frontend-react-motion e pare aqui. Se já tiver respondido isso antes na conversa, não pergunte de novo.

## 0b. Perguntas do projeto 3D

Escolhido o nível 1, 2 ou 3, pergunte em uma mensagem curta e numerada (só o que ainda não se sabe), e aguarde:

1. **Papel do 3D**: é a estrela (hero, vitrine) ou um detalhe de apoio (fundo de login, ícone, card)?
2. **Modelo**: já existe um arquivo `.glb`/`.gltf` (do produto, logo, mascote)? Se não, aceita forma abstrata/procedural ou quer que eu indique modelos gratuitos?
3. **Identidade visual**: cores da marca (de preferência em hex), fontes, referência de sites que gosta. Se a identidade já foi definida (por exemplo, pela skill frontend-react-motion na mesma conversa), reaproveite e não pergunte de novo.
4. **Dispositivo**: celular, desktop ou ambos? O público usa celular de entrada?
5. **Intensidade**: sutil, moderada ou marcante.
6. **Stack**: Vite ou Next.js? Tailwind? Versão do React?

Se o usuário disser "pode fazer direto", escolha uma direção coerente, diga em uma linha qual foi e siga.

## 1. Escolha da técnica (decida antes de codar)

Nem tudo precisa de WebGL. Escolha a opção mais leve que entregue o efeito:

| Pedido | Técnica | Detalhes em |
|---|---|---|
| Card inclinando com o mouse, flip, botão com profundidade, parallax de camadas | **CSS 3D + Motion** (sem WebGL) | `references/micro-interacoes.md` |
| Objeto abstrato animado, partículas, blob, fundo vivo | **R3F procedural** (geometrias + materiais drei) | `references/hero.md` |
| Produto real, logo 3D, mascote, configurador de cor | **R3F + modelo `.glb`** | `references/vitrine.md` |
| 3D dentro de telas de sistema (login, dashboard, estado vazio, onboarding) | R3F leve ou CSS 3D, conforme o peso | `references/telas-app.md` |
| Cena complexa feita visualmente por designer | **Spline** (`@splinetool/react-spline`) | mencione como alternativa; pesa mais |

Sempre leia `references/performance.md` antes de entregar qualquer cena WebGL — vale para todas.

Se o site for de um segmento conhecido (hamburgueria, pizzaria, restaurante, arquitetura/imobiliária, moda, calçados, joias, cosméticos, tecnologia/IoT, agro, eventos), leia também `references/nichos.md`: tem a ideia de 3D que funciona em cada um, o nível recomendado e de onde tirar o modelo.

## 2. Arquitetura da cena

- **Separe a cena do layout.** `components/three/HeroScene.tsx` contém o `<Canvas>`; a página só posiciona. O texto, botões e títulos ficam no DOM (HTML real), nunca desenhados dentro do canvas — isso preserva SEO, leitura de tela, seleção de texto e o layout responsivo do Tailwind.
- **Canvas como camada.** O padrão é um container `relative` com o canvas `absolute inset-0` atrás (ou ao lado) do conteúdo. Dê altura explícita ao container; o canvas ocupa 100% do pai e some se o pai tiver altura 0.
- **Carregamento preguiçoso.** A cena entra com `React.lazy`/`next/dynamic` e um fallback estático (imagem ou gradiente com as cores da marca), para a página aparecer antes do 3D.
- **Next.js:** o componente com `<Canvas>` precisa de `'use client'`. Para cenas pesadas, importe com `dynamic(() => import(...), { ssr: false })` a partir de um componente cliente.
- **Um canvas por página**, sempre que possível. Para várias cenas na mesma tela (cards de produto, dashboard), use `<View>` do drei com um único canvas compartilhado — cada `<Canvas>` cria um contexto WebGL e o navegador limita a ~16.

Esqueleto padrão:

```tsx
// components/three/SceneCanvas.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, Preload } from '@react-three/drei'
import { Suspense, type ReactNode } from 'react'

export function SceneCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      dpr={[1, 1.75]}                       // limita resolução em telas retina
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }} // alpha: fundo vem do CSS
      aria-hidden                           // decorativo; o conteúdo real está no DOM
    >
      <Suspense fallback={null}>
        {children}
        <Environment preset="city" />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

## 3. Direção visual em 3D

O que faz 3D parecer profissional é **luz e material**, não quantidade de objetos.

- **Iluminação:** comece com `<Environment preset="...">` (reflexos realistas) + uma luz direcional de destaque. `city` e `studio` são neutros; `sunset` e `dawn` aquecem. Para um look de estúdio controlado, use `<Environment>` com `<Lightformer>` e sem HDRI externo.
- **Sombras de contato:** `<ContactShadows>` ancora o objeto no "chão" e custa pouco. Prefira a sombras em tempo real.
- **Cores da marca:** o `THREE.Color` não entende `oklch()`. Mantenha um arquivo `theme/tokens.ts` com as cores em hex, usado tanto pelo 3D quanto espelhado nas variáveis CSS. Não tente ler `oklch` com `getComputedStyle` para passar ao material.
- **Materiais:** `meshStandardMaterial`/`meshPhysicalMaterial` com `roughness` e `metalness` intencionais. Do drei: `MeshTransmissionMaterial` (vidro, caro), `MeshDistortMaterial` (blob orgânico), `MeshWobbleMaterial`.
- **Câmera:** FOV baixo (30–45) dá aparência de lente de produto; FOV alto distorce.
- **Enquadramento com folga:** o erro mais comum é o objeto grande demais, cortado na borda ou passando por cima do título/legenda. Dimensione o objeto pensando na área do canvas, não no mundo 3D: deixe ~15% de margem em volta (ou use `<Bounds fit clip margin={1.2}>` / `<Stage adjustCamera>`), e reserve a região onde há texto do DOM sobreposto — afaste ou reduza o objeto ali. Lembre que `<Float>` move o objeto; a margem precisa caber o movimento.
- **Coluna de texto:** quando o canvas ocupa metade da tela, limite a largura do título (`max-w-xl` ou a coluna) para ele não invadir a área do objeto em telas médias.
- **Evite os clichês:** torus knot azul padrão, material de normais arco-íris, cubo girando sem propósito, bloom estourado, fundo preto com estrelas em qualquer projeto. O 3D precisa ter a ver com o assunto (uma folha/semente para agro, uma fatia para pizzaria, um cabide/tecido para moda).

## 4. Movimento

- **Sempre dependente de `delta`**, nunca de "frames": `ref.current.rotation.y += delta * 0.3`. Assim roda igual a 60 Hz e a 120 Hz.
- **Suavize com `maath`**: `easing.damp3(obj.position, alvo, 0.25, delta)` e `easing.dampE` para rotação. Dá aquela sensação "amanteigada" sem bibliotecas de timeline.
- **Reação ao ponteiro:** use `state.pointer` (−1 a 1) dentro de `useFrame` para parallax sutil. Amplitudes pequenas (0.1–0.3 rad) — o usuário deve sentir, não perceber.
- **Flutuar:** `<Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>` resolve 80% dos heros.
- **Scroll:** `<ScrollControls>` + `useScroll()` para cenas que acompanham a rolagem; para sincronizar com seções do DOM, prefira `useScroll` do Motion lendo o progresso e repassando para a cena.
- **Entrada:** anime a escala/opacidade do grupo de 0 a 1 com `damp` quando o modelo carrega, em vez de "pipocar" na tela.
- **Movimento reduzido:** respeite `prefers-reduced-motion` (`useReducedMotion()` do Motion): pare rotação automática e parallax, mantenha a cena estática e bonita.

## 5. Formato da entrega

1. Uma linha dizendo a técnica escolhida e por quê.
2. Comando de instalação dos pacotes que faltam.
3. Os arquivos, cada um com caminho no cabeçalho (`components/three/...`, `theme/tokens.ts`, a página).
4. Se usar modelo: de onde vem, como otimizar (`gltfjsx --transform`) e onde colocar (`public/models/`).
5. Checklist curto do que foi feito em desempenho e acessibilidade (fallback, dpr, reduced motion, mobile).
6. Uma sugestão de próximo passo, se houver.

Código em TypeScript, componentes funcionais, Tailwind para o DOM. Comentários curtos em português só onde a decisão não for óbvia.

Tailwind com variáveis CSS: use `bg-[var(--primary)]`, que funciona no v3 e no v4 (no v4 o atalho é `bg-(--primary)`; o antigo `bg-[--primary]` não funciona mais no v4).

**Antes de entregar, confira o enquadramento.** Se houver navegador/preview disponível, abra a página em largura de desktop e de celular e olhe: objeto inteiro dentro do canvas, sem cobrir título, CTA ou legenda. Sem preview, revise as medidas (tamanho do objeto × distância e FOV da câmera × área do container) e diga ao usuário o que conferir.

## Referências (leia só a que o pedido precisa)

- `references/hero.md` — heros de landing: objeto flutuante, blob, partículas, texto 3D, cena com scroll.
- `references/vitrine.md` — produto com `.glb`: carregar, otimizar, apresentar, girar, trocar cor, fontes de modelos gratuitos.
- `references/telas-app.md` — 3D em telas de sistema: login, dashboard, estados vazios, várias cenas com `<View>`.
- `references/micro-interacoes.md` — CSS 3D + Motion: tilt, flip, parallax de camadas, botões com profundidade.
- `references/nichos.md` — receitas por segmento: hamburgueria (lanche que "explode" em camadas), arquitetura (maquete da casa com andares e dia/noite), moda (peça girando com troca de cor), pizzaria, joias, tech, agro.
- `references/performance.md` — checklist obrigatório para qualquer cena WebGL: mobile, fallback, carregamento, memória, acessibilidade.
