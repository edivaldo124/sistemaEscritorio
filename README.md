# MFV Advocacia — site e sistema de gestão (Sousa – PB)

Projeto da atividade *Do briefing ao site multipágina com IA* (Desenvolvimento de Aplicações Web). Reúne:

1. **Site público** (Flask + Jinja, CSS e JavaScript sem dependências): Início, Áreas de atuação, O escritório, Artigos e Contato.
2. **Sistema interno de gestão** (clientes, processos, agenda, documentos, relatórios, mural), atrás da "Área restrita da equipe".

O negócio é o escritório real **Melo Fernandes & Vasconcelos Advocacia (MFV)**. Este **não é o site oficial**: o oficial é <https://mfv.adv.br>. Logotipo, fotos e vídeos pertencem ao escritório.

## Documentos do roteiro

| Arquivo | Papel no roteiro | Conteúdo |
|---|---|---|
| [briefing.md](briefing.md) | PARA QUEM e POR QUÊ | Negócio, público, problema, objetivo, proposta de valor, diferenciais, CTA, personalidade e materiais |
| [mapa-site.md](mapa-site.md) | O QUE será construído | **O único mapa:** páginas, seções, informação e ação esperada de cada uma |
| [conteudo.md](conteudo.md) | O QUE será comunicado | Textos e CTAs de cada página e a **fonte de cada fato** |
| [design-system.md](design-system.md) | COMO deve parecer e se comportar | Referência do Refero (texto original intacto) mais duas extensões datadas ao final |
| [auditoria.md](auditoria.md) | Etapas 9 e 10 | Auditoria, ciclos de refinamento, checklist, pendências e pergunta final |

## Conformidade com o roteiro

| Etapa | O roteiro pede | Onde está | Situação |
|---|---|---|---|
| 1 e 2 | `briefing.md` com público-alvo, problema, objetivo, proposta de valor, diferenciais, CTA, personalidade e materiais | `briefing.md` | Cumprido |
| 3 | `mapa-site.md` com pelo menos 4 páginas e 4 campos por página | `mapa-site.md` | Cumprido: 5 páginas, mais 4 de apoio |
| 4 | `conteudo.md` sem Lorem Ipsum e sem fatos inventados | `conteudo.md` | Cumprido, com a fonte de cada dado |
| 5 | `design-system.md` do Refero, "não altere inicialmente" | `design-system.md` | Texto original intacto, conferido por teste. Duas extensões ao final, a pedido do autor (veja a pendência 10 da auditoria) |
| 6 | Pasta com os quatro `.md` e uma pasta `site/` | Raiz do repositório | **Diferente:** não há pasta `site/` (veja a nota abaixo) |
| 8 | Pelo menos 4 páginas navegáveis, responsivas e com a mesma identidade | `templates/publico/` | Cumprido, com testes automáticos |
| 9 | `auditoria.md` com pelo menos 5 pontos e os 8 critérios | `auditoria.md` | Cumprido: 10 pontos |
| 10 | Pelo menos 3 ciclos: problema → prompt → resultado | `auditoria.md` | 6 ciclos |
| Final | Checklist e pergunta final | `auditoria.md`, seções 4 e 6 | Checklist feito. **A resposta à pergunta final é um rascunho: reescreva com as suas palavras** |

## Estrutura de pastas

```text
sistemaEscritorio/                  # faz o papel da pasta "projeto/" do roteiro
├── briefing.md · mapa-site.md · conteudo.md · design-system.md · auditoria.md
├── README.md · AGENTS.md
├── docs/sistema-interno/           # briefing do sistema de gestão (versão anterior)
│
├── app.py · servidor.py · config.py · comandos.py   # entrada WSGI, fábrica Flask, config, CLI
├── blueprints/ · servicos/ · modelos/ · dao/        # rotas, regras, entidades e persistência
├── backend/                        # API REST Python e testes
├── templates/                      # layouts, components, publico, e as telas do sistema interno
├── static/                         # css, js, img e fonts
│
└── app/ · components/ · lib/ · prisma/ · tests/     # interface alternativa em Next.js e testes Jest
```

**Sobre a pasta `site/`:** o roteiro mostra o site em uma pasta `site/` ao lado dos quatro `.md`. Aqui o site fica na raiz, junto do sistema interno. Mover o código para `site/` exigiria mudar também a hospedagem, que inicia por `gunicorn app:app` na raiz. O detalhe de cada pasta está em [AGENTS.md](AGENTS.md).

## Dados do escritório (conferidos em 06/11/2026)

Fontes: site oficial, cadastro público de CNPJ, Diário Eletrônico da OAB e Diário da Justiça da Paraíba. Detalhes e divergências em [conteudo.md](conteudo.md).

- **Razão social:** Melo Fernandes & Vasconcelos - Advogados Associados · **CNPJ** 22.233.391/0001-27
- **Sócios-fundadores:** Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571) e Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503)
- **Endereço:** Rua Lafaiete Píres Ferreira, 35, Centro, Sousa/PB, CEP 58800-510
- **Contato:** WhatsApp e telefone (83) 98122-9292 · contato@mfv.adv.br · Instagram @mfvadvogados
- **Atendimento:** segunda a sexta-feira, 07h30–12h00 e 13h30–18h00

## Como executar

```bash
pip install -r requirements.txt

# Site e sistema (http://127.0.0.1:5000). Para não tocar em prisma/dev.db, use um banco de teste:
PYTHON_DATABASE_URL=sqlite:////tmp/mfv-teste.db python3 -m flask --app servidor run

# Só o site público (como na hospedagem): o sistema interno responde 404
MODO_PUBLICO=true PYTHON_DATABASE_URL=sqlite:////tmp/mfv-teste.db python3 -m flask --app servidor run

# Testes
python3 -m unittest discover -s backend/tests -v
npx jest --watchAll=false
```

## Observações importantes

- A **área interna abre sem login** (quem não está autenticado é tratado como sócia administradora). Não hospede com dados reais sem corrigir; na hospedagem use `MODO_PUBLICO=true`. Veja a seção 5 de [auditoria.md](auditoria.md).
- As pastas `app/`, `components/`, `lib/` e `prisma/` são uma interface alternativa em Next.js, **não redesenhada** e com dados anteriores à correção.
- O site não usa cookies de rastreamento, análise de audiência nem fontes de terceiros.
