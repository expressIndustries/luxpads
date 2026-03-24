import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function InquiriesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const inquiries = await prisma.inquiry.findMany({
    where: { listing: { ownerId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true, slug: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Inquiries</h1>
        <p className="mt-2 text-sm text-stone-600">Reply directly from your email—agreements stay between you and the guest.</p>
      </div>
      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">No inquiries yet.</p>
      ) : (
        <ul className="space-y-4">
          {inquiries.map((q) => (
            <li key={q.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-stone-900">{q.renterName}</p>
                  <p className="text-xs text-stone-500">
                    {q.renterEmail}
                    {q.renterPhone ? ` · ${q.renterPhone}` : ""}
                  </p>
                </div>
                <p className="text-xs text-stone-400">{format(q.createdAt, "MMM d, yyyy h:mm a")}</p>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {q.listing.title}
              </p>
              <p className="mt-2 text-sm text-stone-700 whitespace-pre-line">{q.message}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-600">
                {q.checkIn ? <span>Check-in: {format(q.checkIn, "MMM d, yyyy")}</span> : null}
                {q.checkOut ? <span>Check-out: {format(q.checkOut, "MMM d, yyyy")}</span> : null}
                {q.guestCount ? <span>Guests: {q.guestCount}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
