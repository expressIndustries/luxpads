import { NextResponse } from "next/server";
import { respondToEmailVerificationRequest } from "@/lib/email-verify-completion";
import { publicOriginForServer } from "@/lib/seo";

/** Legacy and plain links: do not consume the token (GET). Email scanners prefetch GET; consumption is POST-only. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next");
  const publicBase = publicOriginForServer();

  if (!token?.trim()) {
    return NextResponse.redirect(new URL("/login?verify=missing", publicBase));
  }

  const confirm = new URL("/auth/confirm-email", publicBase);
  confirm.searchParams.set("token", token.trim());
  if (next?.trim()) {
    confirm.searchParams.set("next", next.trim());
  }
  return NextResponse.redirect(confirm);
}

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  let token: string | null = null;
  let next: string | null = null;

  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const fd = await request.formData();
    const t = fd.get("token");
    const n = fd.get("next");
    token = typeof t === "string" ? t : null;
    next = typeof n === "string" ? n : null;
  }

  return respondToEmailVerificationRequest(token, next);
}
