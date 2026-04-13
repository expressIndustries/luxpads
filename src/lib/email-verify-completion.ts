import { NextResponse } from "next/server";
import {
  consumeEmailVerificationToken,
  createPostVerifyLoginToken,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

const COOKIE = "luxpads_post_verify";

/**
 * Consumes the email verification token, marks the user verified, then either
 * hands off to post-verify (auto sign-in) or sends the user to login if that step fails.
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

  const path = sanitizeEmailVerificationRedirect(result.redirectPath ?? nextParam ?? null);

  let rawLogin: string;
  try {
    rawLogin = await createPostVerifyLoginToken(result.userId);
  } catch {
    const dest = new URL("/login", publicBase);
    dest.searchParams.set("verify", "confirmed");
    return NextResponse.redirect(dest);
  }

  const handoff = new URL("/auth/post-verify", publicBase);
  handoff.searchParams.set("next", path);

  const res = NextResponse.redirect(handoff);
  res.cookies.set({
    name: COOKIE,
    value: rawLogin,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/auth/post-verify",
  });
  return res;
}
