import { createHash, randomBytes } from "node:crypto";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMailgunEnv } from "@/lib/mailgun/config";

const TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TTL_MS = 48 * 60 * 60 * 1000;
const POST_VERIFY_LOGIN_TTL_MS = 5 * 60 * 1000;

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

/** Query string to append after verification (used by email link handoff and post-verify redirect). */
export function buildEmailVerifiedRelativePath(sanitizedPath: string): string {
  const dest = new URL(sanitizedPath, "https://placeholder.invalid");
  dest.searchParams.set("email_verified", "1");
  if (sanitizedPath.startsWith("/listing/")) {
    dest.searchParams.set("contact_flow", "1");
  }
  return `${dest.pathname}${dest.search}`;
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
  | { ok: true; redirectPath: string | null; userId: string }
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

  return { ok: true, redirectPath: row.redirectPath, userId: row.userId };
}

/** Opaque one-time token; exchange in Credentials authorize for a session after email verification. */
export async function createPostVerifyLoginToken(userId: string): Promise<string> {
  const rawToken = generateEmailVerificationRawToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + POST_VERIFY_LOGIN_TTL_MS);

  await prisma.$transaction([
    prisma.postVerifyLoginToken.deleteMany({ where: { userId } }),
    prisma.postVerifyLoginToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  return rawToken;
}

export async function consumePostVerifyLoginToken(
  rawToken: string,
): Promise<{ id: string; email: string; name: string | null; role: Role } | null> {
  const t = rawToken.trim();
  if (!t) return null;
  const tokenHash = hashEmailVerificationToken(t);

  const row = await prisma.postVerifyLoginToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.postVerifyLoginToken.delete({ where: { id: row.id } }).catch(() => undefined);
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { id: true, email: true, name: true, role: true, suspended: true, passwordHash: true },
  });
  await prisma.postVerifyLoginToken.delete({ where: { id: row.id } }).catch(() => undefined);
  if (!user?.passwordHash || user.suspended) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
