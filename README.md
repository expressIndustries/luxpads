# LuxStay Direct (FestivalPads marketplace)

Production-style MVP for a **luxury vacation home listing marketplace**. Homeowners pay a **monthly Stripe subscription** to publish; travelers **browse and inquire for free** and **finalize bookings directly with owners** (no platform booking checkout, no traveler fees).

> **Stack note:** Your brief mentioned a PHP/LAMP + MySQL setup, but the detailed product spec calls for **Next.js + PostgreSQL + Prisma**. This repo implements that stack. MySQL/LAMP is not used. **Docker Compose** in this folder runs **PostgreSQL** for local/prod-like dev; the optional `app` service uses **Node 22** (Next.js 16 requires **Node ≥ 20.9**).

## Requirements

- **Node.js ≥ 20.9** (Next.js 16)
- **Docker** (for Postgres) *or* any managed PostgreSQL instance
- **npm** (or pnpm/yarn if you adapt commands)

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

### Seed logins

| Role   | Email                    | Password          |
|--------|--------------------------|-------------------|
| Admin  | `admin@festivalpads.com` | `LuxStay!demo123` |
| Owner  | `owner1@festivalpads.com` | same             |
| Renter | `renter@festivalpads.com` | same            |

## Environment variables

See [`.env.example`](./.env.example). Key entries:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Auth.js secret
- `STRIPE_*` — Owner subscription checkout + webhooks (placeholders OK for UI-only dev)
- `REQUIRE_LISTING_APPROVAL` — `true` sends owner “Publish” to `pending_review` for admin approval

## Stripe (owner subscriptions)

1. Create a **Product** + recurring **Price** in Stripe.
2. Put the Price ID in `STRIPE_PRICE_ID_OWNER_MONTHLY` and update the `Plan.stripePriceId` row (or re-seed after changing env).
3. Point a Stripe CLI/webhook to `/api/stripe/webhook` with signing secret `STRIPE_WEBHOOK_SECRET`.
4. Use **Checkout** from **Dashboard → Billing** once keys are live.

Without real keys, billing UI explains that checkout is unavailable.

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
    api/stripe/checkout|webhook
    api/upload
    (marketing pages: /, /search, /listing/[slug], /owners, /about, …)
    dashboard/*          # Owner hub
    admin/*              # Moderation + metrics
  components/            # UI, layout, listing, dashboard widgets
  lib/
    actions/             # Server Actions (auth, listings, inquiries, admin)
    queries/             # Prisma read helpers (search, listing by slug)
    prisma.ts, stripe.ts, email.ts, storage.ts, availability.ts, …
  auth.ts                # Auth.js configuration
  middleware.ts          # Protects /dashboard and /admin
```

## Product assumptions (documented)

- **Public visibility** requires `listing.status = published`, **non-suspended** owner, and **subscription status in `{ active, trialing }`**. If membership lapses, listings no longer appear in public search—even if status stayed `published`.
- **Anti-spam**: honeypot field on inquiry form + basic validation.
- **Slugs** regenerate from title while a listing is still in `draft` / `draft-*` slug; after publish, slug updates on publish action (see `publishListing`).
- **Prisma 5** is pinned for **Node 18–20** compatibility on older dev machines; upgrade to Prisma 7+ when you standardize on **Node 22+**.

## Docker (full stack)

```bash
docker compose --profile full up --build
```

Ensure production `AUTH_SECRET`, `DATABASE_URL`, and Stripe secrets are injected. Run migrations against the DB before serving traffic.

## Legal copy

Terms and Privacy pages are **placeholders**. Listing and inquiry flows include **marketplace disclaimers** that owners handle contracts and payments.

---

Built as an MVP foundation: swap credentials, harden rate limits, add observability, and replace placeholder legal text before going live.
