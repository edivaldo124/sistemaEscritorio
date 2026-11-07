# Vitrine de produto 3D (modelo .glb)

## 1. Conseguir o modelo

Ordem de preferência:

1. **Modelo do próprio cliente** (fabricante, designer, escaneamento 3D por foto — apps como Polycam/KIRI geram `.glb` a partir de fotos do produto).
2. **Modelos gratuitos** — confira sempre a licença antes de usar em site comercial:
   - Poly Pizza (poly.pizza) — low-poly, maioria CC0/CC-BY
   - Kenney (kenney.nl) — CC0
   - Sketchfab — filtre por "Downloadable" e licença CC; CC-BY exige crédito
   - Quaternius — CC0
3. **Modelar no Blender** e exportar `File > Export > glTF 2.0 (.glb)`.

Diga ao usuário qual licença o modelo tem e, se for CC-BY, onde colocar o crédito (rodapé ou "Sobre").

## 2. Otimizar (sempre)

Um `.glb` de 20 MB destrói a página no 4G. Meta: **< 2 MB** para hero/vitrine, < 500 KB para elementos decorativos.

```bash
# gera um .glb comprimido (Draco + texturas WebP redimensionadas) e um componente TSX tipado
npx gltfjsx public/models/produto.glb --transform --types --shadows
```

Isso cria `produto-transformed.glb` e `Produto.tsx` com os meshes nomeados, prontos para editar material por peça. Mova o `.tsx` para `components/three/models/`.

Outras dicas: texturas em 1024 px (2048 só para close-up), decimar no Blender (modifier Decimate) se tiver centenas de milhares de polígonos, e conferir em https://gltf.report o tamanho e o que pesa.

## 3. Carregar

```tsx
import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'

// React 19 não tem mais o namespace JSX global: use ThreeElements para tipar props
export function Produto(props: Omit<ThreeElements['primitive'], 'object'>) {
  const { scene } = useGLTF('/models/produto-transformed.glb')
  return <primitive object={scene} {...props} />
}
useGLTF.preload('/models/produto-transformed.glb') // começa a baixar antes do componente montar
```

- `useGLTF` já decodifica Draco (busca o decoder num CDN do Google por padrão). Se o site tiver CSP rígida ou precisar funcionar offline, copie o decoder para `public/draco/` e use `useGLTF(url, '/draco/')`.
- Se o mesmo modelo aparece várias vezes, use o componente gerado pelo `gltfjsx` (que usa `nodes`/`materials`) ou `scene.clone()` — um `primitive` só pode estar em um lugar da cena.
- Envolva em `<Suspense>` com um fallback leve (`<Html center>` com um spinner, ou nada + skeleton no DOM).

## 4. Apresentar

### Opção rápida: `<Stage>`
Centraliza, enquadra, ilumina e coloca sombra sozinho. Ótimo para começar.

```tsx
import { Stage, OrbitControls } from '@react-three/drei'

<Canvas dpr={[1, 1.75]} shadows camera={{ fov: 35 }}>
  <Stage environment="city" intensity={0.6} adjustCamera={1.2} shadows="contact">
    <Produto />
  </Stage>
  <OrbitControls makeDefault enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.9} />
</Canvas>
```

### Opção controlada: montar a luz você mesmo
Quando a marca pede um look específico.

```tsx
<Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.6, 4], fov: 32 }}>
  <Center top>
    <Produto />
  </Center>
  <ContactShadows position={[0, 0, 0]} opacity={0.4} blur={2.4} scale={6} far={2} />
  <Environment resolution={256}>
    {/* "softbox" de estúdio, sem baixar HDRI */}
    <Lightformer form="rect" intensity={3} position={[2, 3, 2]} scale={[3, 2, 1]} />
    <Lightformer form="rect" intensity={1.5} position={[-3, 1, -1]} scale={[2, 4, 1]} />
    <Lightformer form="ring" intensity={1} position={[0, 4, -4]} scale={2} />
  </Environment>
</Canvas>
```

## 5. Interação

| Objetivo | Componente | Observação |
|---|---|---|
| Usuário gira livremente | `<OrbitControls>` | trave pan e limite ângulos; `enableZoom={false}` em páginas que rolam, senão o scroll da página vira zoom |
| Girar "com mola" e voltar | `<PresentationControls>` | melhor para vitrine em página que rola; `snap` faz voltar à pose |
| Girar sozinho | `autoRotate autoRotateSpeed={0.6}` no OrbitControls | desligue com reduced motion |
| Enquadrar ao clicar numa peça | `<Bounds fit clip observe>` + `useBounds()` | para "zoom no detalhe" |
| Hotspot com informação | `<Html position={[x,y,z]} occlude>` | o conteúdo é DOM real (acessível); use poucos |

```tsx
import { PresentationControls } from '@react-three/drei'

<PresentationControls
  global
  snap
  rotation={[0, 0.3, 0]}
  polar={[-0.1, 0.2]}
  azimuth={[-0.8, 0.8]}
>
  <Produto />
</PresentationControls>
```

No celular, arrastar dentro do canvas compete com a rolagem. Com `PresentationControls` sem `global`, só o objeto captura o gesto; deixe espaço livre ao redor para a pessoa rolar. Considere `touch-action: pan-y` no container.

## 6. Configurador (trocar cor/material)

O botão de cor é DOM (acessível, Tailwind); a cor vai para o material por estado.

```tsx
// components/three/models/Tenis.tsx (gerado pelo gltfjsx e editado)
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'

export function Tenis({ cor }: { cor: string }) {
  const { nodes, materials } = useGLTF('/models/tenis-transformed.glb') as unknown as {
    nodes: Record<string, Mesh>
    materials: Record<string, MeshStandardMaterial>
  }
  // clona o material para não alterar o cache do useGLTF (outras instâncias do modelo)
  const cabedal = useMemo(() => materials.Cabedal.clone(), [materials])
  // transição suave de cor em vez de troca seca
  useFrame((_, delta) => { easing.dampC(cabedal.color, cor, 0.2, delta) })
  return (
    <group dispose={null}>
      <mesh geometry={nodes.Cabedal.geometry} material={cabedal} />
      <mesh geometry={nodes.Sola.geometry} material={materials.Sola} />
    </group>
  )
}
```

```tsx
// na página
const cores = [{ nome: 'Areia', hex: '#d6c3a5' }, { nome: 'Terracota', hex: '#b45309' }, { nome: 'Grafite', hex: '#3f3f46' }]
const [cor, setCor] = useState(cores[0].hex)

<div role="radiogroup" aria-label="Cor" className="flex gap-3">
  {cores.map(c => (
    <button key={c.hex} role="radio" aria-checked={cor === c.hex} aria-label={c.nome}
      onClick={() => setCor(c.hex)}
      className="size-9 rounded-full ring-2 ring-offset-2 ring-transparent aria-checked:ring-[var(--primary)]"
      style={{ background: c.hex }} />
  ))}
</div>
```

Os nomes `nodes.Cabedal`, `materials.Sola` vêm do modelo; confira no componente gerado ou em gltf.report. Não invente nomes de meshes — se não souber, peça o arquivo ou deixe um comentário dizendo onde trocar.

## 7. Vitrine com vários produtos

Para um grid de cards, cada um com um modelo girando, **não** crie um `<Canvas>` por card. Use `<View>` (ver `telas-app.md`) ou, se forem muitos itens, mostre imagens estáticas renderizadas (pode ser print do próprio canvas) e ative o 3D só no card em foco/hover ou na página do produto.

## 8. Alternativa: `<model-viewer>`

Para quem só precisa "mostrar o .glb com girar e AR no celular", o web component `@google/model-viewer` é mais simples que R3F e tem botão de AR nativo (Quick Look no iOS, Scene Viewer no Android). Mencione quando o pedido for só isso.
