# AGENTS.md

## Visão geral do projeto
Este repositório contém o **site público** e o **sistema interno de gestão** da **MFV Advocacia (*Melo Fernandes & Vasconcelos - Advogados Associados*)**, sediada em **Sousa – PB** (`CNPJ 22.233.391/0001-27`). A estrutura segue a árvore do **SistemaEXTREMETEAM** (camadas modulares, layout base compartilhado, componentes reutilizáveis e separação por domínio).

**Regra de integridade:** só entra no site público o que tem fonte (site oficial do escritório ou registro público). A origem de cada dado está em `conteudo.md`. Sem depoimentos, resultados de causas, preços ou comparações: o Provimento 205/2021 da OAB limita esse tipo de publicidade.

## Documentos da atividade (*Do briefing ao site multipágina*)
- `briefing.md`, `mapa-site.md`, `conteudo.md`: negócio, páginas e textos do site público.
- `design-system.md`: fonte de verdade visual. As seções "Extensão de 06/11/2026" (palco escuro, ouro do logotipo, linguagem Apple Design, movimento 3D) e "Extensão de 10/11/2026" (trilho cinematográfico no padrão Framerate, sem vídeo; índice editorial de áreas) foram acrescentadas a pedido do autor; o conteúdo original ficou intacto. Os tokens saem dele (`static/css/tokens.css`).
- `auditoria.md`: auditoria, ciclos de refinamento e pendências.
- `docs/sistema-interno/`: briefing e mapa do sistema de gestão (versões anteriores de `briefing.md` e `mapa-site.md`).

## Código
- `app.py`: ponto de entrada WSGI do Gunicorn (`from servidor import app`).
- `servidor.py`: monta a aplicação Flask (blueprints, rotas `/api/*`, comandos CLI e filtros Jinja).
- `config.py`: configuração global (`DATABASE_URL`, SQLite `prisma/dev.db`, sessões). Dados institucionais em `backend/config.py`.
- `comandos.py`: comandos CLI (`flask --app servidor popular-institucional`).
- `modelos/`, `dao/`: entidades SQLAlchemy e persistência.
- `servicos/`: autenticação, autorização, formatação, minutas, relatórios e **`conteudo_publico.py`** (navegação e textos verificados do site público).
- `blueprints/`: rotas por domínio. `publico_bp.py` serve `/`, `/areas-de-atuacao`, `/escritorio`, `/contato`, `/termos` e `/privacidade`.
- `backend/`: API REST Python (Flask + SQLAlchemy + Pydantic) e testes (`backend/tests/test_api.py`, `backend/tests/test_site_publico.py`).

## Templates (`templates/`)
- `layouts/`: `base.html` (carrega os CSS e `ativar-js.js`), `publico.html`, `admin.html`.
- `components/`: `cabecalho_publico.html`, `rodape_publico.html`, `abertura.html` (tela de abertura da Home), `admin_nav.html`, `mensagens.html`, `toasts.html`, `confirm_modal.html`.
- `publico/`: `inicio.html`, `areas.html`, `escritorio.html`, `contato.html`.
- Raiz: `login.html` e `recuperar.html` (herdam de `auth/`), `termos_de_servico.html`, `politica_privacidade.html`, `erro.html`.
- Sistema interno: `admin/`, `clientes/`, `processos/`, `agenda/`, `documentos/`, `relatorios/`, `chat/`, `auth/`.

## Estáticos (`static/`)
- `css/`: `tokens.css` (única fonte de cor, fonte, espaço e raio, inclusive os canais `--x-rgb` para transparências), `base.css`, `componentes.css` (botões, formulários, avisos, painel interno), `publico.css` (site público: trilho da Home, manchetes, medidor, abertura, índice de áreas). **Não escreva cor ou fonte fora de `tokens.css`**; transparências são `rgba(var(--x-rgb), alfa)`.
- `js/`: `ativar-js.js` (marca `js`, `anima` e `abertura-pendente` no `<html>`), `site.js` (menu móvel, abertura, trilho cinematográfico da Home com manchetes, `inert` e medidor, parallax do palco, partículas, inclinação de cartões, frase que acende, contadores, formulário de contato; só escreve variáveis CSS e troca classes, e respeita movimento reduzido), `componentes.js` (toasts, formulários `data-api`, confirmação `data-confirmar`). Sem script inline nem atributo `style` (há teste para isso).
- `img/`, `fonts/`: mídia otimizada do site e fontes Cormorant Garamond e Inter (licença OFL, junto das fontes).

## Skills do projeto
`.agents/skills/` traz as skills (Apple Design, frontend-design, frontend-react-motion, framerate-scroll-video-site...). `.claude/skills/apple-design` é um link para `.agents/skills/apple-design`, para o Claude Code carregar a skill neste projeto. O visual do site público segue `apple-design/SKILL.md` sobre o `design-system.md`.

## Next.js (`app/`, `components/`, `lib/`, `prisma/`)
Interface alternativa em Next.js 14 ligada ao backend Python (`lib/python-backend.ts`). **Não faz parte do site redesenhado** e ainda traz dados anteriores à correção feita em `conteudo.md`. Decisão pendente: manter ou remover (veja `auditoria.md`, seção 5).

## Testes
- `python3 -m unittest discover -s backend/tests -v`
- `npx jest --watchAll=false` (`tests/firm-data.test.ts`)

## Como rodar o site
`python3 -m flask --app servidor run` (use `PYTHON_DATABASE_URL=sqlite:///caminho/teste.db` para não tocar em `prisma/dev.db`).
