import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { MessageSender } from "@prisma/client";
import { markConversationReadByRenter, sendRenterReply } from "@/lib/actions/messages";
import { renterMatchesConversation } from "@/lib/messaging";
import { MessageReplyForm } from "@/components/messaging/message-reply-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RenterMessageThreadPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || !session.user.email) notFound();

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conv || !renterMatchesConversation({ id: session.user.id, email: session.user.email }, conv)) {
    notFound();
  }

  await markConversationReadByRenter(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/messages" className="text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
          ← All messages
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-stone-900">{conv.listing.title}</h1>
        <p className="mt-2 text-sm text-stone-600">
          Conversation with the homeowner.{" "}
          <Link href={`/listing/${conv.listing.slug}`} className="text-amber-900 underline decoration-amber-200 underline-offset-2">
            View listing
          </Link>
        </p>
      </div>

      <ul className="space-y-4">
        {conv.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border px-4 py-3 ${
              m.senderRole === MessageSender.renter
                ? "ml-4 border-amber-100 bg-amber-50/50"
                : "mr-4 border-stone-200 bg-stone-50"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
              {m.senderRole === MessageSender.renter ? "You" : "Homeowner"} · {format(m.createdAt, "MMM d, yyyy h:mm a")}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{m.body}</p>
          </li>
        ))}
      </ul>

      <MessageReplyForm conversationId={conv.id} action={sendRenterReply} submitLabel="Send message" />
    </div>
  );
}
