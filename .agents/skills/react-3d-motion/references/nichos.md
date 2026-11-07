# Receitas de 3D por segmento

Cada receita diz: a ideia que funciona, o nível recomendado (ver 0a no SKILL.md), de onde vem o modelo e como montar. Adapte à identidade do cliente — a receita é ponto de partida, não template.

Uma alternativa vale para todos os segmentos e deve ser oferecida quando o peso for preocupação: **sequência de imagens ou vídeo "turntable"**. Renderiza-se o objeto girando (Blender, ou gravando o próprio canvas) em 60–120 quadros WebP, e a rolagem/arrasto troca o quadro (técnica usada em sites de produto da Apple). Visual de 3D com qualidade de render, sem WebGL, ~1–3 MB carregados aos poucos — mas sem trocar cor em tempo real.

---

## Hamburgueria / lanchonete

**Ideia de destaque:** o lanche "explode" em camadas conforme a pessoa rola (pão, queijo, carne, salada, molho, pão), cada camada com um rótulo ao lado ("blend 180 g", "cheddar inglês"). Ao chegar na seção do cardápio, ele se monta de novo.

- **Nível:** 3 no hero (modelo real do lanche) ou 2 (camadas estilizadas feitas de cilindros/discos com materiais bem trabalhados — fica com cara de ilustração 3D, combina com marcas divertidas).
- **Modelo:** escaneamento por foto (Polycam/KIRI, com o lanche real em mesa giratória) dá o resultado mais apetitoso; modele **cada camada como um objeto separado**, é isso que permite explodir. Modelos gratuitos de hambúrguer em Poly Pizza/Sketchfab servem para protótipo.
- **Luz:** quente (`Environment preset="sunset"` ou Lightformers âmbar), fundo escuro; comida fica apetitosa com brilho especular no pão e no molho (`roughness` baixo nessas camadas).
- **Cardápio:** não ponha um canvas por item. Cards com foto + tilt (nível 1) e o 3D só no hero e na página do item.

```tsx
// camadas separadas pelo progresso da rolagem (0 = montado, 1 = explodido)
const camadas = ['PaoTopo', 'Molho', 'Salada', 'Queijo', 'Carne', 'PaoBase'] // nomes vindos do .glb
function Burger({ progresso }: { progresso: MotionValue<number> }) {
  const { nodes } = useGLTF('/models/burger-transformed.glb') as unknown as { nodes: Record<string, Mesh> }
  const refs = useRef<(Mesh | null)[]>([])
  useFrame((_, delta) => {
    const p = progresso.get()
    camadas.forEach((_, i) => {
      const alvoY = (camadas.length / 2 - i) * 0.45 * p // espaça as camadas a partir do centro
      const m = refs.current[i]
      if (m) easing.damp(m.position, 'y', m.userData.baseY + alvoY, 0.2, delta)
    })
  })
  return (
    <group>
      {camadas.map((nome, i) => (
        <mesh key={nome} ref={(m) => { refs.current[i] = m; if (m) m.userData.baseY ??= nodes[nome].position.y }}
          geometry={nodes[nome].geometry} material={nodes[nome].material} position={nodes[nome].position} />
      ))}
    </group>
  )
}
```

Os rótulos de cada camada ficam no DOM, alinhados por seção de rolagem (ou com `<Html>` preso à camada, poucos).

---

## Pizzaria

**Ideia:** fatia sendo puxada com o queijo esticando (animação feita no Blender e exportada no `.glb`, tocada com `useAnimations`), ou a pizza girando devagar enquanto o cliente monta os sabores e os ingredientes "caem" sobre ela.

- **Nível:** 2–3 no hero e no montador de pizza; cardápio em nível 1.
- **Montador:** cada ingrediente é um `instancedMesh` (rodelas de calabresa, azeitonas) espalhado sobre a metade escolhida; o estado vem do mesmo carrinho do app.
- **Animação embutida:**

```tsx
const { scene, animations } = useGLTF('/models/fatia.glb')
const { actions } = useAnimations(animations, scene)
useEffect(() => {
  const puxar = actions['Puxar'] // nome da animação definido no Blender
  if (!puxar) return
  puxar.reset().setLoop(THREE.LoopOnce, 1)
  puxar.clampWhenFinished = true // para no último quadro em vez de voltar
  puxar.play()
}, [actions])
```

---

## Arquitetura, construtora, imobiliária

**Ideia de destaque:** maquete 3D da casa/edifício que a pessoa gira; botões para **separar os andares** (o telhado sobe, os pavimentos se afastam e mostram as plantas), alternar **dia/noite** e clicar em ambientes para ver área e foto real.

- **Nível:** 3. Aqui o 3D é o produto, vale o peso — mas só na página do empreendimento, nunca na listagem.
- **Modelo:** o escritório já tem o projeto em SketchUp, Revit, ArchiCAD ou Blender. Exporte para `.glb` (SketchUp/Revit → `.fbx`/`.ifc` → Blender → glTF), **removendo o que não aparece** (mobiliário detalhado, parafusos, faces internas). Separe em objetos nomeados: `Telhado`, `Pavimento1`, `Pavimento2`, `Terreno`, `Vidros`. Meta: < 3 MB. Faça o *bake* da iluminação no Blender (luz "pintada" na textura) para ficar realista e leve.
- **Separar andares:** mesma técnica do lanche — `easing.damp` na posição Y de cada pavimento conforme um estado `explodido`.
- **Dia/noite:** dois `Environment` (ou intensidade e cor das luzes) interpolados; à noite, janelas com `emissive` amarelado e um `Bloom` leve.
- **Ambientes clicáveis:** `onClick` no mesh do cômodo → `<Bounds>` enquadra o cômodo; a ficha (área, fotos) abre num painel do DOM. Repita os mesmos dados numa lista de cômodos para quem não usa o 3D.
- **Câmera:** `OrbitControls` com `minPolarAngle`/`maxPolarAngle` (não deixar ir para baixo do terreno), distância mínima e máxima, `enablePan={false}`.
- **Tour interno / walkthrough:** câmera em primeira pessoa é pesado e enjoa no celular; prefira fotos 360° (panorama numa esfera invertida) por cômodo, ligadas pela maquete.

```tsx
// janela que acende à noite
<meshStandardMaterial color="#1b2430" emissive="#ffcc80" emissiveIntensity={noite ? 1.4 : 0} toneMapped={!noite} />
```

---

## Moda, roupas, calçados, bolsas

**Ideia de destaque:** a peça girando em vitrine (manequim invisível), com seletor de cores/estampas que muda o tecido ao vivo, zoom no detalhe da costura e botão "ver no meu espaço" (AR) no celular.

- **Nível:** 3 na página do produto e no hero da coleção; grade de produtos em nível 1 (foto com tilt e troca de foto no hover).
- **Modelo:** roupas vêm de CLO 3D ou Marvelous Designer (o estilista ou o fornecedor costuma ter); calçados e bolsas, de escaneamento por foto ou do fabricante. Peça a versão "para web" (poucos polígonos + mapas de normal para o relevo do tecido).
- **Tecido convincente:** `meshPhysicalMaterial` com `sheen` (veludo, malha), `normalMap` da trama, `roughness` alto; jeans e couro pedem `normalMap` e `roughnessMap` próprios. Troca de estampa = trocar `map` (textura) com `useTexture`.
- **Troca de cor suave:** `easing.dampC` no `color` do material (exemplo completo em `vitrine.md`).
- **Detalhe:** clique numa área → `<Bounds>` aproxima; ou `<Html>` com um botão "ver costura" que move a câmera para uma pose salva.
- **AR:** para "provar no espaço", `@google/model-viewer` com `ar` resolve no iOS e Android com o mesmo `.glb`.
- **Fundo:** estúdio claro e neutro (`Lightformer` brancos, `ContactShadows` suave) — a roupa é a cor da cena.

```tsx
const estampa = useTexture('/texturas/xadrez.webp')
estampa.colorSpace = THREE.SRGBColorSpace
estampa.flipY = false // texturas de glTF não são invertidas
<meshPhysicalMaterial map={estampa} sheen={0.6} sheenRoughness={0.8} roughness={0.85} />
```

---

## Joias, relógios, cosméticos

**Ideia:** produto em close com reflexos de estúdio, girando devagar; luz que "passa" pela peça quando a pessoa rola.

- **Nível:** 3. Metal e vidro dependem de bons reflexos: `Environment` com `Lightformer` em forma de faixa (softbox) e `metalness={1} roughness={0.1}`.
- Gemas e frascos: `MeshTransmissionMaterial` (bonito e caro) — limite a desktop e use material simples no celular via `PerformanceMonitor`.
- A "luz que passa": anime a posição de um `Lightformer` com o progresso da rolagem.

---

## Tecnologia, SaaS, IoT

**Ideia:** objeto que representa o produto (dispositivo, chip, sensor) com dados fluindo como partículas; ou um globo com pontos de clientes.

- **Nível:** 2 normalmente basta. Use partículas (`<points>`) e linhas em vez de modelos pesados.
- Evite o clichê "esfera de rede neural roxa"; ligue o visual ao produto real.

---

## Agro, sustentabilidade

**Ideia:** broto/planta sobre um torrão em estilo low-poly, campo de pontos como sensores; ou um talhão em relevo (mapa de altura de verdade, gerado de dados de elevação) com pontos de sensores coloridos pela umidade.

- **Nível:** 2 no hero; o mapa em relevo é nível 2 com uma textura de altura (`displacementMap` num `planeGeometry` subdividido).

---

## Eventos, música, entretenimento

**Ideia:** cena que reage ao som (partículas pulsando com a música via Web Audio `AnalyserNode`) ou ingresso 3D que vira (CSS 3D, nível 1).

- Áudio só toca depois de um clique do usuário (regra dos navegadores) — e dê botão de silenciar.
