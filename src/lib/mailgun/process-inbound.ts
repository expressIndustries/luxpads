import { revalidatePath } from "next/cache";
import { MessageSender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseThreadTokenFromRecipient } from "@/lib/mailgun/reply-address";
import { parseEmailAddress } from "@/lib/mailgun/parse-sender";
import { verifyMailgunWebhookSignature } from "@/lib/mailgun/verify-signature";
import { normalizeRenterEmail } from "@/lib/messaging";
import { notifyOwnerOfRenterMessage, notifyRenterOfOwnerMessage } from "@/lib/email";

function formString(form: FormData, ...keys: string[]): string {
  for (const k of keys) {
    const v = form.get(k);
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function ownerInboxEmails(params: {
  accountEmail: string;
  contactEmail: string | null;
}): Set<string> {
  const set = new Set<string>();
  set.add(normalizeRenterEmail(params.accountEmail));
  if (params.contactEmail) set.add(normalizeRenterEmail(params.contactEmail));
  return set;
}

export type InboundResult =
  | { ok: true }
  | { ok: false; status: number; body: string };

/**
 * Handle Mailgun Routes / inbound parse POST (multipart or urlencoded).
 */
export async function processMailgunInbound(form: FormData): Promise<InboundResult> {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY?.trim();

  const timestamp = formString(form, "timestamp");
  const token = formString(form, "token");
  const signature = formString(form, "signature");

  if (!signingKey) {
    console.error("[mailgun:inbound] MAILGUN_WEBHOOK_SIGNING_KEY is not set; refusing inbound mail.");
    return { ok: false, status: 503, body: "Webhook signing not configured" };
  }

  if (!timestamp || !token || !signature) {
    return { ok: false, status: 400, body: "Missing signature fields" };
  }

  if (!verifyMailgunWebhookSignature({ signingKey, timestamp, token, signature })) {
    return { ok: false, status: 403, body: "Invalid signature" };
  }

  const recipient = formString(form, "recipient", "Recipient");
  const threadToken = parseThreadTokenFromRecipient(recipient);
  if (!threadToken) {
    return { ok: false, status: 400, body: "Invalid recipient" };
  }

  const senderRaw = formString(form, "sender", "from", "From");
  const senderEmail = parseEmailAddress(senderRaw);
  if (!senderEmail) {
    return { ok: false, status: 400, body: "Invalid sender" };
  }

  const bodyText =
    formString(form, "stripped-text", "stripped_text", "body-plain", "body_plain") ||
    formString(form, "body-plain", "body_plain");
  const body = bodyText.trim().slice(0, 8000);
  if (body.length < 1) {
    return { ok: false, status: 200, body: "ignored-empty" };
  }

  const conv = await prisma.conversation.findUnique({
    where: { mailThreadToken: threadToken },
    include: {
      listing: {
        include: {
          owner: { include: { ownerProfile: true } },
        },
      },
    },
  });

  if (!conv) {
    return { ok: false, status: 404, body: "Unknown thread" };
  }

  const renterNorm = normalizeRenterEmail(conv.renterEmail);
  const ownerEmails = ownerInboxEmails({
    accountEmail: conv.listing.owner.email,
    contactEmail: conv.listing.owner.ownerProfile?.contactEmail ?? null,
  });

  let role: MessageSender;
  if (senderEmail === renterNorm) {
    role = MessageSender.renter;
  } else if (ownerEmails.has(senderEmail)) {
    role = MessageSender.owner;
  } else {
    return { ok: false, status: 403, body: "Sender not in thread" };
  }

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderRole: role,
      body,
    },
  });

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { renterEmail: conv.renterEmail },
  });

  const ownerNotifyEmail = conv.listing.owner.ownerProfile?.contactEmail ?? conv.listing.owner.email;
  const displayOwnerName =
    conv.listing.owner.ownerProfile?.displayName ?? conv.listing.owner.name ?? "The homeowner";

  if (role === MessageSender.renter) {
    await notifyOwnerOfRenterMessage({
      ownerEmail: ownerNotifyEmail,
      listingTitle: conv.listing.title,
      guestDisplayName: conv.renterName,
      messagePreview: body.slice(0, 400),
      conversationId: conv.id,
      mailThreadToken: conv.mailThreadToken,
    });
  } else {
    await notifyRenterOfOwnerMessage({
      renterEmail: conv.renterEmail,
      listingTitle: conv.listing.title,
      ownerDisplayName: displayOwnerName,
      messagePreview: body.slice(0, 400),
      conversationId: conv.id,
      mailThreadToken: conv.mailThreadToken,
    });
  }

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${conv.id}`);
  revalidatePath("/account/messages");
  revalidatePath(`/account/messages/${conv.id}`);

  return { ok: true };
}
