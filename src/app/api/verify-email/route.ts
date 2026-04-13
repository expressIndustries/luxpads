import { NextResponse } from "next/server";
import {
  consumeEmailVerificationToken,
  createPostVerifyLoginToken,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const nextParam = searchParams.get("next");
  const publicBase = publicOriginForServer();

  if (!token?.trim()) {
    return NextResponse.redirect(new URL("/login?verify=missing", publicBase));
  }

  const result = await consumeEmailVerificationToken(token);
  if (!result.ok) {
    const q = result.reason === "expired" ? "expired" : "invalid";
    return NextResponse.redirect(new URL(`/login?verify=${q}`, publicBase));
  }

  const path = sanitizeEmailVerificationRedirect(result.redirectPath ?? nextParam);
  const rawLogin = await createPostVerifyLoginToken(result.userId);

  const handoff = new URL("/auth/post-verify", publicBase);
  handoff.searchParams.set("next", path);

  const res = NextResponse.redirect(handoff);
  res.cookies.set({
    name: "luxpads_post_verify",
    value: rawLogin,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/auth/post-verify",
  });
  return res;
}
