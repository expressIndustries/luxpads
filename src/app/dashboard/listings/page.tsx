import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

export default async function DashboardListingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const listings = await prisma.listing.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Listings</h1>
          <p className="mt-2 text-sm text-stone-600">Draft, submit for review, or unpublish anytime.</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          New listing
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">No listings yet.</p>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium text-stone-900">{l.title}</p>
                <p className="text-xs text-stone-500">
                  {l.city}, {l.state} · {statusLabel(l.status)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/listings/${l.id}/edit`}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm hover:border-stone-300"
                >
                  Edit
                </Link>
                {l.status === ListingStatus.published ? (
                  <Link
                    href={`/listing/${l.slug}`}
                    className="rounded-full border border-stone-200 px-4 py-2 text-sm hover:border-stone-300"
                  >
                    View live
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusLabel(s: ListingStatus) {
  switch (s) {
    case ListingStatus.published:
      return "Published";
    case ListingStatus.pending_review:
      return "Pending review";
    case ListingStatus.draft:
      return "Draft";
    case ListingStatus.suspended:
      return "Suspended";
    case ListingStatus.archived:
      return "Archived";
    default:
      return s;
  }
}
