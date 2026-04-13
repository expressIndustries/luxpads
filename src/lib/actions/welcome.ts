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

export async function completeWelcome(choice: "renter" | "owner", destRaw: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const name = (session.user.name ?? session.user.email ?? "Host").slice(0, 120);
  const email = session.user.email ?? "";

  if (choice === "owner") {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          role: Role.owner,
          welcomeCompletedAt: new Date(),
        },
      }),
      prisma.ownerProfile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: name,
          contactEmail: email || undefined,
        },
        update: {},
      }),
    ]);
  } else {
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
  }

  revalidatePath("/", "layout");

  const dest = choice === "renter" ? safeListingPath(destRaw) : null;
  if (dest) {
    redirect(`${dest}?contact_flow=1`);
  }
  if (choice === "owner") {
    redirect("/dashboard");
  }
  redirect("/");
}

export async function upgradeToOwner() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const name = (session.user.name ?? session.user.email ?? "Host").slice(0, 120);
  const email = session.user.email ?? "";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.owner,
        welcomeCompletedAt: new Date(),
      },
    }),
    prisma.ownerProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: name,
        contactEmail: email || undefined,
      },
      update: {},
    }),
  ]);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
