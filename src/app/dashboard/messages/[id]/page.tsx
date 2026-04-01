import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { MessageSender } from "@prisma/client";
import { markConversationReadByOwner, sendOwnerReply } from "@/lib/actions/messages";
import { MessageReplyForm } from "@/components/messaging/message-reply-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OwnerMessageThreadPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") notFound();

  const conv = await prisma.conversation.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conv) notFound();

  await markConversationReadByOwner(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/messages" className="text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
          ← All messages
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-stone-900">{conv.renterName}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {conv.renterEmail}
          {conv.renterPhone ? ` · ${conv.renterPhone}` : ""}
        </p>
        <p className="mt-2 text-sm text-stone-700">
          Re:{" "}
          <Link href={`/listing/${conv.listing.slug}`} className="font-medium text-amber-900 underline decoration-amber-200 underline-offset-2">
            {conv.listing.title}
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-600">
          {conv.checkIn ? <span>Check-in: {format(conv.checkIn, "MMM d, yyyy")}</span> : null}
          {conv.checkOut ? <span>Check-out: {format(conv.checkOut, "MMM d, yyyy")}</span> : null}
          {conv.guestCount ? <span>Guests: {conv.guestCount}</span> : null}
        </div>
      </div>

      <ul className="space-y-4">
        {conv.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border px-4 py-3 ${
              m.senderRole === MessageSender.owner
                ? "ml-4 border-stone-200 bg-stone-50"
                : "mr-4 border-amber-100 bg-amber-50/50"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
              {m.senderRole === MessageSender.owner ? "You" : "Guest"} · {format(m.createdAt, "MMM d, yyyy h:mm a")}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{m.body}</p>
          </li>
        ))}
      </ul>

      <MessageReplyForm conversationId={conv.id} action={sendOwnerReply} submitLabel="Send reply" />
    </div>
  );
}
