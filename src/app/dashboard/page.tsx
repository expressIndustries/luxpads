import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [listingCount, inquiryCount, sub] = await Promise.all([
    prisma.listing.count({ where: { ownerId: session.user.id } }),
    prisma.inquiry.count({
      where: { listing: { ownerId: session.user.id } },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const active = isSubscriptionActive(sub?.status);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Overview</h1>
        <p className="mt-2 text-sm text-stone-600">
          Manage listings, calendars, and inquiries. Publishing stays live only with an active membership.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title="Listings" value={String(listingCount)} />
        <Stat title="Inquiries" value={String(inquiryCount)} />
        <Stat title="Membership" value={active ? "Active" : "Inactive"} highlight={!active} />
      </div>
      {!active ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
          <p className="font-medium">Activate membership to publish</p>
          <p className="mt-1 text-amber-900/90">
            Drafts stay saved, but guests only see homes when your subscription is active or trialing.
          </p>
          <Link href="/dashboard/billing" className="mt-3 inline-block text-sm font-medium underline">
            Go to billing
          </Link>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/listings/new"
          className="inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          New listing
        </Link>
        <Link
          href="/search"
          className="inline-flex rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 hover:border-stone-300"
        >
          View marketplace
        </Link>
      </div>
    </div>
  );
}

function Stat({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlight ? "border-amber-300 bg-amber-50/50" : "border-stone-200 bg-white"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
