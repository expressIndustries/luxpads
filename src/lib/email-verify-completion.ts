import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildEmailVerifiedRelativePath,
  consumeEmailVerificationToken,
  createPostVerifyLoginToken,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";
import { POST_VERIFY_COOKIE } from "@/lib/verify-handoff-handler";

/** Primary handoff URL; `/auth/post-verify` remains supported for older links. */
const HANDOFF_URL_PATH = "/api/verify-callback";

/**
 * Consumes the email verification token, marks the user verified, then either
 * hands off to verify-callback (auto sign-in) or sends the user to login if that step fails.
 */
export async function respondToEmailVerificationRequest(
  tokenRaw: string | null | undefined,
  nextParam: string | null | undefined,
): Promise<NextResponse> {
  const publicBase = publicOriginForServer();
  const token =
    typeof tokenRaw === "string"
      ? tokenRaw.trim().replace(/\u200b/g, "").replace(/\u00a0/g, "")
      : "";
  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=missing", publicBase));
  }

  const result = await consumeEmailVerificationToken(token);
  if (!result.ok) {
    const q = result.reason === "expired" ? "expired" : "invalid";
    return NextResponse.redirect(new URL(`/login?verify=${q}`, publicBase));
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
    return NextResponse.redirect(dest);
  }

  const handoff = new URL(HANDOFF_URL_PATH, publicBase);
  handoff.searchParams.set("next", nextPath);

  const res = NextResponse.redirect(handoff);
  // path: '/' so the cookie is also sent to legacy `/auth/post-verify` redirects (avoids silent login failure + 405 confusion).
  res.cookies.set({
    name: POST_VERIFY_COOKIE,
    value: rawLogin,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
