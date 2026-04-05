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

const updateBlockSchema = z.object({
  blockId: z.string().min(10).max(64),
  listingId: z.string().min(10).max(64),
  type: z.nativeEnum(AvailabilityBlockType),
});

export async function addAvailabilityBlock(formData: FormData): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "owner") return;
    const parsed = blockSchema.safeParse({
      listingId: formData.get("listingId"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      type: formData.get("type") || AvailabilityBlockType.available,
    });
    if (!parsed.success) return;
    await assertListingOwner(parsed.data.listingId, session.user.id);
    const start = startOfDay(new Date(parsed.data.startDate));
    const end = startOfDay(new Date(parsed.data.endDate));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return;
    await prisma.availabilityBlock.create({
      data: {
        listingId: parsed.data.listingId,
        startDate: start,
        endDate: end,
        type: parsed.data.type,
      },
    });
    const listing = await prisma.listing.findFirst({
      where: { id: parsed.data.listingId },
      select: { slug: true },
    });
    revalidatePath("/dashboard/calendar");
    if (listing) revalidatePath(`/listing/${listing.slug}`);
    revalidatePath("/search");
  } catch {
    /* noop — form has no error UI for MVP */
  }
}

export async function updateAvailabilityBlock(formData: FormData): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "owner") return;
    const parsed = updateBlockSchema.safeParse({
      blockId: formData.get("blockId"),
      listingId: formData.get("listingId"),
      type: formData.get("type"),
    });
    if (!parsed.success) return;
    await assertListingOwner(parsed.data.listingId, session.user.id);
    await prisma.availabilityBlock.updateMany({
      where: { id: parsed.data.blockId, listingId: parsed.data.listingId },
      data: { type: parsed.data.type },
    });
    const listing = await prisma.listing.findFirst({
      where: { id: parsed.data.listingId },
      select: { slug: true },
    });
    revalidatePath("/dashboard/calendar");
    if (listing) revalidatePath(`/listing/${listing.slug}`);
    revalidatePath("/search");
  } catch {
    /* noop */
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
