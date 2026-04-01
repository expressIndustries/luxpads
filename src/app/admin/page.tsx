import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingStatus, Role } from "@prisma/client";
import { adminSetListingFeatured, adminSetListingStatus, adminSetUserSuspended } from "@/lib/actions/admin-actions";
import { AdminImpersonateButton } from "@/components/admin/admin-impersonate-button";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [ownerCount, listingPublished, pendingReview, conversationCount, listings, users] = await Promise.all([
    prisma.user.count({ where: { role: Role.owner } }),
    prisma.listing.count({ where: { status: ListingStatus.published } }),
    prisma.listing.count({ where: { status: ListingStatus.pending_review } }),
    prisma.conversation.count(),
    prisma.listing.findMany({
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: { owner: { include: { ownerProfile: true } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-4">
        <Metric label="Owners" value={ownerCount} />
        <Metric label="Published listings" value={listingPublished} />
        <Metric label="Pending review" value={pendingReview} />
        <Metric label="Conversations" value={conversationCount} />
      </section>

      <section>
        <h2 className="font-serif text-xl text-stone-900">Listings</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-900">{l.title}</td>
                  <td className="px-4 py-3 text-stone-600">{l.owner.ownerProfile?.displayName ?? l.owner.email}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">{l.status}</td>
                  <td className="px-4 py-3 text-stone-600">{formatMoney(l.nightlyRateCents)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <AdminImpersonateButton
                        ownerId={l.ownerId}
                        ownerLabel={l.owner.ownerProfile?.displayName ?? l.owner.email}
                      />
                      <Link
                        href={`/admin/listings/${l.id}/edit`}
                        className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-800 hover:border-stone-300"
                      >
                        Edit
                      </Link>
                      {l.status !== ListingStatus.published ? (
                        <form
                          action={async () => {
                            "use server";
                            await adminSetListingStatus(l.id, ListingStatus.published);
                          }}
                        >
                          <Button type="submit" variant="secondary" className="!px-3 !py-1 text-xs">
                            Approve
                          </Button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await adminSetListingStatus(l.id, ListingStatus.suspended);
                          }}
                        >
                          <Button type="submit" variant="secondary" className="!px-3 !py-1 text-xs">
                            Suspend
                          </Button>
                        </form>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await adminSetListingFeatured(l.id, !l.featured);
                        }}
                      >
                        <Button type="submit" variant="ghost" className="!px-3 !py-1 text-xs">
                          {l.featured ? "Unfeature" : "Feature"}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl text-stone-900">Users</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Suspended</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-stone-100">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.role}</td>
                  <td className="px-4 py-3 text-xs">{u.suspended ? "yes" : "no"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                    {u.role === Role.owner && !u.suspended ? (
                      <AdminImpersonateButton ownerId={u.id} ownerLabel={u.name ?? u.email} />
                    ) : null}
                    {u.role !== Role.admin ? (
                      <form
                        action={async () => {
                          "use server";
                          await adminSetUserSuspended(u.id, !u.suspended);
                        }}
                      >
                        <Button type="submit" variant="ghost" className="!px-3 !py-1 text-xs">
                          {u.suspended ? "Unsuspend" : "Suspend"}
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
