import { prisma } from "@/lib/prisma";
import { ListingPublishControls } from "@/components/dashboard/listing-publish-controls";
import { ListingImageManager } from "@/components/dashboard/listing-image-manager";
import {
  ListingEditFormClient,
  type ListingEditDefaults,
} from "@/components/dashboard/listing-edit-form-client";
import type { Listing, ListingImage, ListingAmenity } from "@prisma/client";

type ListingWith = Listing & {
  images: ListingImage[];
  amenities: (ListingAmenity & { amenity: { slug: string; label: string } })[];
};

function buildDefaults(listing: ListingWith): ListingEditDefaults {
  return {
    id: listing.id,
    title: listing.title,
    summary: listing.summary,
    description: listing.description,
    propertyType: listing.propertyType,
    addressLine1: listing.addressLine1,
    city: listing.city,
    state: listing.state,
    country: listing.country,
    postalCode: listing.postalCode,
    latitude: listing.latitude != null ? String(listing.latitude) : "",
    longitude: listing.longitude != null ? String(listing.longitude) : "",
    maxGuests: listing.maxGuests,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    beds: listing.beds,
    sleepingArrangements: listing.sleepingArrangements ?? "",
    houseRules: listing.houseRules ?? "",
    checkInOut: listing.checkInOut ?? "",
    cancellationPolicy: listing.cancellationPolicy ?? "",
    nightlyRateDollars: Math.round(listing.nightlyRateCents / 100),
    minNights: listing.minNights,
    cleaningFeeNote: listing.cleaningFeeNote ?? "",
  };
}

export async function ListingEditForm({ listing }: { listing: ListingWith }) {
  const allAmenities = await prisma.amenity.findMany({ orderBy: { label: "asc" } });
  const selectedAmenitySlugs = listing.amenities.map((a) => a.amenity.slug);

  return (
    <div className="space-y-10">
      <ListingPublishControls listingId={listing.id} status={listing.status} />
      <ListingImageManager
        listingId={listing.id}
        images={listing.images.map((i) => ({ id: i.id, url: i.url, sortOrder: i.sortOrder }))}
      />

      <ListingEditFormClient
        listingUpdatedAt={listing.updatedAt.toISOString()}
        defaults={buildDefaults(listing)}
        selectedAmenitySlugs={selectedAmenitySlugs}
        allAmenities={allAmenities.map((a) => ({ id: a.id, slug: a.slug, label: a.label }))}
      />
    </div>
  );
}
