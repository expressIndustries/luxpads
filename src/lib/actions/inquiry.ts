"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";
import { notifyOwnerOfNewConversation, notifyOwnerOfRenterMessage } from "@/lib/email";
import { auth } from "@/auth";
import { MessageSender } from "@prisma/client";
import { normalizeRenterEmail } from "@/lib/messaging";
import { generateMailThreadToken } from "@/lib/mailgun/thread-token";
import { getRequestIp, verifyTurnstileToken } from "@/lib/turnstile-verify";

const schema = z.object({
  listingSlug: z.string().min(1),
  renterName: z.string().min(1).max(120),
  renterEmail: z.string().email(),
  renterPhone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  guestCount: z.coerce.number().int().min(1).max(50).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  website: z.string().max(0).optional(),
});

export type InquiryState = { error?: string; ok?: boolean; is_new_thread?: boolean };

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const ip = await getRequestIp();
  const ts = await verifyTurnstileToken(String(formData.get("cf-turnstile-response") ?? ""), ip);
  if (!ts.ok) {
    return { error: ts.error };
  }

  const parsed = schema.safeParse({
    listingSlug: formData.get("listingSlug"),
    renterName: formData.get("renterName"),
    renterEmail: formData.get("renterEmail"),
    renterPhone: formData.get("renterPhone") || "",
    message: formData.get("message"),
    guestCount: formData.get("guestCount") || undefined,
    checkIn: formData.get("checkIn") || undefined,
    checkOut: formData.get("checkOut") || undefined,
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { error: "Please complete the form. Messages must be at least 10 characters." };
  }

  if (parsed.data.website) {
    return { error: "Unable to send inquiry." };
  }

  const listing = await prisma.listing.findFirst({
    where: publicListingWhere({ slug: parsed.data.listingSlug }),
    include: {
      owner: { include: { ownerProfile: true } },
    },
  });

  if (!listing) {
    return { error: "This listing is not available for inquiries." };
  }

  const session = await auth();
  const checkIn = parsed.data.checkIn ? new Date(parsed.data.checkIn) : null;
  const checkOut = parsed.data.checkOut ? new Date(parsed.data.checkOut) : null;
  const emailNorm = normalizeRenterEmail(parsed.data.renterEmail);

  const existing = await prisma.conversation.findUnique({
    where: {
      listingId_renterEmail: { listingId: listing.id, renterEmail: emailNorm },
    },
  });

  const ownerEmail = listing.owner.ownerProfile?.contactEmail ?? listing.owner.email;
  const messageBody = parsed.data.message.trim();

  if (existing) {
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: existing.id,
          senderRole: MessageSender.renter,
          body: messageBody,
        },
      }),
      prisma.conversation.update({
        where: { id: existing.id },
        data: {
          renterName: parsed.data.renterName,
          renterPhone: parsed.data.renterPhone || null,
          renterUserId: session?.user?.id ?? existing.renterUserId,
          checkIn: checkIn && !Number.isNaN(checkIn.getTime()) ? checkIn : existing.checkIn,
          checkOut: checkOut && !Number.isNaN(checkOut.getTime()) ? checkOut : existing.checkOut,
          guestCount: parsed.data.guestCount ?? existing.guestCount,
        },
      }),
    ]);

    await notifyOwnerOfRenterMessage({
      ownerEmail,
      listingTitle: listing.title,
      guestDisplayName: parsed.data.renterName,
      messageBody,
      conversationId: existing.id,
      mailThreadToken: existing.mailThreadToken,
    });

    return { ok: true, is_new_thread: false };
  } else {
    const conv = await prisma.conversation.create({
      data: {
        listingId: listing.id,
        ownerId: listing.ownerId,
        renterName: parsed.data.renterName,
        renterEmail: emailNorm,
        renterPhone: parsed.data.renterPhone || null,
        renterUserId: session?.user?.id ?? null,
        checkIn: checkIn && !Number.isNaN(checkIn.getTime()) ? checkIn : null,
        checkOut: checkOut && !Number.isNaN(checkOut.getTime()) ? checkOut : null,
        guestCount: parsed.data.guestCount ?? null,
        mailThreadToken: generateMailThreadToken(),
        messages: {
          create: {
            senderRole: MessageSender.renter,
            body: messageBody,
          },
        },
      },
    });

    await notifyOwnerOfNewConversation({
      ownerEmail,
      listingTitle: listing.title,
      guestDisplayName: parsed.data.renterName,
      messageBody,
      conversationId: conv.id,
      mailThreadToken: conv.mailThreadToken,
    });
  }

  return { ok: true, is_new_thread: true };
}
