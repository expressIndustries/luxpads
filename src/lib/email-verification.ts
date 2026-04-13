import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getMailgunEnv } from "@/lib/mailgun/config";

const TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TTL_MS = 48 * 60 * 60 * 1000;

/** When Mailgun is configured, new signups must verify email before certain actions (e.g. inquiries). */
export function isEmailVerificationEnforced(): boolean {
  return getMailgunEnv() !== null;
}

export function hashEmailVerificationToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateEmailVerificationRawToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

/** Safe in-app path only; used after clicking verify link. */
export function sanitizeEmailVerificationRedirect(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "/account";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/account";
  if (t.includes("\n") || t.includes("\0") || t.includes("<")) return "/account";
  const ok =
    t.startsWith("/listing/") || t.startsWith("/account") || t.startsWith("/dashboard") || t === "/";
  if (!ok) return "/account";
  return t.slice(0, 512);
}

export async function createEmailVerificationToken(params: {
  userId: string;
  redirectPath: string | null;
}): Promise<{ rawToken: string }> {
  const rawToken = generateEmailVerificationRawToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: params.userId } }),
    prisma.emailVerificationToken.create({
      data: {
        userId: params.userId,
        tokenHash,
        expiresAt,
        redirectPath: params.redirectPath,
      },
    }),
  ]);

  return { rawToken };
}

export type ConsumeEmailVerificationResult =
  | { ok: true; redirectPath: string | null }
  | { ok: false; reason: "invalid" | "expired" };

export async function consumeEmailVerificationToken(rawToken: string): Promise<ConsumeEmailVerificationResult> {
  const t = rawToken.trim();
  if (!t) return { ok: false, reason: "invalid" };
  const tokenHash = hashEmailVerificationToken(t);

  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerified: true } } },
  });

  if (!row) return { ok: false, reason: "invalid" };
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } });
    return { ok: false, reason: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true, redirectPath: row.redirectPath };
}
