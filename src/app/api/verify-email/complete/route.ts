import { NextResponse } from "next/server";
import { completeEmailVerification } from "@/lib/email-verify-completion";
import { POST_VERIFY_COOKIE } from "@/lib/verify-handoff-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Consumes the email verification token. Called only from the in-app `/verify-email` page via
 * `fetch` (token is carried in the URL hash in the email link, so mail scanners never see it on a GET).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false as const, code: "missing" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false as const, code: "missing" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const token = typeof o.token === "string" ? o.token : null;
  const next = typeof o.next === "string" ? o.next : null;

  const result = await completeEmailVerification(token, next);
  if (!result.ok) {
    const status = result.code === "missing" ? 400 : 410;
    return NextResponse.json({ ok: false as const, code: result.code }, { status });
  }

  const res = NextResponse.json({ ok: true as const, redirectUrl: result.redirectUrl });

  if (result.postVerifyCookie) {
    res.cookies.set({
      name: POST_VERIFY_COOKIE,
      value: result.postVerifyCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });
  }

  return res;
}
