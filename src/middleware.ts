import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/** Edge-safe: do not import `@/auth` here (it pulls `node:crypto` via email verification). */
export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return Response.redirect(url);
    }
    const role = session.user.role;
    if (role !== "owner" && role !== "admin") {
      return Response.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return Response.redirect(url);
    }
    if (session.user.role !== "admin") {
      return Response.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!session?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return Response.redirect(url);
    }
  }

  // `/welcome` is enforced in `app/welcome/page.tsx` via `auth()` (Node) so we do not duplicate
  // session resolution here (avoids extra work and keeps a single code path after email verify).
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account", "/account/:path*"],
};
