/**
 * Paths merged into `/sitemap.xml` (see `app/sitemap.ts`). Listing URLs are added separately from the DB.
 *
 * When you add a new **public, indexable** route under `src/app/<segment>/page.tsx`, append its pathname here
 * (leading slash, no trailing slash). Skip:
 * - `/dashboard/*`, `/admin/*`, `/account/*` (auth)
 * - `/listing/[slug]` (generated from Prisma)
 * - API routes
 */
export const SITEMAP_STATIC_PATHS: readonly string[] = [
  "",
  "/search",
  "/owners",
  "/owners/short-term-rental-tax",
  "/rent-home-for-sundance-film-festival-boulder",
  "/about",
  "/terms",
  "/privacy",
  "/login",
  "/signup",
];
