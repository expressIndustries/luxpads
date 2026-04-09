import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingEditForm } from "@/components/dashboard/listing-edit-form";
import { OwnerListingCreatedTracker } from "@/components/analytics/owner-listing-created-tracker";
import { sortListingAmenitiesForDisplay } from "@/lib/sort-listing-amenities";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const createdParam = sp.owner_listing_created;
  const ownerListingCreated =
    createdParam === "1" || createdParam === "true" || (Array.isArray(createdParam) && createdParam[0] === "1");
  const firstParam = sp.first;
  const firstListing =
    firstParam === "1" || firstParam === "true" || (Array.isArray(firstParam) && firstParam[0] === "1");
  const listing = await prisma.listing.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });

  if (!listing) notFound();

  const listingOrdered = {
    ...listing,
    amenities: sortListingAmenitiesForDisplay(listing.amenities),
  };

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <OwnerListingCreatedTracker
          listingId={listing.id}
          enabled={ownerListingCreated}
          isFirstListing={firstListing}
        />
      </Suspense>
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Edit listing</h1>
        <p className="mt-2 text-sm text-stone-600">Slug updates automatically while in draft.</p>
      </div>
      <ListingEditForm listing={listingOrdered} />
    </div>
  );
}
