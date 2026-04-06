import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingEditForm } from "@/components/dashboard/listing-edit-form";
import { sortListingAmenitiesForDisplay } from "@/lib/sort-listing-amenities";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
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
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Edit listing</h1>
        <p className="mt-2 text-sm text-stone-600">Slug updates automatically while in draft.</p>
      </div>
      <ListingEditForm listing={listingOrdered} />
    </div>
  );
}
