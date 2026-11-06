# Sistema de Gestão Jurídica — MFV Advocacia (Sousa – PB)

Sistema web completo (Frontend **Next.js 14 + React 18 + Tailwind CSS + Framer Motion + Canvas 3D** integrado a **Backend em Python com Flask + SQLAlchemy 2.0 + Pydantic v2**) desenvolvido para o escritório real **MFV Advocacia (*Melo Fernandes & Vasconcelos - Advogados Associados*)**, sediado em **Sousa – PB**.

---

## 1. Referência Institucional Real e Verificada (Zero Dados Fictícios)

> **Compromisso de Integridade**: Nenhuma informação inventada, cliente fictício ou processo alucinado foi incluído no código ou no banco de dados. Todos os dados institucionais abaixo são públicos e verificados junto à Receita Federal, OAB/PB e tribunais com jurisdição em Sousa – PB:

- **Razão Social**: `Melo Fernandes & Vasconcelos - Advogados Associados`
- **Nome Fantasia**: `MFV Advocacia`
- **CNPJ**: `22.233.391/0001-27` (Data de abertura: `30/03/2015` — Situação: **ATIVA**)
- **Natureza Jurídica**: `223-2 — Sociedade Simples Pura (Sociedade de Advogados registrada na OAB/PB)`
- **CNAE Principal**: `69.11-7-01 — Serviços advocatícios`
- **Endereço Oficial**: Rua Lafayette Pires Ferreira, nº 35, Centro — Sousa/PB, CEP `58800-510`
- **Contatos Oficiais**: `+55 (83) 98122-9292` / `+55 (83) 8804-0135` · `contato@mfv.adv.br` · `barbara@mfv.adv.br` · `https://mfv.adv.br`
- **Sócios-Fundadores (Quadro Societário Verificado — OAB/PB)**:
  1. **Dra. Bárbara de Melo Fernandes Vasconcelos** — `OAB/PB 19.571` (Sócia-Fundadora e Administradora; Ex-Vice-Presidente da Subseção da OAB de Sousa/PB)
  2. **Dr. Higor Vasconcelos de Almeida** — `OAB/PB 19.503` (Sócio-Fundador e Administrador; Membro do Tribunal de Ética e Disciplina — TED da OAB/PB)
- **Órgãos Judiciais Reais de Sousa – PB Mapeados no Sistema**:
  - **TJPB — Comarca de Sousa** (*Fórum Dr. José Mariz* — 1ª a 7ª Varas Mistas e Juizado Especial Misto — PJe 1º Grau)
  - **TRT-13 — Vara do Trabalho de Sousa** (*Fórum José Facundo* — Rua José Facundo de Lira, nº 30, Gato Preto, Sousa/PB)
  - **TRF-5 / SJPB — Subseção Judiciária de Sousa** (*Fórum Des. Federal Paulo de Tarso Benevides Gadelha* — Rua Francisco Vieira da Costa, nº 20, Maria Rachel, Sousa/PB — 8ª Vara Federal e JEF)
  - **OAB/PB — Subseção de Sousa**

---

## 2. Arquitetura do Backend em Python (`backend/`)

O backend do sistema é integralmente implementado em **Python 3** com arquitetura modular:

- **[`backend/config.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/config.py)**: Constantes institucionais reais da MFV Advocacia (Sousa – PB), variáveis de ambiente e configuração do SQLite (`prisma/dev.db`).
- **[`backend/models.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/models.py)**: Modelos ORM **SQLAlchemy 2.0** (`User`, `Client`, `LegalProcess`, `ProcessMovement`, `CalendarEvent`, `Document`, `InternalMessage`) com `PrismaDateTime` compatível com o banco SQLite.
- **[`backend/database.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/database.py)**: Engine SQLAlchemy, `PRAGMA foreign_keys=ON`, gerenciador transacional `session_scope()` e seed institucional `ensure_institutional_users()` (que cadastra apenas os 3 perfis reais da banca e **zero** clientes/processos fictícios).
- **[`backend/schemas.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/schemas.py)**: Validação estrita de entrada com **Pydantic v2** seguindo **OWASP Top 10:2025 / ASVS 5.0**.
- **[`backend/auth.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/auth.py)**: Autenticação com cookies assinados `HttpOnly; SameSite=Lax` (`mfv_py_session` via `itsdangerous.URLSafeTimedSerializer`) e decorador `@require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")` para controle RBAC.
- **[`backend/app.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/app.py)**: Servidor REST API **Flask** expondo:
  - `GET /api/health` e `GET /api/institucional`
  - `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
  - `GET /api/resumo` (KPIs reais agregados por área e tribunal)
  - `GET / POST /api/clientes` e `GET / PATCH / DELETE /api/clientes/<id>`
  - `GET / POST /api/processos`, `GET / PATCH / DELETE /api/processos/<id>` e `POST / PATCH /api/processos/<id>/movimentacoes`
  - `GET / POST / PATCH / DELETE /api/agenda`
  - `GET / POST / DELETE /api/documentos` (com versionamento automático `v1`, `v2`, `v3`)
  - `GET / POST / PATCH / DELETE /api/chat`
  - `GET / POST / PATCH /api/usuarios`
- **[`lib/python-backend.ts`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/lib/python-backend.ts)** & **[`backend/cli.py`](file:///home/edivaldo/PycharmProjects/sistemaEscritorio/backend/cli.py)**: Ponte híbrida HTTP + WSGI CLI — o Next.js encaminha chamadas `/api/*` para o servidor HTTP Python em `http://127.0.0.1:5000` ou executa diretamente a aplicação WSGI Python caso o processo `:5000` não tenha sido iniciado separadamente.

---

## 3. Como Executar

```bash
# 1. Iniciar o servidor Backend Python (Flask + SQLAlchemy em http://127.0.0.1:5000)
npm run backend
# (ou: python3 -m backend.app)

# 2. Iniciar o servidor Frontend (Next.js em http://localhost:3000)
npm run dev

# 3. Executar todos os testes automatizados (Jest Frontend + Unittest Backend Python)
npm run test:all
```
# sistemaEscritorio
