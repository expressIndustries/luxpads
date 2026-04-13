import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import {
  buildEmailVerifiedRelativePath,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

export const POST_VERIFY_COOKIE = "luxpads_post_verify";

function redirectTargetFromNextParam(raw: string | null): string {
  const t = raw?.trim() ?? "";
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("\n") || t.includes("\0")) {
    return buildEmailVerifiedRelativePath("/account");
  }
  if (t.startsWith("/welcome")) {
    return t.slice(0, 2048);
  }
  const pathOnly = t.split("?")[0] ?? "";
  const sanitized = sanitizeEmailVerificationRedirect(pathOnly);
  return buildEmailVerifiedRelativePath(sanitized);
}

function logHandoff(event: string, detail?: Record<string, string | boolean | undefined>) {
  const line = `[luxpads:verify-handoff] ${event}`;
  if (detail && Object.keys(detail).length > 0) {
    console.warn(line, detail);
  } else {
    console.warn(line);
  }
}

/**
 * Exchanges short-lived post-verify cookie for a session. Shared by `/api/verify-callback`
 * and legacy `/auth/post-verify` (older deploys + cookie path quirks).
 */
export async function handlePostVerifyCookieHandoff(request: Request): Promise<NextResponse> {
  const publicBase = publicOriginForServer();
  const url = new URL(request.url);

  try {
    const jar = await cookies();
    const raw = jar.get(POST_VERIFY_COOKIE)?.value;
    const redirectTo = redirectTargetFromNextParam(url.searchParams.get("next"));

    if (!raw?.trim()) {
      logHandoff("missing_cookie", {
        path: url.pathname,
        method: request.method,
        hasNext: Boolean(url.searchParams.get("next")),
      });
      return NextResponse.redirect(new URL("/login?verify=session", publicBase));
    }

    let loc = "";
    try {
      const returned = await signIn("credentials", {
        postVerifyToken: raw.trim(),
        redirectTo,
        redirect: false,
      });
      loc = typeof returned === "string" ? returned : "";
    } catch (e) {
      logHandoff("signIn_threw", {
        path: url.pathname,
        message: e instanceof Error ? e.message.slice(0, 200) : "unknown",
      });
      return NextResponse.redirect(new URL("/login?verify=session", publicBase));
    }

    let failed = !loc.trim();
    if (!failed) {
      try {
        failed = Boolean(new URL(loc, publicBase).searchParams.get("error"));
      } catch {
        failed = true;
      }
    }
    if (failed) {
      logHandoff("signIn_failed", {
        path: url.pathname,
        locationPrefix: loc.slice(0, 120),
      });
      return NextResponse.redirect(new URL("/login?verify=session", publicBase));
    }

    return NextResponse.redirect(new URL(redirectTo, publicBase));
  } catch (e) {
    logHandoff("unexpected_error", {
      path: url.pathname,
      message: e instanceof Error ? e.message.slice(0, 200) : "unknown",
    });
    return NextResponse.redirect(new URL("/login?verify=session", publicBase));
  }
}
