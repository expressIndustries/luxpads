"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AvailabilityBlockType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

async function assertListingOwner(listingId: string, ownerId: string) {
  const listing = await prisma.listing.findFirst({ where: { id: listingId, ownerId } });
  if (!listing) throw new Error("Not found");
}

const blockSchema = z.object({
  listingId: z.string().min(10).max(64),
  startDate: z.string(),
  endDate: z.string(),
  type: z.nativeEnum(AvailabilityBlockType),
});

export async function addAvailabilityBlock(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "owner") {
      return { error: "Unauthorized" };
    }
    const parsed = blockSchema.safeParse({
      listingId: formData.get("listingId"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      type: formData.get("type") || AvailabilityBlockType.blocked,
    });
    if (!parsed.success) return { error: "Invalid dates." };
    await assertListingOwner(parsed.data.listingId, session.user.id);
    const start = startOfDay(new Date(parsed.data.startDate));
    const end = startOfDay(new Date(parsed.data.endDate));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return { error: "End date must be on or after start date." };
    }
    await prisma.availabilityBlock.create({
      data: {
        listingId: parsed.data.listingId,
        startDate: start,
        endDate: end,
        type: parsed.data.type,
      },
    });
    revalidatePath("/dashboard/calendar");
    revalidatePath(`/listing/${parsed.data.listingId}`);
    return { ok: true as const };
  } catch {
    return { error: "Could not add block." };
  }
}

export async function deleteAvailabilityBlock(blockId: string, listingId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") throw new Error("Unauthorized");
  await assertListingOwner(listingId, session.user.id);
  const listing = await prisma.listing.findFirst({
    where: { id: listingId },
    select: { slug: true },
  });
  await prisma.availabilityBlock.deleteMany({
    where: { id: blockId, listingId },
  });
  revalidatePath("/dashboard/calendar");
  if (listing) revalidatePath(`/listing/${listing.slug}`);
  revalidatePath("/search");
}
