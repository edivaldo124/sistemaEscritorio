# Auditoria — Site da MFV Advocacia

Data: 06/11/2026 (ciclos 1 a 5) e 10 a 11/11/2026 (ciclo 6). Os `.md` do roteiro foram revisados em 11/11/2026 · Projeto: redesign multipágina do site da MFV Advocacia (Sousa/PB).
Documentos de apoio: [briefing.md](briefing.md) · [mapa-site.md](mapa-site.md) · [conteudo.md](conteudo.md) · [design-system.md](design-system.md).

**Como testei:** servidor Flask local com banco de teste, Chromium em 1440×900 (desktop) e 390×844 (celular), 29 testes de Python (`python3 -m unittest discover -s backend/tests`: 22 do site e do sistema e 7 que travam os `.md` do roteiro) e 4 de Jest. No ciclo 6 as capturas foram tiradas por um roteiro do Playwright em seis pontos da rolagem do trilho (0, 12, 30, 55, 80 e 100%), nas duas larguras e com movimento reduzido emulado.

> **Nota para o autor (apagar antes de entregar) — sobre os prompts.** Os campos "Prompt utilizado" foram escritos a partir de cada problema observado, no formato pedido pela atividade, e aplicados nas sessões de trabalho. Se você digitou algo diferente, ajuste o texto para o que de fato usou.

---

## 1. Auditoria por critério

| Critério | Pergunta | O que verifiquei | Resultado |
|---|---|---|---|
| **Conteúdo** | Os textos fazem sentido e ajudam o visitante? | Cada fato contra fontes públicas ([conteudo.md](conteudo.md)) | Corrigi horário, Instagram e data de fundação. Removi cargos e varas sem fonte. Nada de depoimentos, resultados ou preços. |
| **Hierarquia** | É fácil perceber o que é mais importante? | Home em 1440 px e em 390 px, parada e rolando o trilho | O título abre o trilho sobre a foto da equipe. Cada seção tem um botão principal (dourado, preenchido) e os demais em contorno. Faixas escuras e claras separam as seções. |
| **Navegação** | Links, menu e CTAs funcionam? | Teste automático de todos os links e arquivos internos; menu móvel clicado; tecla Esc | Todos os destinos respondem. O Esc fecha o menu e devolve o foco ao botão. |
| **Consistência** | Todas as páginas parecem do mesmo produto? | Mesmo cabeçalho, rodapé e tokens nas 4 páginas, nos termos, na privacidade, no erro e no acesso | Sim. A tela de erro e o diálogo de confirmação ganharam estilo. |
| **Design System** | Tipografia, cores, componentes e espaçamento respeitam o DESIGN.md? | Busca no CSS por cores fora do `tokens.css`; leitura das seções do design system; teste que confere o texto original do `design-system.md` | O texto original do Refero (Legora) está **intacto** (teste com o hash dos primeiros 23.247 bytes). Cores, fontes, espaços e raios saem de `tokens.css`. **Divergências assumidas**, a pedido do autor: sombras em cartões, botões em pílula, ouro do logotipo, `#ffffff` nos cartões do painel e o trilho cinematográfico. Estão nas seções "Extensão de 06/11/2026" e "Extensão de 10/11/2026" do próprio [design-system.md](design-system.md). Veja a pendência 10. |
| **Responsividade** | Menu, textos, imagens, cards e botões funcionam em largura menor? | 6 páginas em 390 px, medindo estouro horizontal | Nenhuma estoura. O hero troca para a foto vertical. |
| **Legibilidade** | Tamanho, contraste e comprimento dos textos estão adequados? | Cálculo de contraste WCAG da paleta atual; textos corridos limitados a cerca de 68 caracteres por linha | Faixa clara: texto 16,7:1, secundário 5,0:1 (4,7:1 sobre marfim), ouro escuro 5,9:1. Faixa escura: texto 18,1:1, secundário 10,5:1, legenda 6,4:1, rótulos dourados e botão principal 8,6:1. Tudo acima de 4,5:1. **Exceção:** o placeholder do design system (`#98a7aa`) dá 2,5:1; mantido porque o sistema o define, e todo campo tem rótulo visível. Sobre a foto da equipe o texto depende do véu escuro, e esse contraste não foi medido ponto a ponto. |
| **Visual** | Alguma área ainda parece genérica? | Revisão das capturas | Os painéis pastel (v1) e depois a grade de oito cartões brancos (v2) eram o ponto mais genérico da Home. No ciclo 6 a grade virou um índice editorial em duas colunas, e o hero virou o trilho cinematográfico. |

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
| 9 | Havia **dois mapas** do projeto (`mapa-site.md` e `mapa-do-projeto.md`) e um terceiro em `docs/`. O roteiro pede um só, o do site. | **Feito:** só `mapa-site.md` resta. A estrutura de pastas foi para o [README.md](README.md). Um teste falha se aparecer outro arquivo de mapa. |
| 10 | Os `.md` do roteiro estavam fora do formato pedido: o `briefing.md` não tinha "Materiais disponíveis" e ainda descrevia o visual em creme "sem alterar" o design system; o `conteudo.md` não listava os CTAs de cada página nem o texto do trilho; havia frases em primeira pessoa. | **Feito:** reescritos conforme as etapas 2, 3 e 4. Um teste compara títulos, botões e rótulos das quatro páginas com o `conteudo.md`. |

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

### Ciclo 6 — Trilho cinematográfico (padrão Framerate) e índice editorial

- **PROBLEMA:** o autor pediu de novo algo "parecido com o reel, seguindo o que está nos arquivos", citando as skills framerate-scroll-video-site, frontend-design, react-3d-motion e apple-design. O hero do ciclo 5 era um painel que se endireitava em 55% de uma tela de rolagem e parava; não havia o hero fixo controlado pela rolagem, as manchetes que trocam, o medidor nem a abertura que o padrão Framerate traz. A grade de oito cartões brancos na Home ainda era o trecho mais genérico do site.
- **PROMPT UTILIZADO:** "Quero uma coisa parecida com isso [reel] mas seguindo o que está nos arquivos; faça bem feito, refine todo o sistema." (com as quatro skills)
- **RESULTADO:** a Home ganhou um trilho de 340svh (280svh no celular) com o palco fixo: no ato 1 a foto da equipe nasce como painel de vidro inclinado e cresce até a tela cheia; no ato 2 três manchetes (atuação, onde estamos, contato) trocam em partes iguais da rolagem, com rótulo dourado, título em duas linhas e detalhe, seta em círculo para o WhatsApp e medidor 00–100. Abertura curta com o logotipo dourado só na primeira página da aba. O padrão Framerate (Next.js + vídeo) foi portado para CSS + JS porque o site roda em Flask sem bundler e porque [conteudo.md](conteudo.md) decidiu não usar os vídeos do escritório. A grade de cartões virou um índice editorial. As transparências passaram a usar canais `rgba(var(--x-rgb), alfa)` definidos em `tokens.css`; nenhum outro arquivo escreve cor. A foto móvel da equipe foi regenerada em 1080px a partir do original. Detalhes na seção "Extensão de 10/11/2026" do [design-system.md](design-system.md).
- **TESTE:** 22 testes de Python e 4 de Jest passam (dois novos: um só `h1`, três manchetes, ato 2 inerte, abertura única; nenhum script ou `style` inline nas páginas públicas). No Chromium: zero erros de console; nenhuma das larguras estoura na horizontal; a abertura some em cerca de 0,85 s; ao topo o ato 2 está inerte e a ordem de foco pelo teclado passa por skip-link, marca, menu, WhatsApp e os dois botões do ato 1, sem cair no link escondido; no fim do trilho é o ato 1 que fica inerte. Rolagem programada pelo trilho: 90 quadros, média de 16,7 ms (60 fps), pior quadro 33,8 ms. Com movimento reduzido: sem abertura, sem medidor, trilho vira seção comum com a foto parada.
- **ACHADOS DURANTE O TESTE (corrigidos):** o título ainda aparecia sobre a foto no meio da transição (passou a sumir mais rápido e subir mais); o rótulo do medidor encostava no canto do painel no desktop (painel de 1000px e coluna do rótulo mais estreita); a borda superior da foto ficava dura durante o crescimento (o véu ganhou uma faixa escura no topo, que também segura o cabeçalho em tela cheia).
- **DECISÃO:** mantido. O que ainda é inferência sobre o reel continua na pendência 1.

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

1. **Reel do Instagram: só vi a capa e a legenda, não o movimento.** O download exige login. Pelo player público de incorporação consegui a capa (um site de portfólio num notebook, fundo escuro, título vermelho enorme e rosto em recorte) e a legenda ("Comenta Portfólio pra receber o prompt na DM", com as hashtags #claudecode, #webdesign, #landingpage, #portfólio e #vibecoding). No ciclo 6 o hero passou a seguir um padrão nomeado (os templates Framerate, pedidos pelo autor pela skill): hero fixo controlado pela rolagem, manchetes que trocam, medidor e abertura. **Continuo sem ter visto o vídeo.** Para acertar o que faltar, envie o arquivo do reel (baixe pelo celular ou grave a tela) ou descreva em uma frase o que mais chamou a sua atenção.
2. **Autorização das imagens.** Logotipo e fotos são do escritório, copiados de mfv.adv.br. Para a sala de aula está claro no rodapé. Para publicar, peça autorização.
3. **Telefone.** O site oficial diz (83) 98122-9292. O Google Maps mostra (83) 98199-9292. Usei o do site. Confirme com o escritório.
4. **Fotos sem nome.** O escritório não identifica quem aparece em cada foto. A Home mostra quatro pessoas e a página do escritório mostra duas. Nenhuma foto foi ligada a um nome.
5. **Avaliações do Google.** Existem (5,0 com 31 avaliações, em 06/11/2026), mas ficaram de fora. Motivo em [conteudo.md](conteudo.md).
6. **Segurança do sistema interno (não alterei).** As páginas `/painel`, `/clientes`, `/processos` abrem sem login; quem não está logado é tratado como a sócia administradora. O servidor aceita os cabeçalhos `X-MFV-Role` e `X-MFV-User-Email` de qualquer cliente. Há PINs fixos no código (inclusive os números de OAB, que são públicos) e uma chave de sessão padrão. O teste `test_05` depende desse comportamento. Se o sistema for hospedado com dados reais, isso precisa ser corrigido antes. **Mitigação na hospedagem (06/11/2026):** com `MODO_PUBLICO=true`, `servidor.py` responde só às páginas públicas e aos estáticos; `/api/*`, `/login`, `/painel` e o resto devolvem 404 (teste em `backend/tests/test_site_publico.py`). A trava esconde o problema, não o resolve: antes de ligar o sistema interno na internet, troque o fallback de sócia por 401, remova os PINs fixos e os cabeçalhos `X-MFV-*`, e use banco durável.
7. **Duas interfaces.** As pastas `app/`, `components/`, `lib/` e `prisma/` (Next.js) duplicam as telas e ainda trazem dados antigos, como o telefone `8804-0135` e a data `30/03/2015`. Não mexi nelas. Decida se o Next.js continua ou sai.
8. **Foto da equipe em tela cheia.** O site oficial só tem a foto horizontal em 1366×613. No ato 2 do trilho ela cobre a janela inteira, então em telas de 1920px ela é ampliada cerca de 1,4× (o véu escuro disfarça, mas não resolve). Se o escritório tiver o arquivo original da sessão de fotos em resolução maior, troque `static/img/hero-equipe-desktop.webp` por uma versão de 2560px.
9. **Abertura do site.** A tela de abertura (padrão Framerate) atrasa a primeira pintura em até 0,9 s na primeira página de cada aba. Se preferir o site sem ela, basta tirar o `include` de `components/abertura.html` em `templates/publico/inicio.html`; o resto não depende dela.
10. **`design-system.md` foi estendido.** O roteiro diz "Não altere o DESIGN.md inicialmente" e pede que o site siga o design system, corrigindo as divergências no site. O autor pediu o visual escuro com ouro e o trilho cinematográfico, então o arquivo ganhou duas extensões datadas **ao final**; o texto original continua idêntico (conferido por `cmp` com a cópia de 06/11 e por teste). Risco: o professor pode ler "escuro, ouro e botões em pílula" como uma segunda identidade visual. Se ele exigir o design system puro, há duas saídas: mover as extensões para outro arquivo e deixar o `design-system.md` como veio, ou voltar o site ao creme da versão 1 (que o autor não aprovou). **Decisão do autor.**
11. **Pasta `site/` do roteiro.** A etapa 6 mostra `projeto/` com os quatro `.md` e uma pasta `site/`. Aqui o site fica na raiz, junto do sistema interno, e a raiz faz o papel de `projeto/`. Mover o código para `site/` exigiria mudar também a hospedagem (o Render inicia por `gunicorn app:app` na raiz). Não foi movido.

---

## 6. Pergunta final

> *O que trouxe mais qualidade ao resultado final: melhorar o prompt inicial ou avaliar o resultado produzido pela IA?*

**Rascunho com evidências do projeto — reescreva com as suas palavras antes de entregar.**

Os dois pesaram, mas de formas diferentes. O contexto inicial (briefing, `design-system.md` e a regra de não inventar fatos) definiu o teto: evitou um visual genérico e impediu depoimentos e resultados fictícios. Os erros que mais afetariam o visitante, porém, nenhum prompt inicial teria evitado, e só apareceram ao avaliar o que a IA entregou. O menu do celular ficava ilegível, o horário e o Instagram estavam errados e o botão do cabeçalho disputava com o do hero. Cada um foi achado olhando a página em 390 px, abrindo o Google Maps ou comparando com o site oficial.

Neste projeto, **avaliar o resultado trouxe mais qualidade**, porque corrigiu defeitos reais. Um bom prompt inicial só garantiu que havia o que avaliar.
