"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationToken,
  isEmailVerificationEnforced,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { sendEmailVerificationMessage } from "@/lib/email-verification-mail";

export type ResendVerificationState = { error?: string; ok?: boolean };

const MIN_RESEND_MS = 60_000;

export async function resendVerificationEmail(
  _prev: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  if (!isEmailVerificationEnforced()) {
    return { error: "Email verification is not required in this environment." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to resend the confirmation email." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!user) return { error: "Account not found." };
  if (user.emailVerified) {
    return { error: "Your email is already confirmed." };
  }

  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest && Date.now() - latest.createdAt.getTime() < MIN_RESEND_MS) {
    return { error: "Please wait a minute before requesting another email." };
  }

  const rawPath = String(formData.get("redirectPath") ?? "");
  const redirectPath = sanitizeEmailVerificationRedirect(rawPath || "/account");

  const { rawToken } = await createEmailVerificationToken({
    userId: user.id,
    redirectPath,
  });

  const sent = await sendEmailVerificationMessage({ to: user.email, rawToken });
  if (!sent.ok) {
    return { error: "Could not send email. Try again later." };
  }

  return { ok: true };
}
