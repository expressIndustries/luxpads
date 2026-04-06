import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";
import { sortListingAmenitiesForDisplay } from "@/lib/sort-listing-amenities";

export async function getPublicListingBySlug(slug: string) {
  const listing = await prisma.listing.findFirst({
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
  if (!listing) return null;
  return {
    ...listing,
    amenities: sortListingAmenitiesForDisplay(listing.amenities),
  };
}
