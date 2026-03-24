"use server";

import { revalidatePath } from "next/cache";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin" || !session.user.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function adminSetListingStatus(listingId: string, status: ListingStatus) {
  const adminId = await requireAdmin();
  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "listing_status",
      targetType: "listing",
      targetId: listingId,
      metadata: { status },
    },
  });
  revalidatePath("/admin");
  revalidatePath("/search");
  revalidatePath("/");
}

export async function adminSetListingFeatured(listingId: string, featured: boolean) {
  const adminId = await requireAdmin();
  await prisma.listing.update({ where: { id: listingId }, data: { featured } });
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "listing_featured",
      targetType: "listing",
      targetId: listingId,
      metadata: { featured },
    },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminSetUserSuspended(userId: string, suspended: boolean) {
  const adminId = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { suspended } });
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "user_suspended",
      targetType: "user",
      targetId: userId,
      metadata: { suspended },
    },
  });
  revalidatePath("/admin");
  revalidatePath("/search");
}
