import { prisma } from "@/lib/prisma";
import {
  buildEmailVerifiedRelativePath,
  consumeEmailVerificationToken,
  createPostVerifyLoginToken,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

/** Primary handoff URL; `/auth/post-verify` remains supported for older links. */
const HANDOFF_URL_PATH = "/api/verify-callback";

export type CompleteEmailVerificationResult =
  | { ok: false; code: "missing" | "invalid" | "expired" }
  | { ok: true; redirectUrl: string; postVerifyCookie: string };

/**
 * Verifies email (consumes one-time token) and prepares auto sign-in handoff.
 * Caller must set the post-verify cookie and return `redirectUrl` to the browser (e.g. JSON + Set-Cookie).
 */
export async function completeEmailVerification(
  tokenRaw: string | null | undefined,
  nextParam: string | null | undefined,
): Promise<CompleteEmailVerificationResult> {
  const publicBase = publicOriginForServer();
  const token =
    typeof tokenRaw === "string"
      ? tokenRaw.trim().replace(/\u200b/g, "").replace(/\u00a0/g, "")
      : "";
  if (!token) {
    return { ok: false, code: "missing" };
  }

  const result = await consumeEmailVerificationToken(token);
  if (!result.ok) {
    return { ok: false, code: result.reason };
  }

  const fallback = sanitizeEmailVerificationRedirect(result.redirectPath ?? nextParam ?? null);

  const urow = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { welcomeCompletedAt: true },
  });

  let nextPath: string;
  if (!urow?.welcomeCompletedAt) {
    const u = new URL("/welcome", "https://placeholder.invalid");
    u.searchParams.set("email_verified", "1");
    if (fallback.startsWith("/listing/")) {
      u.searchParams.set("dest", fallback);
    }
    nextPath = `${u.pathname}${u.search}`;
  } else {
    nextPath = buildEmailVerifiedRelativePath(fallback);
  }

  let rawLogin: string;
  try {
    rawLogin = await createPostVerifyLoginToken(result.userId);
  } catch {
    const dest = new URL("/login", publicBase);
    dest.searchParams.set("verify", "confirmed");
    return { ok: true, redirectUrl: dest.toString(), postVerifyCookie: "" };
  }

  const handoff = new URL(HANDOFF_URL_PATH, publicBase);
  handoff.searchParams.set("next", nextPath);

  return { ok: true, redirectUrl: handoff.toString(), postVerifyCookie: rawLogin };
}
