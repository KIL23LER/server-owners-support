---
name: Vercel full-stack deploy
description: How to deploy this monorepo to Vercel with Express API as serverless function
---

## Pattern
- `vercel.json` at root: buildCommand builds frontend + API, outputDirectory = frontend dist, rewrites /api/* → /api/index
- `api/index.js` at root: lazy-imports `artifacts/api-server/dist/app.mjs` (Express app without listen)
- `build.mjs` must produce both `dist/index.mjs` (with listen) AND `dist/app.mjs` (app only)
- `.vercelignore` must exclude `**/*.map` files — otherwise 10MB upload limit hit
- Project: prj_jCfRH3VCIVkqYN2Hyz84yHBI0U55, Team: team_GL3uT9XSFgWMNTJWdUvWZ5NB

**Why:** Vercel serverless needs the Express app exported as a handler, not a server that calls listen().
**How to apply:** Any time the backend changes, rebuild and run `vercel deploy --prod --token $VERCEL_TOKEN --yes`
