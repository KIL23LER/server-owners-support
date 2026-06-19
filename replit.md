# Server Owners Support

موقع مجتمع أصحاب سيرفرات الديسكورد العربي — يتيح تسجيل الدخول بـ Discord ومشاركة قوالب السيرفرات وتطبيقها عبر بوت.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` or `NEON_DATABASE_URL` — Postgres connection string (Neon)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM + Neon serverless HTTP driver (`@neondatabase/serverless`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle via `scripts/build-vercel.mjs`)
- Frontend: React + Vite (`artifacts/sos-website`)
- Auth: Discord OAuth2 (session tokens in DB, no cookies)

## Where things live

- `artifacts/api-server/src/routes/auth.ts` — Discord OAuth2 login/callback/logout
- `artifacts/api-server/src/routes/bot.ts` — Bot template apply endpoint
- `artifacts/api-server/src/routes/templates.ts` — Templates CRUD
- `artifacts/api-server/src/middlewares/auth.ts` — Session token validation
- `artifacts/sos-website/src/lib/auth.tsx` — Frontend auth context & session handling
- `artifacts/sos-website/src/pages/BotPage.tsx` — Bot invite + template apply UI
- `lib/db/src/index.ts` — Drizzle + Neon HTTP client
- `lib/db/src/schema/` — DB schema (users, sessions, templates, admins, settings)
- `scripts/build-vercel.mjs` — Custom Vercel Build Output API v3 build script

## Architecture decisions

- **Neon HTTP driver** (`drizzle-orm/neon-http`) instead of `pg` (TCP) — eliminates cold-start hangs in serverless. TCP connections to Neon can take 500ms–1s on cold starts causing Vercel function timeouts.
- **Session tokens in DB** (not JWT/cookies) — sessions table with expiry, validated on every request.
- **Export Express app directly** from `serverless.ts` — Vercel `launcherType: "Nodejs"` expects `(req, res)` handler, not Lambda `(event, context)`. Do NOT use `serverless-http`.
- **Pino logger without custom destination** — simple `pino({})` writes to stdout; sync destinations can hang serverless functions.
- **Global Express error handler** in `app.ts` — catches unhandled errors and redirects auth callbacks instead of crashing with `FUNCTION_INVOCATION_FAILED`.
- **Bot OAuth2 redirect** goes to `/bot` route — `BotPage.tsx` reads `guild_id` + `state` from URL params after Discord redirects back.

## Product

- تسجيل دخول بـ Discord
- عرض قوالب سيرفرات Discord
- إضافة البوت لسيرفرك وتطبيق قالب عليه تلقائياً
- لوحة أدمن لإدارة المستخدمين والقوالب

## Discord Developer Portal — Redirect URIs المطلوبة

أضف الرابطين التاليين في تطبيقك على discord.com/developers:

```
https://server-owners-support.vercel.app/api/auth/callback   ← تسجيل الدخول
https://server-owners-support.vercel.app/bot                  ← إضافة البوت
```

## Vercel Deployment

- Project: `server-owners-support` (prj_jCfRH3VCIVkqYN2Hyz84yHBI0U55)
- Build command: `node scripts/build-vercel.mjs`
- Uses Vercel Build Output API v3
- Required env vars: `NEON_DATABASE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `DISCORD_BOT_TOKEN`

## Gotchas

- **لا تستخدم `serverless-http`** — Vercel Nodejs launcher يتوقع Express app مباشرة
- **لا تستخدم `pg` Pool في serverless** — يسبب hang بسبب TCP cold start؛ استخدم `@neondatabase/serverless` مع `drizzle-orm/neon-http`
- **Vercel free tier**: حد 100 API deployments/يوم — إذا امتلأ، اعمل Redeploy من dashboard vercel.com
- **pino-pretty** يجب يكون في `external` في esbuild — لا يشتغل في production bundle
- الـ `/bot` route يجب يكون `BotPage` component وليس `<Redirect>` — بدونه يضيع `guild_id` من URL بعد Discord redirect

## User preferences

- اللغة العربية في التواصل
