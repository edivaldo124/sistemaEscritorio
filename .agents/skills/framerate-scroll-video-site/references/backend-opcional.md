# Backend opcional (D1 + Drizzle + login com ChatGPT)

Use só quando o site precisar guardar dados ou identificar usuários. O hero funciona 100% estático sem nada disto.

## Pré-requisito: sair do export estático
`next.config.ts` usa `output: 'export'`, que não suporta rotas de API nem `headers()`. Para usar backend:
1. Remova `output`, `distDir` e `assetPrefix` do `next.config.ts` (ou rode via vinext: `vite.config.ts` já monta vinext + plugin Sites + Cloudflare).
2. O Worker de entrada é `worker/index.ts` (repassa para `vinext/server/app-router-entry` e trata `/_vinext/image`).
3. Com o build vinext, `dist/server/index.js` existe e `npm test` volta a funcionar.

## Banco D1 com Drizzle
1. Em `.openai/hosting.json`, defina `"d1": "DB"` (e `"r2": "BUCKET"` se precisar de storage). O `vite.config.ts` simula essas bindings localmente com um ID placeholder.
2. Defina tabelas em `db/schema.ts` (começa vazio de propósito). Exemplo em `examples/d1/db/schema.ts`:
   ```ts
   export const notes = sqliteTable("notes", {
     id: integer("id").primaryKey({ autoIncrement: true }),
     title: text("title").notNull(),
     content: text("content").notNull().default(""),
     createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
   });
   ```
3. `npm run db:generate` gera o SQL em `drizzle/` (dialeto sqlite). A plataforma aplica a migration no deploy.
4. Acesse com `getDb()` de `db/index.ts` (lança erro claro se a binding `DB` não existir).
5. Rota de exemplo em `examples/d1/app/api/notes/route.ts`: GET lista as 20 últimas (ordenadas por `createdAt`, `id` desc); POST valida `title` obrigatório e retorna 201; erros de "no such table" viram mensagem explicando para gerar a migration. Copie para `app/api/...` ajustando os imports.

## Login com ChatGPT (SIWC) — `app/chatgpt-auth.ts`
A plataforma (Dispatch) injeta headers de identidade e é dona das rotas `/signin-with-chatgpt`, `/signout-with-chatgpt` e `/callback` — **não crie rotas nesses caminhos**.

Headers: `oai-authenticated-user-id`, `oai-authenticated-user-email`, e opcionalmente `oai-authenticated-user-full-name` (percent-encoded UTF-8, acompanhado de `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`). O ID é estável por usuário por site.

Helpers:
- `getChatGPTUser()` → `{ userId, displayName, email, fullName } | null` (displayName = fullName ?? email).
- `requireChatGPTUser(returnTo)` → redireciona anônimos para o login.
- `chatGPTSignInPath(returnTo)` / `chatGPTSignOutPath(returnTo = "/")` → links; `returnTo` é validado (só caminho relativo same-origin, nunca rotas reservadas).
- Páginas protegidas: `export const dynamic = "force-dynamic"`.

Login prova identidade, não pertença a workspace — para restringir acesso use as políticas da plataforma ou uma allowlist no servidor. Conteúdo público continua anônimo.
