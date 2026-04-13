import { siteCopy } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

function tryPublicOrigin(raw?: string | null): string | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    return new URL(t).origin;
  } catch {
    return null;
  }
}

/**
 * Origin for absolute URLs in server-sent email (verify link, message links). Resolves even when
 * `NEXT_PUBLIC_APP_URL` was missing at build time but `AUTH_URL` is set in the container.
 * Production: never falls back to localhost (uses `siteCopy.domainUrl` after env vars).
 */
export function publicOriginForServer(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  const fromEnv =
    tryPublicOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    tryPublicOrigin(process.env.AUTH_URL) ||
    tryPublicOrigin(process.env.NEXTAUTH_URL) ||
    (vercel ? tryPublicOrigin(`https://${vercel}`) : null);

  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return siteCopy.domainUrl.replace(/\/$/, "");
}

/** Canonical site origin for links in metadata & JSON-LD (prefers `NEXT_PUBLIC_APP_URL`, else production domain). */
export function siteOrigin(): string {
  const fromEnv = tryPublicOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv;
  return siteCopy.domainUrl.replace(/\/$/, "");
}

/** Absolute URL for a path starting with `/`. */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${p}`;
}

const META_MAX = 158;

/** Meta description for listing detail pages (unique, location + offer). */
export function buildListingMetaDescription(listing: {
  summary: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  nightlyRateCents: number;
  propertyType: string;
}): string {
  const summary = listing.summary.replace(/\s+/g, " ").trim();
  const head = summary.slice(0, 100).trim();
  const punct = head.endsWith(".") ? "" : ".";
  const rate = formatMoney(listing.nightlyRateCents);
  const tail = ` ${listing.propertyType} in ${listing.city}, ${listing.state} · ${listing.bedrooms} bed, ${listing.bathrooms} bath, up to ${listing.maxGuests} guests. From ${rate}/night. Book direct with the owner on LuxPads.`;
  const combined = `${head}${punct}${tail}`.replace(/\s+/g, " ").trim();
  return combined.length <= META_MAX ? combined : `${combined.slice(0, META_MAX - 1)}…`;
}
