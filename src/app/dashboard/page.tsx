import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [listingCount, inquiryCount] = await Promise.all([
    prisma.listing.count({ where: { ownerId: session.user.id } }),
    prisma.inquiry.count({
      where: { listing: { ownerId: session.user.id } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Overview</h1>
        <p className="mt-2 text-sm text-stone-600">
          Manage listings, calendars, and inquiries. Publishing is free—guests see homes once they are published (and
          approved if your site uses admin review).
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat title="Listings" value={String(listingCount)} />
        <Stat title="Inquiries" value={String(inquiryCount)} />
      </div>
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

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
