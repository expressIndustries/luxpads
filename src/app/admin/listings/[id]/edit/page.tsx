import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingEditForm } from "@/components/dashboard/listing-edit-form";
import { sortListingAmenitiesForDisplay } from "@/lib/sort-listing-amenities";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function AdminEditListingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      owner: { include: { ownerProfile: true } },
    },
  });

  if (!listing) notFound();

  const listingOrdered = {
    ...listing,
    amenities: sortListingAmenitiesForDisplay(listing.amenities),
  };

  const ownerLabel = listingOrdered.owner.ownerProfile?.displayName ?? listingOrdered.owner.email;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-amber-900 underline decoration-stone-300 underline-offset-4 hover:decoration-amber-900"
        >
          ← Back to admin
        </Link>
        <Link
          href={`/listing/${listingOrdered.slug}`}
          className="text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
        >
          View public listing
        </Link>
      </div>
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Edit listing</h1>
        <p className="mt-2 text-sm text-stone-600">
          Admin editing · Owner: <span className="font-medium text-stone-800">{ownerLabel}</span>
        </p>
        <p className="mt-1 text-xs text-stone-500">Changes apply to this listing immediately after save.</p>
      </div>
      <ListingEditForm listing={listingOrdered} deleteRedirectHref="/admin" />
    </div>
  );
}
