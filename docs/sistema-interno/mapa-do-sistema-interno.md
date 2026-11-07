# Mapa do Site – Sistema de Escritório de Advocacia

## Estrutura de Navegação
```
/
├─ login/                # Tela de login / recuperação de senha
├─ dashboard/            # Visão geral com indicadores (processos por status, prazos)
│   ├─ clientes/         # Listagem e busca de clientes
│   ├─ processos/        # Listagem de processos, filtro por advogado, status, prazo
│   ├─ agenda/           # Calendário com eventos e prazos
│   ├─ documentos/       # Área de documentos recentes e upload rápido
│   └─ relatórios/       # Acesso a relatórios gerados
├─ clientes/
│   ├─ novo/             # Formulário de cadastro de cliente
│   └─ [id]/             # Detalhes do cliente (dados, processos vinculados)
├─ processos/
│   ├─ novo/             # Criação de novo processo
│   └─ [id]/
│       ├─ detalhes/      # Informações completas, partes, andamentos
│       ├─ timeline/      # Linha do tempo de movimentações
│       ├─ documentos/    # Documentos associados ao processo
│       └─ comentários/   # Chat interno sobre o processo
├─ agenda/
│   ├─ calendario/        # Visão mensal/semanal
│   └─ eventos/          # CRUD de eventos e tarefas
├─ documentos/
│   ├─ upload/           # Tela de upload de documentos
│   └─ lista/            # Listagem de documentos com filtros
├─ relatórios/
│   ├─ gerar/            # Formulário para escolher parâmetros
│   └─ historico/        # Histórico de relatórios gerados
└─ config/
    ├─ perfil/           # Configurações de usuário e perfil
    └─ admin/            # Área de administração (roles, usuários)
```

## Fluxos Principais
1. **Login → Dashboard** – Auth via NextAuth, redirecionamento para dashboard.
2. **Dashboard → Clientes → Detalhes** – Visualizar cliente, acessar processos vinculados.
3. **Processos → Timeline → Notificação** – Quando um prazo próximo aparece, notificação push/email.
4. **Agenda → Evento → Notificação** – Cria evento, agenda, e notifica advogados.
5. **Documentos → Upload → Vercel Blob** – Arquivo armazenado, URL salva no DB.
6. **Relatórios → Gerar → Download** – Gera PDF/CSV e disponibiliza download.

---
*Este mapa de site define as rotas principais e a hierarquia de navegação para orientar a implementação do front‑end.*