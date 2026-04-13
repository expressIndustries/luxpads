"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getRequestIp, verifyTurnstileToken } from "@/lib/turnstile-verify";
import {
  createEmailVerificationToken,
  isEmailVerificationEnforced,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { sendEmailVerificationMessage } from "@/lib/email-verification-mail";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
  accountType: z.enum(["owner", "renter"]),
  redirectPath: z.string().max(512).optional(),
});

export type RegisterState = {
  error?: string;
  ok?: boolean;
  /** True when Mailgun is configured and a confirmation link was emailed. */
  emailVerificationSent?: boolean;
};

export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const ip = await getRequestIp();
  const ts = await verifyTurnstileToken(String(formData.get("cf-turnstile-response") ?? ""), ip);
  if (!ts.ok) {
    return { error: ts.error };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    accountType: formData.get("accountType") ?? "owner",
    redirectPath: formData.get("redirectPath") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please check your details and try again." };
  }
  const { email, password, name, accountType } = parsed.data;
  const redirectPath = sanitizeEmailVerificationRedirect(parsed.data.redirectPath ?? null);

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }
  const passwordHash = await hash(password, 12);
  const enforced = isEmailVerificationEnforced();
  const emailVerified = enforced ? null : new Date();

  const user =
    accountType === "owner"
      ? await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            name,
            role: Role.owner,
            emailVerified,
            ownerProfile: {
              create: {
                displayName: name,
                contactEmail: email.toLowerCase(),
              },
            },
          },
        })
      : await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            name,
            role: Role.renter,
            emailVerified,
          },
        });

  if (enforced) {
    const { rawToken } = await createEmailVerificationToken({
      userId: user.id,
      redirectPath,
    });
    const sent = await sendEmailVerificationMessage({ to: user.email, rawToken });
    if (!sent.ok) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      return {
        error:
          "We could not send the confirmation email. Check email settings and try again, or contact support.",
      };
    }
    return { ok: true, emailVerificationSent: true };
  }

  return { ok: true, emailVerificationSent: false };
}
