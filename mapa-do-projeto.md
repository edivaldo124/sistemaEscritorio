# Mapa do projeto — MFV Advocacia (Sousa – PB)

Site público e sistema interno da **MFV Advocacia** (*Melo Fernandes & Vasconcelos - Advogados Associados*), `CNPJ 22.233.391/0001-27`.
Para as páginas do site, veja [mapa-site.md](mapa-site.md). Este arquivo descreve as pastas.

```text
sistemaEscritorio/
├── briefing.md · mapa-site.md · conteudo.md      # atividade: negócio, páginas, textos e fontes
├── design-system.md                              # fonte de verdade visual (não alterar)
├── auditoria.md                                  # auditoria, ciclos de refinamento, pendências
├── docs/sistema-interno/                         # briefing e mapa do sistema de gestão (versões anteriores)
│
├── app.py · servidor.py · config.py · comandos.py  # entrada WSGI, fábrica Flask, config, CLI
├── blueprints/
│   ├── publico_bp.py        # /, /areas-de-atuacao, /escritorio, /contato, /termos, /privacidade
│   └── auth_bp · admin_bp · clientes_bp · processos_bp · agenda_bp · documentos_bp · chat_bp
├── servicos/
│   ├── conteudo_publico.py  # navegação e textos verificados do site público
│   └── autenticacao · autorizacao · formatacao · minutas · relatorios · erros
├── modelos/ · dao/          # SQLAlchemy e persistência
├── backend/                 # API REST Python (config com dados do escritório, auth, models, schemas)
│   └── tests/               # test_api.py e test_site_publico.py
│
├── templates/
│   ├── layouts/             # base, publico, admin
│   ├── components/          # cabeçalho, rodapé, avisos, diálogo, navegação do painel
│   ├── publico/             # inicio, areas, escritorio, contato
│   ├── auth/ · admin/ · clientes/ · processos/ · agenda/ · documentos/ · relatorios/ · chat/
│   └── termos_de_servico · politica_privacidade · erro · login · recuperar
├── .claude/skills/apple-design  # link para .agents/skills/apple-design (skill Apple Design)
├── static/
│   ├── css/                 # tokens · base · componentes · publico
│   ├── js/                  # ativar-js · site · componentes
│   ├── img/                 # fotos, logotipos e monograma dourado (WebP) e ícones
│   └── fonts/               # Cormorant Garamond e Inter (OFL)
│
├── app/ · components/ · lib/ · prisma/   # interface alternativa em Next.js e banco SQLite (não redesenhada)
└── tests/                   # Jest (firm-data.test.ts)
```

## Princípios

1. **Dados verificados.** O site público só traz o que o escritório publica ou o que consta em registro público. A origem de cada dado está em [conteudo.md](conteudo.md).
2. **Uma fonte de tokens.** Cores, fontes, espaços e raios saem de `static/css/tokens.css`, derivado de [design-system.md](design-system.md).
3. **Sem script inline.** Todo JavaScript fica em `static/js/`. Isso permite uma política de segurança de conteúdo rígida no futuro.
4. **Estrutura modular.** Camadas separadas (rotas, serviços, persistência, templates), no padrão do SistemaEXTREMETEAM.
