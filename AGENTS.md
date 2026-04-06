<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LuxPads — ship changes the user can test immediately

The maintainer tests on a **dev machine** and expects to **see edits right away** (no full Docker `app` rebuild per tweak).

## After making site changes (UI, API routes, server actions, etc.)

1. **Prefer hot reload:** ensure a dev server is running, not the production `app` image.
   - From repo root: `npm run dev` with `DATABASE_URL` pointing at MySQL (e.g. `127.0.0.1:23306` when Compose `db` is up).
   - If port 3000 is taken by production: `docker compose stop app`, then `npm run dev` **or** `npm run dev:compose` (Compose service `app-dev`, profile `dev`).
2. **If Prisma schema changed:** run `npx prisma generate`; apply migrations with `npx prisma migrate deploy` (or `migrate dev` when appropriate). Do **not** reset the database unless the user asks.
3. **Do not run `npm run db:seed` by default** — it **wipes** application data. Only seed when the user explicitly wants a fresh demo dataset.
4. **Three fixed demo listings (no wipe):** `npm run db:seed:samples` upserts published listings with slugs `luxpads-sample-*`. Safe to re-run; persists in the MySQL volume with everything else.

## What persists on the dev machine (nothing extra required from the user)

- **MySQL data** lives in the Docker volume **`luxpads_mysql`** (Compose service `db`). It survives `docker compose down` and container restarts; it is removed only if the volume is deleted or seed wipes tables.
- **`.env`** (not committed) — keep `DATABASE_URL` and secrets here across sessions.
- **This `AGENTS.md` section** — reminds future sessions to start dev and avoid destructive seed unless requested.

## Production-style check (optional)

When the user needs to validate the **built** app: `docker compose build app && docker compose up -d app` — slow by design; not for every small change.

## New public marketing pages

If you add `src/app/<segment>/page.tsx` that should be indexed, append its path to **`SITEMAP_STATIC_PATHS`** in `src/lib/sitemap-static-paths.ts` (see file comment). Do not add dashboard, admin, account, or `/listing/*` there.
