# Hero 3D de landing page

O hero tem uma função: fazer a pessoa entender o produto e clicar no botão principal. O 3D atrai o olhar, mas o título e o CTA precisam continuar legíveis e acessíveis em qualquer tela.

## Layout recomendado

```tsx
// app/page.tsx (ou src/pages/Home.tsx)
import { lazy, Suspense } from 'react'
const HeroScene = lazy(() => import('@/components/three/HeroScene'))

export default function Home() {
  return (
    <section className="relative isolate min-h-[90svh] overflow-hidden bg-[var(--background)]">
      {/* Fallback e fundo: aparecem antes do 3D e em navegadores sem WebGL */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(60%_60%_at_70%_40%,var(--accent)_0%,transparent_70%)] opacity-40" />

      {/* Canvas: no desktop fica à direita; no celular vai para trás do texto, mais discreto */}
      <div aria-hidden className="absolute inset-0 -z-10 md:left-1/2">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col justify-center px-4 py-24 md:min-h-[90svh] md:w-1/2 md:px-0">
        <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">Título que diz o que é</h1>
        <p className="mt-4 max-w-md text-lg text-[var(--muted-foreground)]">Uma frase de apoio.</p>
        <a href="#cta" className="mt-8 inline-flex w-fit rounded-full bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)]">Ação principal</a>
      </div>
    </section>
  )
}
```

No celular, se o objeto ficar atrás do texto, reduza a escala dele e/ou a opacidade para manter contraste. Teste a legibilidade do título por cima da cena.

## Padrão A — objeto flutuante que segue o mouse

O mais versátil. Funciona com forma procedural ou com um `.glb` (troque o mesh pelo modelo).

```tsx
// components/three/HeroScene.tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float } from '@react-three/drei'
import { easing } from 'maath'
import { useRef } from 'react'
import type { Group } from 'three'
import { useReducedMotion } from 'motion/react'
import { tokens } from '@/theme/tokens'

function Hero3DObject() {
  const group = useRef<Group>(null!)
  const reduce = useReducedMotion()

  useFrame((state, delta) => {
    if (reduce) return
    // parallax sutil: o grupo "olha" levemente para o ponteiro
    easing.dampE(group.current.rotation, [state.pointer.y * -0.2, state.pointer.x * 0.35, 0], 0.25, delta)
  })

  return (
    <group ref={group}>
      <Float speed={reduce ? 0 : 1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshPhysicalMaterial color={tokens.primary} roughness={0.25} metalness={0.1} clearcoat={1} flatShading />
        </mesh>
      </Float>
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 5], fov: 35 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <Hero3DObject />
      <ContactShadows position={[0, -1.8, 0]} opacity={0.35} blur={2.5} scale={8} far={3} />
      <Environment preset="city" />
    </Canvas>
  )
}
```

```ts
// theme/tokens.ts — fonte única das cores para o 3D (hex). Espelhe no CSS.
export const tokens = {
  primary: '#c2410c',
  accent: '#facc15',
  surface: '#fafaf9',
} as const
```

## Padrão B — blob orgânico (marca moderna, saúde, beleza, tech)

```tsx
import { MeshDistortMaterial, Sphere } from '@react-three/drei'

<Float speed={1.2} floatIntensity={0.6}>
  <Sphere args={[1.3, 96, 96]}>
    <MeshDistortMaterial color={tokens.primary} distort={0.35} speed={1.6} roughness={0.15} metalness={0.2} />
  </Sphere>
</Float>
```

`distort` acima de 0.5 fica "líquido demais". Para vidro, troque por `MeshTransmissionMaterial` (bonito, mas pesado: use `samples={4}`, `resolution={256}` e desative no celular).

## Padrão C — campo de partículas / pontos

Bom para tecnologia, dados, IoT. Use **um** `<points>` com milhares de vértices, nunca milhares de meshes.

```tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points as ThreePoints } from 'three'

function ParticleField({ count = 2500 }) {
  const ref = useRef<ThreePoints>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.5 * Math.cbrt(Math.random())          // distribuição uniforme numa esfera
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3)
    }
    return arr
  }, [count])

  useFrame((_, delta) => { ref.current.rotation.y += delta * 0.05 })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={tokens.accent} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  )
}
```

Para brilho mágico pontual, `<Sparkles count={40} scale={4} size={2} speed={0.4} color={...} />` do drei é mais simples.

## Padrão D — texto/logo 3D

`<Text3D>` exige uma fonte em JSON (typeface). Converta a fonte da marca em https://gero3.github.io/facetype.js/ e coloque em `public/fonts/`. Use `<Center>` para centralizar.

```tsx
import { Center, Text3D } from '@react-three/drei'

<Center>
  <Text3D font="/fonts/Marca_Bold.json" size={0.8} height={0.2} bevelEnabled bevelSize={0.02} bevelThickness={0.02} curveSegments={8}>
    PIZZA
    <meshStandardMaterial color={tokens.primary} />
  </Text3D>
</Center>
```

Para texto chapado dentro da cena (rótulos), use `<Text>` do drei (SDF, leve). O título principal da página continua sendo `<h1>` no DOM.

Se o logo existe em SVG, outra opção é extrudar: `SVGLoader` do three + `ExtrudeGeometry`, ou importar no Blender e exportar `.glb`.

## Padrão E — cena guiada pela rolagem

Duas abordagens:

1. **Canvas fixo + progresso do Motion** (melhor quando as seções são HTML normal):

```tsx
import { useScroll } from 'motion/react'
const { scrollYProgress } = useScroll()         // 0 → 1 na página
// dentro da cena: leia scrollYProgress.get() no useFrame
useFrame((state, delta) => {
  const p = scrollYProgress.get()
  easing.damp3(state.camera.position, [0, 0.5 - p * 2, 5 - p * 2], 0.3, delta)
  state.camera.lookAt(0, 0, 0)
})
```

O `<Canvas>` fica em `fixed inset-0 -z-10` e o conteúdo rola por cima. Passe `scrollYProgress` por props ou contexto.

2. **`<ScrollControls pages={3}>` do drei** (o canvas controla a rolagem; bom para experiências "storytelling" em tela cheia). Use `useScroll().range(inicio, tamanho)` para animar trechos. Atenção: o conteúdo HTML precisa ir em `<Scroll html>`, o que complica SEO — prefira a abordagem 1 em sites comerciais.

## Pós-processamento (opcional)

```tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

<EffectComposer multisampling={0}>
  <Bloom mipmapBlur luminanceThreshold={0.9} intensity={0.6} />
  <Vignette offset={0.3} darkness={0.5} />
</EffectComposer>
```

Bloom só brilha o que passa do limiar: dê `emissive` + `toneMapped={false}` no material que deve brilhar. Desligue os efeitos quando `PerformanceMonitor` detectar queda (ver `performance.md`).
