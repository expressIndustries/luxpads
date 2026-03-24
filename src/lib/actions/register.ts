"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
  listHomes: z.boolean().optional(),
});

export type RegisterState = { error?: string; ok?: boolean };

export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    listHomes: formData.get("listHomes") === "on",
  });
  if (!parsed.success) {
    return { error: "Please check your details and try again." };
  }
  const { email, password, name, listHomes } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }
  const passwordHash = await hash(password, 12);
  const role: Role = listHomes ? Role.owner : Role.renter;

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      ...(listHomes
        ? {
            ownerProfile: {
              create: {
                displayName: name,
                contactEmail: email.toLowerCase(),
              },
            },
          }
        : {}),
    },
  });

  return { ok: true };
}
