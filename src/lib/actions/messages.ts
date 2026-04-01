"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyOwnerOfRenterMessage, notifyRenterOfOwnerMessage } from "@/lib/email";
import { renterMatchesConversation } from "@/lib/messaging";
import { MessageSender } from "@prisma/client";

const replySchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(8000),
});

export type MessageActionState = { error?: string; ok?: boolean };

export async function sendOwnerReply(_prev: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const parsed = replySchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Please enter a message (up to 8,000 characters)." };
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    return { error: "You must be signed in as the listing owner." };
  }

  const conv = await prisma.conversation.findFirst({
    where: { id: parsed.data.conversationId, ownerId: session.user.id },
    include: {
      listing: {
        include: {
          owner: { include: { ownerProfile: true } },
        },
      },
    },
  });
  if (!conv) {
    return { error: "Conversation not found." };
  }

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderRole: MessageSender.owner,
      body: parsed.data.body.trim(),
    },
  });

  const ownerDisplayName =
    conv.listing.owner.ownerProfile?.displayName ?? session.user.name ?? "The homeowner";

  await notifyRenterOfOwnerMessage({
    renterEmail: conv.renterEmail,
    listingTitle: conv.listing.title,
    ownerDisplayName,
    messagePreview: parsed.data.body.slice(0, 400),
    conversationId: conv.id,
    mailThreadToken: conv.mailThreadToken,
  });

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${conv.id}`);
  revalidatePath("/account/messages");
  revalidatePath(`/account/messages/${conv.id}`);

  return { ok: true };
}

export async function sendRenterReply(_prev: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const parsed = replySchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: "Please enter a message (up to 8,000 characters)." };
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Sign in to reply." };
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    include: {
      listing: { include: { owner: { include: { ownerProfile: true } } } },
    },
  });
  if (!conv || !renterMatchesConversation({ id: session.user.id, email: session.user.email }, conv)) {
    return { error: "Conversation not found." };
  }

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderRole: MessageSender.renter,
      body: parsed.data.body.trim(),
    },
  });

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { renterUserId: conv.renterUserId ?? session.user.id },
  });

  const ownerEmail = conv.listing.owner.ownerProfile?.contactEmail ?? conv.listing.owner.email;
  await notifyOwnerOfRenterMessage({
    ownerEmail,
    listingTitle: conv.listing.title,
    guestDisplayName: conv.renterName,
    messagePreview: parsed.data.body.slice(0, 400),
    conversationId: conv.id,
    mailThreadToken: conv.mailThreadToken,
  });

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${conv.id}`);
  revalidatePath("/account/messages");
  revalidatePath(`/account/messages/${conv.id}`);

  return { ok: true };
}

export async function markConversationReadByOwner(conversationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return;

  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!conv) return;

  await prisma.message.updateMany({
    where: {
      conversationId: conv.id,
      senderRole: MessageSender.renter,
      readByOwnerAt: null,
    },
    data: { readByOwnerAt: new Date() },
  });
}

export async function markConversationReadByRenter(conversationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return;

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conv || !renterMatchesConversation({ id: session.user.id, email: session.user.email }, conv)) return;

  await prisma.message.updateMany({
    where: {
      conversationId: conv.id,
      senderRole: MessageSender.owner,
      readByRenterAt: null,
    },
    data: { readByRenterAt: new Date() },
  });
}
