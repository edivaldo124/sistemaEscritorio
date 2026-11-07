# 3D em telas de aplicação e sistema

Em telas de trabalho (login, dashboard, painel admin, cadastro), o usuário quer terminar uma tarefa. O 3D aqui é **tempero**: dá personalidade e sensação de produto bem-acabado, sem atrasar o primeiro clique nem competir com os dados.

Regra prática: se o 3D sumisse, a tela continuaria funcionando igual. Ele nunca carrega informação que não esteja também no DOM.

## Onde 3D funciona bem em apps

| Tela | Ideia | Peso |
|---|---|---|
| Login / cadastro | metade da tela com cena da marca (objeto flutuante, partículas) e o formulário na outra; no celular, cena vira faixa curta no topo ou some | médio |
| Splash / onboarding | ilustração 3D por passo, trocando com transição | médio |
| Estado vazio ("nenhum pedido ainda") | objeto 3D pequeno e simpático flutuando | leve |
| Sucesso / conquista | objeto que entra girando + confete/partículas por 1–2 s | leve |
| Dashboard | **um** destaque: globo com pontos de clientes, mapa da fazenda em relevo, KPI principal em card com tilt | médio |
| Ícones de seção | CSS 3D (tilt/flip) em vez de WebGL | leve |

Onde **não** usar: tabelas, formulários longos, telas que o operador abre 200 vezes por dia. Lá, micro-interações 2D (skill frontend-react-motion) bastam.

## Login com cena lateral

```tsx
// app/login/page.tsx
import { lazy, Suspense } from 'react'
const LoginScene = lazy(() => import('@/components/three/LoginScene'))

export default function LoginPage() {
  return (
    <main className="grid min-h-svh md:grid-cols-[1.1fr_1fr]">
      <aside aria-hidden className="relative hidden overflow-hidden bg-[var(--primary)] md:block">
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />}>
          <LoginScene />
        </Suspense>
        <p className="absolute bottom-8 left-8 max-w-xs text-[var(--primary-foreground)]/90">Frase curta da marca.</p>
      </aside>
      <section className="flex items-center justify-center px-4 py-12">
        {/* formulário normal (shadcn/ui, react-hook-form) */}
      </section>
    </main>
  )
}
```

Detalhes que fazem diferença:
- O formulário deve estar utilizável **antes** do canvas carregar. Nunca coloque o `<form>` dentro de `<Suspense>` junto com a cena.
- Pause a cena quando o input estiver em foco? Não precisa; mas use `frameloop="demand"` se a cena for estática e só reagir ao mouse (ver `performance.md`).
- Reação ao formulário dá um toque bom: erro de senha → objeto "balança" (`damp` de rotação com um impulso); sucesso → objeto sobe e some antes do redirecionamento. Passe o estado por props ou por uma store pequena (zustand, que o R3F já usa internamente).

```tsx
// reagindo a um estado externo sem recriar a cena
function Mascote({ status }: { status: 'idle' | 'erro' | 'ok' }) {
  const ref = useRef<Group>(null!)
  const t0 = useRef(0)
  useEffect(() => { t0.current = performance.now() }, [status])
  useFrame((_, delta) => {
    const t = (performance.now() - t0.current) / 1000
    const shake = status === 'erro' && t < 0.6 ? Math.sin(t * 40) * 0.15 * (1 - t / 0.6) : 0
    easing.dampE(ref.current.rotation, [0, shake, 0], 0.05, delta)
    easing.damp3(ref.current.position, [0, status === 'ok' ? 3 : 0, 0], 0.35, delta)
  })
  return <group ref={ref}>{/* modelo */}</group>
}
```

## Várias cenas na mesma tela: `<View>`

Cada `<Canvas>` cria um contexto WebGL (o navegador aguenta ~16 e cada um custa memória). Para cards de dashboard, lista de produtos ou ícones 3D, use **um canvas fixo** e vários `<View>`:

```tsx
// components/three/ViewsRoot.tsx — coloque uma vez no layout
'use client'
import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'

export function ViewsRoot() {
  return (
    <Canvas
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      className="!pointer-events-none !fixed !inset-0 -z-0"
      dpr={[1, 1.5]}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  )
}
```

```tsx
// em qualquer card
import { View, PerspectiveCamera, Environment } from '@react-three/drei'

<div className="relative h-40 rounded-2xl border bg-[var(--card)]">
  <View className="absolute inset-0">
    <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
    <ambientLight intensity={0.5} />
    <Environment preset="city" />
    <IconeMoeda />
  </View>
  <p className="relative p-4 text-sm">Receita do mês</p>
</div>
```

A `<View>` rastreia a posição da `div` e desenha naquela área do canvas compartilhado. Ela some quando a div sai da tela, então o custo acompanha o que está visível.

**Limitação importante:** a `<View>` só acompanha a posição e o tamanho do retângulo da div. Transformações CSS 3D de um pai (tilt com `rotateX/Y`, `translateZ`, flip) **não** são aplicadas ao conteúdo 3D — o card inclina e o objeto fica "chapado" por cima. Para combinar tilt com objeto 3D:
- passe os valores do tilt para a cena (o mesmo `x`/`y` do Motion vira rotação do objeto no `useFrame`), ou
- use um ícone 2D/imagem no card com tilt e reserve o 3D para cards sem tilt.

## Dashboard: globo ou mapa com pontos

- Globo: esfera com `meshStandardMaterial` + pontos via `instancedMesh` (um ponto por cliente/sensor). Converta lat/long em posição: `x = r·cos(lat)·cos(lon)`, `y = r·sin(lat)`, `z = −r·cos(lat)·sin(lon)` (lat/lon em radianos).
- Muitos pontos iguais → **sempre** `instancedMesh` ou `<Instances>` do drei, nunca um mesh por ponto.
- Dados vêm da mesma fonte da tabela (TanStack Query); a cena só lê. Tooltip ao passar o mouse com `<Html>` mostrando o mesmo dado da linha da tabela.
- Ofereça a mesma informação em texto/tabela ao lado — o globo é visão geral, não a única forma de ler o dado.

## Transições entre telas

Para "o objeto 3D acompanha a navegação" (ex.: produto que voa da lista para a página do produto), mantenha o canvas no layout persistente (fora da rota) e mova o objeto por estado da rota. Em Next.js, o canvas fica em `app/layout.tsx` (componente cliente) e escuta `usePathname()`.

Para transições comuns de página, use Motion no DOM (`AnimatePresence`) — não precisa de 3D.
