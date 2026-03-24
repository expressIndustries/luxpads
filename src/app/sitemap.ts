import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const listings = await prisma.listing.findMany({
    where: publicListingWhere(),
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes = [
    "",
    "/search",
    "/owners",
    "/about",
    "/terms",
    "/privacy",
    "/login",
    "/signup",
  ].map((path) => ({
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
