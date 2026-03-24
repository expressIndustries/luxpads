import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addAvailabilityBlock, deleteAvailabilityBlock } from "@/lib/actions/availability-actions";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AvailabilityBlockType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const listings = await prisma.listing.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true },
  });

  const listingId = sp.listingId ?? listings[0]?.id;
  if (!listingId) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Calendar</h1>
        <p className="mt-2 text-sm text-stone-600">Create a listing first to manage availability.</p>
      </div>
    );
  }

  const blocks = await prisma.availabilityBlock.findMany({
    where: { listingId },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Availability</h1>
        <p className="mt-2 text-sm text-stone-600">Block personal dates or mark manual holds. iCal sync can plug in later.</p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Listing</label>
          <select name="listingId" defaultValue={listingId} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm">
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary" className="!rounded-full !px-4 !py-2 text-sm">
          Switch
        </Button>
        <Link href={`/dashboard/listings/${listingId}/edit`} className="mb-2 text-sm text-stone-600 underline">
          Edit listing
        </Link>
      </form>

      <form action={addAvailabilityBlock} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <input type="hidden" name="listingId" value={listingId} />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-stone-500">Start</label>
          <input name="startDate" type="date" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-stone-500">End</label>
          <input name="endDate" type="date" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-stone-500">Type</label>
          <select name="type" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" defaultValue={AvailabilityBlockType.blocked}>
            <option value={AvailabilityBlockType.blocked}>Blocked</option>
            <option value={AvailabilityBlockType.booked}>Booked / unavailable</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Add range
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {blocks.map((b) => (
          <li key={b.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-stone-900">
                {format(b.startDate, "MMM d, yyyy")} — {format(b.endDate, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-stone-500">{b.type}</p>
              {b.note ? <p className="text-xs text-stone-600">{b.note}</p> : null}
            </div>
            <form
              action={async () => {
                "use server";
                await deleteAvailabilityBlock(b.id, listingId);
              }}
            >
              <Button type="submit" variant="secondary" className="text-xs">
                Remove
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
