import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";
import { SITEMAP_STATIC_PATHS } from "@/lib/sitemap-static-paths";

export const dynamic = "force-dynamic";

/**
 * Paths that must appear in sitemap.xml even if `SITEMAP_STATIC_PATHS` is edited incorrectly.
 * (Merge is deduped; keep the main list in `sitemap-static-paths.ts` as the source of truth.)
 */
const SITEMAP_PATHS_GUARANTEED: readonly string[] = ["/rent-home-for-sundance-film-festival-boulder"];

function mergedStaticPaths(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of [...SITEMAP_STATIC_PATHS, ...SITEMAP_PATHS_GUARANTEED]) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

async function resolveBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  try {
    const h = await headers();
    const host =
      h.get("x-forwarded-host")?.split(",")[0]?.trim() || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
    return `${proto}://${host}`;
  } catch {
    return "http://localhost:3000";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await resolveBaseUrl();

  let listings: { slug: string; updatedAt: Date }[] = [];
  try {
    listings = await prisma.listing.findMany({
      where: publicListingWhere(),
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // Still emit static routes (marketing + guaranteed paths) if DB is unreachable.
  }

  const staticRoutes = mergedStaticPaths().map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const listingRoutes = listings.map((l) => ({
    url: `${base}/listing/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...listingRoutes];
}
