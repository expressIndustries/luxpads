import { NextResponse } from "next/server";
import { consumeEmailVerificationToken, sanitizeEmailVerificationRedirect } from "@/lib/email-verification";
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
  const dest = new URL(path, publicBase);
  dest.searchParams.set("email_verified", "1");
  if (path.startsWith("/listing/")) {
    dest.searchParams.set("contact_flow", "1");
  }
  return NextResponse.redirect(dest);
}
