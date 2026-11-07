# Checklist de desempenho e acessibilidade (toda cena WebGL)

Percorra antes de entregar. Muitos usuários estão em celulares de entrada e 4G; uma cena que trava ou esquenta o aparelho faz a pessoa sair do site.

## Carregamento

- [ ] Cena importada com `lazy`/`dynamic` e fallback estático com as cores da marca (gradiente ou imagem `.webp`).
- [ ] Conteúdo principal (título, CTA, formulário) renderiza sem esperar o 3D.
- [ ] Modelos `.glb` comprimidos (`gltfjsx --transform`), < 2 MB; `useGLTF.preload` para os da primeira dobra.
- [ ] Texturas em 1024 px ou menos, formato WebP/KTX2.
- [ ] `Environment preset` baixa um HDRI de um CDN externo na primeira vez. Para sites que precisam ser leves/offline ou com CSP, use `<Environment>` com `<Lightformer>` ou um `.hdr` próprio pequeno em `public/`.
- [ ] Cena abaixo da dobra só monta quando entra na tela (`useInView` do Motion ou IntersectionObserver).

## Renderização

- [ ] `dpr={[1, 1.75]}` (ou `[1, 1.5]` em cenas pesadas). Telas com dpr 3 renderizam 9× mais pixels que dpr 1.
- [ ] Cena parada que só reage a interação: `frameloop="demand"` e `invalidate()` ao mudar algo.
- [ ] Muitos objetos iguais: `instancedMesh` / `<Instances>`. Partículas: um único `<points>`.
- [ ] Geometrias e materiais criados com `useMemo` ou declarativamente — nunca `new THREE.X()` dentro do corpo do componente a cada render.
- [ ] `useFrame` sem `setState` (alterar `ref.current` direto). `setState` a 60 fps re-renderiza o React inteiro.
- [ ] Sombras: prefira `<ContactShadows>` ou `<AccumulativeShadows>` (estáticas) a `shadows` em tempo real.
- [ ] Pós-processamento e `MeshTransmissionMaterial` só quando valem a pena, e desligados em aparelho fraco.

## Adaptar ao aparelho

```tsx
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
const [alto, setAlto] = useState(true)

<Canvas dpr={alto ? [1, 1.75] : 1}>
  <PerformanceMonitor onDecline={() => setAlto(false)} onIncline={() => setAlto(true)} flipflops={3} onFallback={() => setAlto(false)} />
  <AdaptiveDpr pixelated />
  {alto && <EffectComposer>...</EffectComposer>}
  ...
</Canvas>
```

Em telas pequenas, reduza contagem de partículas e desligue efeitos já de início (`window.matchMedia('(max-width: 768px)')`).

## Sem WebGL

Alguns navegadores/aparelhos não têm WebGL ou ele falha. O `<Canvas>` aceita `fallback`:

```tsx
<Canvas fallback={<img src="/hero/poster.webp" alt="" className="size-full object-cover" />}>
```

## Memória

- Ao trocar de modelo/rota, o R3F descarta objetos que ele criou. Objetos criados manualmente (`new Texture`, clones) precisam de `.dispose()` no cleanup do `useEffect`.
- Não deixe canvases montados em abas/rotas escondidas.

## Acessibilidade

- [ ] Canvas decorativo com `aria-hidden`; nenhuma informação existe só no 3D.
- [ ] `prefers-reduced-motion`: sem rotação automática, sem parallax, sem câmera seguindo scroll; a cena fica parada e bonita.
- [ ] Controles de órbita não sequestram a rolagem da página (`enableZoom={false}` ou `PresentationControls` sem `global`).
- [ ] Contraste do texto sobre a cena conferido no pior quadro da animação.
- [ ] Interações dentro da cena (clicar em peça, hotspot) também existem como botões no DOM.

## Depuração

- `r3f-perf` (`npm i -D r3f-perf`, `<Perf position="top-left" />`) mostra fps, draw calls e memória. Remova antes de publicar.
- Meta razoável: < 100 draw calls, 60 fps num celular intermediário, primeira dobra interativa < 2,5 s no 4G.
- Teste no celular real (Vite: `npm run dev -- --host` e abra o IP da máquina no celular na mesma rede).
