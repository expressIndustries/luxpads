"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicListingWhere } from "@/lib/listing-visibility";
import { notifyOwnerOfInquiry } from "@/lib/email";
import { auth } from "@/auth";

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

export type InquiryState = { error?: string; ok?: boolean };

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
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

  await prisma.inquiry.create({
    data: {
      listingId: listing.id,
      renterName: parsed.data.renterName,
      renterEmail: parsed.data.renterEmail,
      renterPhone: parsed.data.renterPhone || null,
      message: parsed.data.message,
      guestCount: parsed.data.guestCount ?? null,
      checkIn: checkIn && !Number.isNaN(checkIn.getTime()) ? checkIn : null,
      checkOut: checkOut && !Number.isNaN(checkOut.getTime()) ? checkOut : null,
      renterUserId: session?.user?.id ?? null,
    },
  });

  const ownerEmail = listing.owner.ownerProfile?.contactEmail ?? listing.owner.email;
  await notifyOwnerOfInquiry({
    ownerEmail,
    listingTitle: listing.title,
    renterName: parsed.data.renterName,
    renterEmail: parsed.data.renterEmail,
    messagePreview: parsed.data.message.slice(0, 400),
  });

  return { ok: true };
}
