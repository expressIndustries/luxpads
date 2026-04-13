"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function safeListingPath(raw: string | null | undefined): string | null {
  if (!raw?.trim().startsWith("/listing/") || raw.startsWith("//")) return null;
  return raw.trim().slice(0, 512);
}

/** Completes onboarding as a renter only. Owner accounts use a separate signup path (new email). */
export async function completeWelcome(destRaw: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.renter,
        welcomeCompletedAt: new Date(),
      },
    }),
    prisma.ownerProfile.deleteMany({ where: { userId } }),
  ]);

  revalidatePath("/", "layout");

  const dest = safeListingPath(destRaw);
  if (dest) {
    redirect(`${dest}?contact_flow=1`);
  }
  redirect("/");
}
