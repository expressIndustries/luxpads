import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import {
  buildEmailVerifiedRelativePath,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

const COOKIE = "luxpads_post_verify";

/**
 * Exchange one-time post-verify cookie for a session. Implemented as a Route Handler (not RSC) because
 * `signIn` + `redirect()` in a Server Component can throw uncaught errors in production (digest / “page couldn’t load”).
 */
export async function GET(request: Request) {
  const publicBase = publicOriginForServer();

  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE)?.value;
    const url = new URL(request.url);
    const path = sanitizeEmailVerificationRedirect(url.searchParams.get("next") ?? "/account");
    const redirectTo = buildEmailVerifiedRelativePath(path);

    if (!raw?.trim()) {
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
    } catch {
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
      return NextResponse.redirect(new URL("/login?verify=session", publicBase));
    }

    return NextResponse.redirect(new URL(redirectTo, publicBase));
  } catch {
    return NextResponse.redirect(new URL("/login?verify=session", publicBase));
  }
}
