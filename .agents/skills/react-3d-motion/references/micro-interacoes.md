# Micro-interações com profundidade (CSS 3D + Motion)

Para cards, botões, imagens e seções, o 3D do CSS (`perspective`, `rotateX/Y`, `translateZ`) com Motion é mais leve que WebGL, acessível por padrão, nítido em qualquer tela e não precisa de modelo. Use WebGL só quando precisar de um objeto de verdade.

Base: o pai define `perspective`; os filhos usam `transformStyle: 'preserve-3d'` para que camadas com `translateZ` fiquem à frente.

## Card com tilt (inclina seguindo o mouse)

```tsx
'use client'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import type { ReactNode, PointerEvent } from 'react'

export function TiltCard({ children, max = 10 }: { children: ReactNode; max?: number }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })
  // brilho que acompanha o cursor
  const glare = useTransform([x, y], ([gx, gy]: number[]) =>
    `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgb(255 255 255 / 0.25), transparent 60%)`)

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== 'mouse') return   // no toque, sem tilt
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width)
    y.set((e.clientY - r.top) / r.height)
  }
  function onLeave() { x.set(0.5); y.set(0.5) }

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl border bg-[var(--card)] p-6 shadow-lg will-change-transform"
      >
        {children}
        <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-2xl" />
      </motion.div>
    </div>
  )
}
```

Para destacar camadas dentro do card: `<div style={{ transform: 'translateZ(40px)' }}>` no ícone ou preço. Valores de 20–60 px; além disso a camada "sai" do card de forma estranha.

Se o card tiver um objeto WebGL dentro (via `<View>` do drei), ele **não** inclina junto — veja a seção `<View>` em `telas-app.md` para a solução.

## Flip (frente e verso)

```tsx
const [virado, setVirado] = useState(false)

<button onClick={() => setVirado(v => !v)} aria-pressed={virado} className="[perspective:1000px]">
  <motion.div
    animate={{ rotateY: virado ? 180 : 0 }}
    transition={{ type: 'spring', stiffness: 160, damping: 18 }}
    style={{ transformStyle: 'preserve-3d' }}
    className="relative h-56 w-40"
  >
    <div className="absolute inset-0 [backface-visibility:hidden]">Frente</div>
    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">Verso</div>
  </motion.div>
</button>
```

Com reduced motion, troque a rotação por um crossfade de opacidade.

## Parallax de camadas no hero (sem WebGL)

Várias imagens PNG/SVG recortadas em camadas, cada uma se move numa velocidade com o mouse ou a rolagem. Dá sensação de profundidade com custo quase zero.

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
const yFundo = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
const yMeio  = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

<section ref={ref} className="relative h-[90svh] overflow-hidden">
  <motion.img style={{ y: yFundo }} src="/hero/fundo.webp" className="absolute inset-0 size-full object-cover" alt="" />
  <motion.img style={{ y: yMeio }}  src="/hero/meio.webp"  className="absolute inset-x-0 bottom-0" alt="" />
  <div className="relative z-10">{/* título e CTA */}</div>
</section>
```

## Botão com profundidade

```tsx
<motion.button
  whileHover={{ y: -2 }}
  whileTap={{ y: 2, boxShadow: '0 0 0 0 var(--primary-shadow)' }}
  style={{ boxShadow: '0 4px 0 0 var(--primary-shadow)' }}
  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-[var(--primary-foreground)]"
>
  Pedir agora
</motion.button>
```

A "espessura" vem da sombra sólida deslocada; no clique ela some e o botão desce. Defina `--primary-shadow` como uma versão mais escura da cor da marca.

## Carrossel em anel 3D (cards em círculo)

Cards posicionados com `rotateY(i * 360/n) translateZ(raio)` dentro de um container `preserve-3d`, e o container gira. Bom para vitrine de categorias com 5–8 itens. Garanta navegação por teclado (setas) e que o card da frente seja o único focável/clicável.

## Regras gerais

- Anime só `transform` e `opacity` (rápidos). Não anime `width`, `top`, `box-shadow` em loop.
- Tilt e parallax ligados ao mouse: desative no toque (`pointerType`) e com reduced motion.
- Mantenha o conteúdo clicável grande e estável — o efeito não pode fazer o botão "fugir" do dedo.
