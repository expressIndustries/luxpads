# LuxPads (LuxPads.co)

Production-style MVP for a **luxury vacation home listing marketplace**. **Owner listings are free**; travelers **browse and inquire for free** and **finalize bookings directly with owners** (no platform booking checkout, no traveler fees).

> **Stack note:** The app is **Next.js + Prisma** on **MySQL 8**. **PHP does not run this app** — on a traditional LAMP server you still install **Node.js ≥ 20.9** and use **Apache as a reverse proxy** to the Node process (see `deploy/apache-luxpads.conf.example`). MySQL is shared with the usual LAMP stack. **Docker Compose** is optional (local MySQL 8.4 + optional app container).

## Requirements

- **Node.js ≥ 20.9** (Next.js 16)
- **MySQL 8** (or MariaDB 10.5+ compatible with Prisma’s `mysql` provider)
- **npm** (or pnpm/yarn if you adapt commands)
- **Docker** — optional; convenient for local MySQL via `docker compose up -d db`

## Quick start (local)

```bash
cp .env.example .env
# Edit AUTH_SECRET (openssl rand -base64 32) and URLs as needed

docker compose up -d db
npm install
npx prisma migrate deploy   # or: npm run db:migrate (dev)
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To load the same demo data **via MySQL only** (e.g. on a server), import [`deploy/luxpads-sample-data.sql`](./deploy/luxpads-sample-data.sql) after migrations. It **clears** users, listings, and related tables first—see [`deploy/SERVER-DEPLOY.md`](./deploy/SERVER-DEPLOY.md). Regenerate with `npm run db:sample-sql` if you change `scripts/generate-sample-data-sql.ts`.

**MySQL via Docker:** `docker-compose.yml` maps **host 23306 → container 3306** so it can sit beside a local MySQL on 3306/3307; change the published port and `DATABASE_URL` together if needed. Default DB name and user are **`luxpads`** (see `.env.example`). Volume: **`luxpads_mysql`**. If you change credentials or the volume name, run `docker compose down` and remove the old volume when you want a clean database, then `docker compose up -d` again.

### Seed logins

| Role   | Email                    | Password          |
|--------|--------------------------|-------------------|
| Admin  | `admin@luxpads.co` | `LuxPads!demo123` |
| Owner  | `owner1@luxpads.co` | same             |
| Renter | `renter@luxpads.co` | same            |

## Environment variables

See [`.env.example`](./.env.example). Key entries:

- `DATABASE_URL` — MySQL connection string, e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE`
- `AUTH_SECRET` — Auth.js secret
- `REQUIRE_LISTING_APPROVAL` — `true` sends owner “Publish” to `pending_review` for admin approval

## Image uploads

Development uses `public/uploads` via [`src/lib/storage.ts`](./src/lib/storage.ts). Swap this module for **S3** or **Cloudinary** in production.

## Email

[`src/lib/email.ts`](./src/lib/email.ts) logs to the console by default. Wire **SMTP**, **Resend**, or **SendGrid** there.

## Maps

Listing pages render a **placeholder** map component ready for Google/Mapbox keys (`NEXT_PUBLIC_*`).

## Folder structure (high level)

```
prisma/
  schema.prisma          # Data model
  seed.ts                # Demo owners, listings, inquiries
  migrations/            # SQL migrations
src/
  app/                   # App Router pages, layouts, API routes
    api/auth/[...nextauth]/
    api/upload
    (marketing pages: /, /search, /listing/[slug], /owners, /about, …)
    dashboard/*          # Owner hub
    admin/*              # Moderation + metrics
  components/            # UI, layout, listing, dashboard widgets
  lib/
    actions/             # Server Actions (auth, listings, inquiries, admin)
    queries/             # Prisma read helpers (search, listing by slug)
    prisma.ts, email.ts, storage.ts, availability.ts, …
  auth.ts                # Auth.js configuration
  middleware.ts          # Protects /dashboard and /admin
```

## Product assumptions (documented)

- **Public visibility** requires `listing.status = published` and a **non-suspended** owner.
- **Anti-spam**: honeypot field on inquiry form + basic validation.
- **Slugs** regenerate from title while a listing is still in `draft` / `draft-*` slug; after publish, slug updates on publish action (see `publishListing`).
- **Prisma 5** is pinned for **Node 18–20** compatibility on older dev machines; upgrade to Prisma 7+ when you standardize on **Node 22+**.

## Docker (full stack)

```bash
docker compose up -d --build
```

Ensure production `AUTH_SECRET` and `DATABASE_URL` are injected. Run migrations against the DB before serving traffic. For Compose-only DB: `./deploy.sh docker up` is also supported.

## Deploy without Docker (LAMP-friendly)

Step-by-step checklist (WHM / cPanel): [`deploy/SERVER-DEPLOY.md`](./deploy/SERVER-DEPLOY.md).

1. Create a MySQL database and user; point `DATABASE_URL` at it (see `.env.example`).
2. On the server (Node 20.9+): unzip the project, `cp .env.example .env`, edit secrets and `NEXT_PUBLIC_APP_URL`.
3. Run **`./deploy.sh`** (or `./deploy.sh lamp`) — installs deps, runs `prisma migrate deploy`, builds Next.js.
4. Run the app under **systemd** using [`deploy/luxpads.service.example`](./deploy/luxpads.service.example) or foreground **`./deploy.sh start`**.
5. Configure **Apache** with `proxy` modules so traffic forwards to `127.0.0.1:3000`. Plain vhost: [`deploy/apache-luxpads.conf.example`](./deploy/apache-luxpads.conf.example). **WHM / cPanel (domain root, multiple accounts):** use per-domain userdata includes in [`deploy/apache-cpanel-whm.conf.example`](./deploy/apache-cpanel-whm.conf.example) (includes a `/.well-known` bypass for AutoSSL).
6. Ensure `public/uploads` is writable by the Unix user that runs Node.

PHP 8.x can keep serving other sites on the same host; LuxPads only needs Node for its process and MySQL for data.

## Legal copy

Terms and Privacy pages are **placeholders**. Listing and inquiry flows include **marketplace disclaimers** that owners handle contracts and payments.

---

Built as an MVP foundation: swap credentials, harden rate limits, add observability, and replace placeholder legal text before going live.
