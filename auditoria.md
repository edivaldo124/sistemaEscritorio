# Auditoria — Site da MFV Advocacia

Data: 06/11/2026 · Projeto: redesign multipágina do site da MFV Advocacia (Sousa/PB).
Documentos de apoio: [briefing.md](briefing.md) · [mapa-site.md](mapa-site.md) · [conteudo.md](conteudo.md) · [design-system.md](design-system.md).

**Como testei:** servidor Flask local com banco de teste, Chromium em 1440×900 (desktop) e 390×844 (celular), 14 testes de Python (`python3 -m unittest backend.tests.test_api backend.tests.test_site_publico`) e 4 de Jest.

> **Sobre os prompts.** Os campos "Prompt utilizado" foram escritos a partir de cada problema observado, no formato pedido pela atividade, e aplicados nesta sessão. Se você digitou algo diferente, ajuste o texto para o que de fato usou.

---

## 1. Auditoria por critério

| Critério | Pergunta | O que verifiquei | Resultado |
|---|---|---|---|
| **Conteúdo** | Os textos fazem sentido e ajudam o visitante? | Cada fato contra fontes públicas ([conteudo.md](conteudo.md)) | Corrigi horário, Instagram e data de fundação. Removi cargos e varas sem fonte. Nada de depoimentos, resultados ou preços. |
| **Hierarquia** | É fácil perceber o que é mais importante? | Home em 1440 px | Título de 88 px sobre a foto, um botão preenchido por tela e filetes de 1 px separando as seções. |
| **Navegação** | Links, menu e CTAs funcionam? | Teste automático de todos os links e arquivos internos; menu móvel clicado; tecla Esc | Todos os destinos respondem. O Esc fecha o menu e devolve o foco ao botão. |
| **Consistência** | Todas as páginas parecem do mesmo produto? | Mesmo cabeçalho, rodapé e tokens nas 4 páginas, nos termos, na privacidade, no erro e no acesso | Sim. A tela de erro e o diálogo de confirmação ganharam estilo. |
| **Design System** | Tipografia, cores, componentes e espaçamento respeitam o DESIGN.md? | Busca no CSS por cores fora do `tokens.css`; leitura das seções do design system | Nenhum hex de cor visível fora de `tokens.css` (a máscara do monograma usa `#000` só como canal alfa). **Divergências assumidas** (ciclo 5): sombras em cartões, botões em pílula, ouro do logotipo e `#ffffff` nos cartões do painel. Estão listadas na seção "Extensão de 06/11/2026" do próprio [design-system.md](design-system.md). |
| **Responsividade** | Menu, textos, imagens, cards e botões funcionam em largura menor? | 6 páginas em 390 px, medindo estouro horizontal | Nenhuma estoura. O hero troca para a foto vertical. |
| **Legibilidade** | Tamanho, contraste e comprimento dos textos estão adequados? | Cálculo de contraste WCAG; linhas limitadas a cerca de 68 caracteres | Corpo 19,6:1, secundário 9,6:1, legenda 5,3:1. **Exceção:** o placeholder do design system (#98a7aa) dá 2,5:1. Mantive porque o sistema o define, e todo campo tem rótulo visível. |
| **Visual** | Alguma área ainda parece genérica? | Revisão das capturas | Os painéis pastel "Empresas" e "Pessoas" são mais genéricos: sem imagem própria, só texto. Reduzi a altura, mas continuam o ponto mais fraco. |

---

## 2. Pontos de melhoria encontrados

| # | Melhoria | Situação |
|---|---|---|
| 1 | O site era uma única página com âncoras (`#socios`, `#areas`, `#comarcas`). A atividade pede páginas navegáveis distintas. | **Feito:** 4 páginas, mais termos e privacidade. |
| 2 | O cabeçalho levava ao "Painel da Banca" (área interna) como se fosse parte do site público. | **Feito:** o painel saiu do menu público e ficou no rodapé como "Área restrita da equipe". |
| 3 | Dados sem fonte ou errados: horário (08h–12h/14h–18h), Instagram (@mfvadvocacia), cargos na OAB, varas e bases legais. | **Feito:** corrigidos ou retirados. |
| 4 | A tela de login vinha com e-mail e a inscrição OAB já preenchidos no campo. | **Feito:** campos vazios, senha oculta. |
| 5 | 34 classes usadas nos templates não tinham regra no CSS (toasts, diálogo, erro, alertas, rodapé do painel). | **Feito.** |
| 6 | `app.js` e `modal.js` não eram carregados por nenhum template, e o modal procurava ids que não existiam. Formulários com `data-api` não usavam a API. | **Feito:** unificados em `componentes.js`. Testei o cadastro de cliente de ponta a ponta. |
| 7 | Fontes do sistema (Georgia, system-ui) no lugar das indicadas pelo design system. | **Feito:** Cormorant Garamond (substituta da Rhymes Display) e Inter, hospedadas no próprio site. |
| 8 | Painel interno e Next.js: duas interfaces para o mesmo sistema. | **Pendente:** veja a seção 5. |

---

## 3. Ciclos de refinamento dirigido

Formato: **OBSERVAR → IDENTIFICAR → EXPLICAR → CORRIGIR → TESTAR → DECIDIR**.

### Ciclo 1 — Design System

- **PROBLEMA:** a Home usava Georgia e system-ui. Os rótulos eram em monoespaçada verde (cor fora da paleta). Os botões tinham raio 0 e todas as caixas, bordas pretas de 1 px. O design system original pede serifa leve 300, Inter 450, botão de 2 px, cartão de 8 px e nenhuma cor cromática. *(Estas medidas são da versão 1; o ciclo 5 as substituiu.)*
- **PROMPT UTILIZADO:** "Compare a página Home com design-system.md. Identifique divergências de tipografia, espaçamento, botões e hierarquia visual. Corrija somente essas divergências, preservando conteúdo e estrutura."
- **RESULTADO:** `static/css/tokens.css` virou a única fonte de cor, fonte, espaço e raio. Busca no CSS: nenhum hex de cor visível fora dele (valores `rgba()` de sombras e brilhos ainda estão nos arquivos de componentes).
- **DECISÃO:** mantido. Registro: o lavado verdigris só aparece em botões sobre fundo escuro e em cartões, como o design system prevê.

### Ciclo 2 — Celular

- **PROBLEMA:** a 390 px o menu abria transparente sobre a foto escura, com links pretos ilegíveis. Descoberto ao clicar no botão "Menu" e olhar a captura. *(No visual atual o menu é escuro; o teste de clique e de Esc foi repetido.)*
- **PROMPT UTILIZADO:** "Analise o site em largura de celular (390 px). Procure problemas de navegação, quebra de texto, espaçamento e tamanho dos elementos. Corrija-os preservando o Design System."
- **RESULTADO:** o menu ganhou fundo próprio. Medi estouro horizontal em 6 páginas: nenhum. O Esc fecha o menu e o foco volta ao botão.
- **DECISÃO:** mantido.

### Ciclo 3 — Fatos

- **PROBLEMA:** horário, Instagram, data de fundação e telefone secundário estavam errados ou sem fonte. A ficha da Bárbara e do Higor trazia cargos na OAB que não constam no site oficial.
- **PROMPT UTILIZADO:** "Confira cada informação factual do site contra fontes públicas. Remova ou marque o que não tiver fonte. Não invente substitutos."
- **RESULTADO:** tabela de fontes e de divergências em [conteudo.md](conteudo.md). Teste automático garante que os valores errados não voltam a aparecer em nenhuma página pública.
- **DECISÃO:** mantido. Duas dúvidas continuam abertas: o telefone (Google Maps diz 98199-9292) e a possibilidade de publicar a nota do Google.

### Ciclo 4 — Hierarquia e movimento

- **PROBLEMA:** o botão do cabeçalho e o do hero disputavam atenção (o design system diz um botão preenchido por tela). O contador animava "0 → 2" em "sócios-fundadores", sem sentido. Os painéis pastel tinham muito espaço vazio.
- **PROMPT UTILIZADO:** "Revise a Home: deixe um único botão preenchido por tela, remova animação que não ajuda a entender o conteúdo e reduza espaço vazio."
- **RESULTADO:** cabeçalho em contorno, contador só nos dois números que são cálculo, painéis de 17 rem em vez de 24 rem.
- **DECISÃO:** mantido.

### Ciclo 5 — Linguagem Apple Design e profundidade 3D

- **PROBLEMA:** o autor não gostou da versão em creme: ficou plana, sem os efeitos 3D do reel que ele indicou, e a skill Apple Design do projeto não tinha sido usada. Além disso, o menu, os cartões e a Home não tinham hierarquia de superfícies.
- **PROMPT UTILIZADO:** "Use a skill Apple Design do projeto para reajustar todas as telas. Deixe parecido com o reel do Instagram e com efeitos 3D, mas de acordo com o design system, que pode ser alterado."
- **RESULTADO:** faixas escuras e claras alternadas, menu translúcido, cartões de 20 px, botões em pílula, ouro tirado do logotipo e um palco 3D na Home (monograma ao fundo, título à frente, painel de vidro com a foto da equipe que se endireita ao rolar, partículas, frase que acende palavra a palavra, cartões que inclinam). As páginas internas ganharam o mesmo palco sem a foto. O painel interno e o login herdam os tokens. O `design-system.md` ganhou a seção "Extensão de 06/11/2026".
- **TESTE:** Chromium limpo em 1920 px: 61 quadros por segundo parado, 60 depois de rolar e 60 com o mouse varrendo a cena. Em 390 px nenhuma das 7 páginas estoura. Com "reduzir movimento": sem classe `anima`, 0 partículas, painel sem inclinação, contador já no valor final.
- **ACHADOS DURANTE O TESTE (corrigidos):** retângulos soltos sob o painel (base do monograma, agora esmaecida); rótulo sobreposto ao título nas páginas internas (avanço em Z removido); botões encostados na borda no celular (a cena da Home não tinha margem); selo "MFV" do painel apertado.
- **DECISÃO:** mantido. Ressalva: o "parecido com o reel" é uma **inferência**, veja a pendência 1.

---

## 4. Checklist antes de terminar

- [x] Tenho pelo menos quatro páginas distintas. *(Início, Áreas, Escritório, Contato; teste confere os títulos.)*
- [x] Todas estão ligadas pela navegação. *(Teste automático de links.)*
- [x] O conteúdo corresponde ao briefing.
- [x] O Design System foi aplicado com consistência. *(Com a extensão documentada no próprio design-system.md.)*
- [x] Testei o site em largura menor. *(390 px.)*
- [x] Fiz pelo menos três ciclos de refinamento.
- [x] Não deixei informações factuais inventadas. *(Ressalvas na seção 5: telefone e definições das áreas.)*
- [ ] **Eu apresentaria esta versão ao negócio escolhido.** *Decisão sua. Antes, resolva a autorização das fotos e o telefone (seção 5).*

---

## 5. Pendências e riscos

1. **Reel do Instagram: só vi a capa e a legenda, não o movimento.** O download exige login. Pelo player público de incorporação consegui a capa (um site de portfólio num notebook, fundo escuro, título vermelho enorme e rosto em recorte) e a legenda ("Comenta Portfólio pra receber o prompt na DM", com as hashtags #claudecode e #webdesign). Os efeitos que implementei (painel que se endireita ao rolar, camadas em profundidade, parallax com o mouse, palavras que acendem, cartões que inclinam) são os que esse tipo de portfólio costuma ter. **Não os vi no vídeo.** Para acertar, envie o arquivo do reel (baixe pelo celular ou grave a tela) ou descreva em uma frase o que mais chamou a sua atenção.
2. **Autorização das imagens.** Logotipo e fotos são do escritório, copiados de mfv.adv.br. Para a sala de aula está claro no rodapé. Para publicar, peça autorização.
3. **Telefone.** O site oficial diz (83) 98122-9292. O Google Maps mostra (83) 98199-9292. Usei o do site. Confirme com o escritório.
4. **Fotos sem nome.** O escritório não identifica quem aparece em cada foto. A Home mostra quatro pessoas e a página do escritório mostra duas. Nenhuma foto foi ligada a um nome.
5. **Avaliações do Google.** Existem (5,0 com 31 avaliações, em 06/11/2026), mas ficaram de fora. Motivo em [conteudo.md](conteudo.md).
6. **Segurança do sistema interno (não alterei).** As páginas `/painel`, `/clientes`, `/processos` abrem sem login; quem não está logado é tratado como a sócia administradora. O servidor aceita os cabeçalhos `X-MFV-Role` e `X-MFV-User-Email` de qualquer cliente. Há PINs fixos no código (inclusive os números de OAB, que são públicos) e uma chave de sessão padrão. O teste `test_05` depende desse comportamento. Se o sistema for hospedado com dados reais, isso precisa ser corrigido antes. **Mitigação na hospedagem (06/11/2026):** com `MODO_PUBLICO=true`, `servidor.py` responde só às páginas públicas e aos estáticos; `/api/*`, `/login`, `/painel` e o resto devolvem 404 (teste em `backend/tests/test_site_publico.py`). A trava esconde o problema, não o resolve: antes de ligar o sistema interno na internet, troque o fallback de sócia por 401, remova os PINs fixos e os cabeçalhos `X-MFV-*`, e use banco durável.
7. **Duas interfaces.** As pastas `app/`, `components/`, `lib/` e `prisma/` (Next.js) duplicam as telas e ainda trazem dados antigos, como o telefone `8804-0135` e a data `30/03/2015`. Não mexi nelas. Decida se o Next.js continua ou sai.

---

## 6. Pergunta final

> *O que trouxe mais qualidade ao resultado final: melhorar o prompt inicial ou avaliar o resultado produzido pela IA?*

**Rascunho com evidências do projeto — reescreva com as suas palavras antes de entregar.**

Os dois pesaram, mas de formas diferentes. O contexto inicial (briefing, `design-system.md` e a regra de não inventar fatos) definiu o teto: evitou um visual genérico e impediu depoimentos e resultados fictícios. Os erros que mais afetariam o visitante, porém, nenhum prompt inicial teria evitado, e só apareceram ao avaliar o que a IA entregou. O menu do celular ficava ilegível, o horário e o Instagram estavam errados e o botão do cabeçalho disputava com o do hero. Cada um foi achado olhando a página em 390 px, abrindo o Google Maps ou comparando com o site oficial.

Neste projeto, **avaliar o resultado trouxe mais qualidade**, porque corrigiu defeitos reais. Um bom prompt inicial só garantiu que havia o que avaliar.
