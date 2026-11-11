# Conteúdo do site — MFV Advocacia

> **Papel deste arquivo** (roteiro, etapa 6): responde **O QUE será comunicado**.
> Traz o texto de cada página e seção, **os CTAs** (botões e links de ação) e a origem de cada fato, na ordem das seções de [mapa-site.md](mapa-site.md).
> Regras da atividade: nada de Lorem Ipsum e **nenhum fato inventado**. Fatos conferidos em 06/11/2026; textos da Home atualizados em 11/11/2026 para refletir o trilho cinematográfico.
> Há um teste (`backend/tests/test_roteiro_md.py`) que compara títulos, botões e rótulos das quatro páginas com este arquivo.

## Fontes

| Sigla | Fonte |
|---|---|
| **SO** | Site oficial do escritório: <https://mfv.adv.br/> (páginas, imagens e vídeos) |
| **CNPJ** | Cadastro público de CNPJ 22.233.391/0001-27 (Casa dos Dados, Econodata) |
| **OAB** | Diário Eletrônico da OAB (21/10/2021) e Diário da Justiça da Paraíba (25/03/2019 e 31/03/2025), que listam os números de inscrição |
| **GM** | Google Maps, ficha "Melo Fernandes e Vasconcelos Advocacia" |

## Elementos comuns a todas as páginas

| Elemento | Texto | CTA / destino | Fonte |
|---|---|---|---|
| Menu | Início · Áreas de atuação · O escritório · Contato | Cada item leva à sua página | Projeto |
| Botão do cabeçalho | WhatsApp | Abre o WhatsApp do escritório | SO |
| Botão do menu no celular | Menu / Fechar | Abre e fecha o menu | Projeto |
| Rodapé: títulos | Páginas · Contato · Mais | | Projeto |
| Rodapé: dados | Melo Fernandes & Vasconcelos - Advogados Associados · CNPJ 22.233.391/0001-27 · Rua Lafaiete Píres Ferreira, nº 35, Centro — Sousa/PB, CEP 58800-510 · +55 (83) 98122-9292 · contato@mfv.adv.br · segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00 | Telefone abre o WhatsApp; e-mail abre o programa de e-mail | SO; CNPJ |
| Rodapé: links | Instagram @mfvadvogados · Facebook · Termos de uso · Privacidade · Área restrita da equipe | Redes abrem em outra aba | SO |
| Rodapé: aviso | Projeto acadêmico de redesign, feito a partir de informações públicas. Não é o site oficial do escritório: o site oficial é mfv.adv.br. · Marca, fotos e vídeos pertencem ao escritório. Este site informa e não promete resultados, conforme o Código de Ética e Disciplina da OAB. | Link para mfv.adv.br | Projeto |

## 1. Início (`/`)

| Seção | Texto no site | Fonte |
|---|---|---|
| Abertura (tela de carregamento, só na primeira página da aba) | Melo Fernandes & Vasconcelos · Sousa, Paraíba · 2015 · Rua Lafaiete Píres Ferreira, 35 · Centro · Sousa/PB · logotipo dourado | SO; GM |
| Trilho, ato 1: título | Melo Fernandes & Vasconcelos | SO |
| Trilho, ato 1: subtítulo | Advocacia em Sousa, Paraíba, desde 2015. | SO (instalado em 2015 em Sousa) |
| Trilho, ato 1: CTAs | **Falar pelo WhatsApp** (abre o WhatsApp) · **Conhecer o escritório** (vai a O escritório) | Projeto |
| Trilho: foto | Equipe do escritório na sala de reuniões | SO (`EquipeDesktop.png`, `EquipeMobile.png`) |
| Trilho, ato 2: manchete 1 | Rótulo **Atuação** · título **Para empresas e para pessoas.** · Assessoria jurídica a empresas em diferentes estágios do negócio e atendimento a pessoas físicas, do consultivo ao contencioso. | SO (mesmas frases de "Empresas" e "Pessoas") |
| Trilho, ato 2: manchete 2 | Rótulo **Onde estamos** · título **No centro de Sousa.** · Rua Lafaiete Píres Ferreira, 35, Centro. Atendimento por telefone e presencial de segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00. | SO; GM confirma endereço e abertura |
| Trilho, ato 2: manchete 3 | Rótulo **Contato** · título **Fale com o escritório.** · WhatsApp, telefone, e-mail ou uma visita ao escritório, no horário de atendimento. | Projeto; os canais são os do SO |
| Trilho, ato 2: CTA | Seta em círculo **Falar pelo WhatsApp** | Projeto |
| Trilho: medidor | Role para conhecer o escritório (00 a 100) | Projeto |
| História em uma frase | Bárbara e Higor construíram a parceria desde o ensino médio e a levaram para a advocacia. Em 2015, escolheram Sousa como sede do escritório. · Resumo da história contada no site oficial do escritório. | SO (seção "nossa história") |
| Número 1 | **11** anos de atuação em Sousa, contados desde 2015 | Calculado (ano atual − 2015). O SO também diz 11 anos. |
| Número 2 | **32+** áreas do Direito, segundo informa o escritório | SO ("mais de 32 áreas") |
| Número 3 | **2** sócios-fundadores | SO e CNPJ |
| Índice de áreas | Título **Em que o escritório pode ajudar** · As oito áreas que o escritório destaca em seu site. Ele informa atuar em mais de 32. · as oito áreas com a definição de cada uma (tabela da página 2) | SO (oito áreas e "mais de 32"); definições do projeto |
| Índice: convite e CTA | Não encontrou a sua área? Conte o seu caso ao escritório e ele orienta o melhor caminho. · **Falar com o escritório** (vai a Contato) | Projeto |
| Onde estamos | Título **No centro de Sousa** · Rua Lafaiete Píres Ferreira, nº 35, Centro — Sousa/PB, CEP 58800-510. · Atendimento por telefone e presencial: segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00. | SO; GM |
| Onde estamos: CTAs | **Ver no mapa** (Google Maps) · **Todos os contatos** (vai a Contato) | Projeto |
| Onde estamos: foto | Fachada do escritório, com o letreiro dourado sobre mármore escuro | SO (`estrutura.png`, recortada) |
| Chamada final | **Fale com o escritório.** · CTAs **Falar pelo WhatsApp** e **Ver outros canais** (vai a Contato) | Projeto |

## 2. Áreas de atuação (`/areas-de-atuacao`)

| Seção | Texto no site | Fonte |
|---|---|---|
| Rótulo e título | Áreas de atuação · **Direito para empresas e para pessoas** | Projeto |
| Introdução | O escritório informa atuar em mais de 32 áreas do Direito. Estas são as oito que ele destaca em seu site. | SO |
| Convite final | **Não encontrou a sua área?** · A lista completa tem mais de 32 áreas. Conte o seu caso ao escritório e ele orienta o melhor caminho. | SO; projeto |
| CTA | **Entrar em contato** (vai a Contato) | Projeto |

Os **nomes** das oito áreas são os que o SO destaca. As **definições** foram escritas para este projeto como explicações neutras do que cada área abrange. Elas não descrevem resultados nem diferenciais do escritório.

| Área | Definição usada |
|---|---|
| Empresarial | Assessoria jurídica a empresas em diferentes estágios do negócio. (SO) |
| Trabalhista | Relações entre empregadores e trabalhadores: orientação, prevenção e defesa de direitos. |
| Consumidor | Conflitos nas relações de consumo, envolvendo produtos e serviços. |
| Saúde | Questões jurídicas que envolvem planos de saúde, tratamentos e serviços de saúde. |
| Administrativo | Relações com a administração pública: processos, contratos e servidores. |
| Civil | Contratos, responsabilidade civil, propriedade e demais relações entre pessoas. |
| Família e Sucessões | Questões de família, como divórcio e guarda, e de sucessões, como inventário e herança. |
| Previdenciário | Benefícios e direitos junto à Previdência Social. |

> Confirme com o escritório se quer manter essas definições. O SO afirma haver mais de 32 áreas, mas não publica a lista completa.

## 3. O escritório (`/escritorio`)

| Seção | Texto no site | Fonte |
|---|---|---|
| Rótulo e título | O escritório · **Um escritório de Sousa, desde 2015** | SO |
| Subtítulo | Há 11 anos, a MFV Advocacia atende empresas e pessoas físicas na Paraíba. | SO; cálculo |
| História | Título **A história do escritório** · O escritório foi fundado por Bárbara de Melo Fernandes e Higor Vasconcelos de Almeida, sócios desde a origem. A parceria dos dois vem do ensino médio e se consolidou na advocacia. · A sede fica em Sousa desde 2015. A principal frente é a assessoria a empresas, em diferentes estágios do negócio. Pessoas físicas também são atendidas, tanto na orientação quanto nas ações judiciais. | SO |
| História: foto | Retrato de duas pessoas da equipe diante de uma parede de mármore iluminada. Legenda: Foto da seção de história do site oficial do escritório. | SO (`DSC_9192.jpg`) |
| Sócios | Rótulo Quem fundou · título **Sócios-fundadores** · Dra. Bárbara de Melo Fernandes Vasconcelos, OAB/PB 19.571, sócia-fundadora · Dr. Higor Vasconcelos de Almeida, OAB/PB 19.503, sócio-fundador | CNPJ (administradores) e OAB (inscrições) |
| Eventos e conteúdo | Título **Eventos e conteúdo** · O escritório publica conteúdo e promove encontros. Os links abrem o site oficial. · **Palestras e workshops**: O escritório promove encontros voltados ao público empresarial. · **Blog**: Notícias publicadas pelo escritório no site oficial. · **MFV Cast**: Podcast do escritório. | SO |
| Eventos: CTA | **Abrir no site oficial** (um link para cada item, abre em outra aba) | SO |
| Fecho | **Fale com a MFV.** · O site oficial indica como parceiro o escritório MZA — Mouzalas Azevedo. | SO |
| Fecho: CTAs | **Falar com a MFV** (vai a Contato) · **Conhecer a MZA** (site da MZA, outra aba) | Projeto; SO |

## 4. Contato (`/contato`)

| Seção | Texto no site | Fonte |
|---|---|---|
| Rótulo e título | Contato · **Fale com o escritório** | Projeto |
| Introdução | Escolha o canal que preferir. O atendimento por telefone e presencial é de segunda a sexta-feira. | SO |

| Canal | Dado | CTA | Fonte |
|---|---|---|---|
| WhatsApp e telefone | +55 (83) 98122-9292 | Número abre o WhatsApp; **Ligar** chama o telefone | SO |
| E-mail | contato@mfv.adv.br (As respostas chegam em horário comercial.) | Abre o programa de e-mail | SO |
| Endereço | Rua Lafaiete Píres Ferreira, nº 35, Centro — Sousa/PB, CEP 58800-510 | **Ver no mapa** | SO; GM |
| Horário | Segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00 | | SO |
| Redes sociais | Instagram @mfvadvogados · Facebook (facebook.com/melofernandesevasconcelos) | Abrem em outra aba | SO |

| Formulário | Texto no site |
|---|---|
| Título | **Envie uma mensagem pelo WhatsApp** |
| Explicação | Preencha os campos e abra a conversa com o texto pronto. O que você digita não fica guardado neste site. |
| Campos | Seu nome · Assunto (Prefiro explicar na mensagem, ou uma das oito áreas) · Mensagem |
| CTA | **Abrir conversa no WhatsApp** |

O formulário não envia dados a este site: ele monta o texto e abre o WhatsApp com a conversa pronta.

## Páginas de apoio

- **Termos de uso** (`/termos`) e **Privacidade** (`/privacidade`) são textos escritos para este projeto. Dizem que o site é um redesign acadêmico, que não é o site oficial, que a marca e as mídias pertencem ao escritório e como o site trata dados. Não têm fonte externa.
- **Erro 404:** título "Página não encontrada" · "O endereço pode ter mudado ou ter sido digitado errado." · CTAs **Voltar ao início** e **Falar com o escritório**.
- **Área restrita** (`/login`): texto de acesso da equipe. Não faz parte do site público.

## Revisão do texto (roteiro, etapa 4)

- Sem Lorem Ipsum, sem depoimentos, sem resultados de causas, sem preços e sem comparações.
- Frases genéricas como "soluções", "excelência" e "tradição" não aparecem nas páginas públicas (busca feita nos templates públicos e em `servicos/conteudo_publico.py`).
- As definições das oito áreas são o único texto escrito do zero para o site. Estão marcadas acima como definições do projeto e aguardam confirmação do escritório.

## Verificado, mas **não publicado** (e por quê)

| Informação | Por que ficou de fora |
|---|---|
| **Avaliações do Google:** nota 5,0 com 31 avaliações (GM, 06/11/2026), e três comentários de clientes | O Provimento 205/2021 da OAB restringe depoimentos de clientes na publicidade da advocacia, conforme resumos de materiais da OAB/SC e artigos jurídicos. Os autores também não autorizaram a reprodução. Se o escritório concordar, dá para exibir só a nota com link para o Google. Confirme na OAB/PB antes. |
| Cargo de vice-presidente da OAB Subseção Sousa (Bárbara) e integração ao TED da OAB/PB (Higor) | Aparecem em notícias, mas não no SO. O código antigo trazia esses cargos sem fonte, e eles foram removidos dos dados. |
| Telefone secundário (83) 98804-0135 | Consta só em cadastro de CNPJ, no formato com 9 dígitos. O código antigo trazia uma versão com 8 dígitos, que estava errada. Não aparece no SO. |
| E-mails pessoais dos sócios | Não são publicados pelo SO. |
| Fotos individuais com nome | O escritório não diz quem é quem nas fotos. Por isso nenhuma foto está ligada a um nome. |
| Varas, tribunais e "bases legais" por área | Estavam no código antigo sem fonte do escritório. Foram removidas do site público. |
| Vídeos `MFV1.mp4` e `MFV3.mp4` do SO | Não usados: são mídia do escritório e pesam 15 MB e 2 MB. O trilho da Home usa a foto da equipe, sem vídeo. |

## Divergências entre fontes

| Dado | O que as fontes dizem | Decisão |
|---|---|---|
| Horário | SO: 07h30–12h00 e 13h30–18h00 · código antigo: 08h00–12h00 e 14h00–18h00 | SO (o GM também abre às 07h30) |
| Instagram | SO: @mfvadvogados · código antigo: @mfvadvocacia | SO |
| Data de abertura | CNPJ: 18/03/2015 · código antigo: 30/03/2015 · SO: 2015 | Só o ano, 2015 |
| Telefone | SO: 98122-9292 · GM: (83) 98199-9292 | SO. **Confirme com o escritório**, o GM pode estar desatualizado. |
| Grafia da rua | SO e GM: Lafaiete Píres Ferreira · CNPJ: Lafayette Pires Ferreira | SO |

## Mídia e direitos

Logotipo, fotos e vídeos são do escritório e foram copiados de mfv.adv.br para este projeto acadêmico. Eles estão otimizados em `static/img/`. O rodapé e os termos dizem isso. **Antes de publicar este site fora da sala de aula, peça autorização ao escritório.**
