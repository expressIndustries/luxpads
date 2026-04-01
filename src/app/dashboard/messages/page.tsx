import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { MessageSender } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function OwnerMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [conversations, unreadGroups] = await Promise.all([
    prisma.conversation.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: { select: { title: true, slug: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        senderRole: MessageSender.renter,
        readByOwnerAt: null,
        conversation: { ownerId: session.user.id },
      },
      _count: { _all: true },
    }),
  ]);

  const unreadMap = new Map(unreadGroups.map((g) => [g.conversationId, g._count._all]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Messages</h1>
        <p className="mt-2 text-sm text-stone-600">
          Conversations with guests who contacted you about your listings. Unread threads are highlighted.
        </p>
      </div>
      {conversations.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {conversations.map((c) => {
            const unread = unreadMap.get(c.id) ?? 0;
            const preview = c.messages[0]?.body ?? "";
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/messages/${c.id}`}
                  className={`block rounded-2xl border p-5 shadow-sm transition hover:border-stone-300 ${
                    unread > 0 ? "border-amber-200 bg-amber-50/40" : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">{c.renterName}</p>
                      <p className="text-xs text-stone-500">{c.renterEmail}</p>
                    </div>
                    <div className="text-right">
                      {unread > 0 ? (
                        <span className="inline-block rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          {unread} new
                        </span>
                      ) : null}
                      <p className="mt-1 text-xs text-stone-400">{format(c.updatedAt, "MMM d, yyyy h:mm a")}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{c.listing.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">{preview}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
