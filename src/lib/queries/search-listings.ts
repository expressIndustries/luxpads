import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";
import { startOfDay } from "date-fns";

export type SearchListingParams = {
  q?: string;
  city?: string;
  guests?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
};

export async function searchListings(params: SearchListingParams) {
  const and: Prisma.ListingWhereInput[] = [];

  if (params.city?.trim()) {
    const t = params.city.trim();
    and.push({
      OR: [{ city: { contains: t } }, { state: { contains: t } }, { title: { contains: t } }],
    });
  }

  if (params.q?.trim()) {
    const t = params.q.trim();
    and.push({
      OR: [{ title: { contains: t } }, { city: { contains: t } }, { summary: { contains: t } }],
    });
  }

  if (params.guests && params.guests > 0) {
    and.push({ maxGuests: { gte: params.guests } });
  }
  if (params.minBedrooms && params.minBedrooms > 0) {
    and.push({ bedrooms: { gte: params.minBedrooms } });
  }
  if (params.minBathrooms && params.minBathrooms > 0) {
    and.push({ bathrooms: { gte: params.minBathrooms } });
  }
  if (params.minPrice && params.minPrice > 0) {
    and.push({ nightlyRateCents: { gte: params.minPrice } });
  }
  if (params.maxPrice && params.maxPrice > 0) {
    and.push({ nightlyRateCents: { lte: params.maxPrice } });
  }
  if (params.propertyType?.trim()) {
    and.push({ propertyType: params.propertyType.trim() });
  }

  if (params.amenities?.length) {
    for (const slug of params.amenities) {
      and.push({
        amenities: { some: { amenity: { slug } } },
      });
    }
  }

  let excludeIds: string[] = [];
  if (params.checkIn && params.checkOut) {
    const start = startOfDay(new Date(params.checkIn));
    const end = startOfDay(new Date(params.checkOut));
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
      const blocked = await prisma.availabilityBlock.findMany({
        where: {
          AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
        },
        select: { listingId: true },
      });
      excludeIds = [...new Set(blocked.map((b) => b.listingId))];
    }
  }

  if (excludeIds.length) {
    and.push({ id: { notIn: excludeIds } });
  }

  const where = publicListingWhere(and.length ? { AND: and } : undefined);

  return prisma.listing.findMany({
    where,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
}

export async function getFeaturedListings(limit = 6) {
  return prisma.listing.findMany({
    where: publicListingWhere({ featured: true }),
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
}
