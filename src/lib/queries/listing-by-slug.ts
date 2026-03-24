import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";

export async function getPublicListingBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: publicListingWhere({ slug }),
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      availability: { orderBy: { startDate: "asc" } },
      owner: {
        include: {
          ownerProfile: true,
        },
      },
    },
  });
}
