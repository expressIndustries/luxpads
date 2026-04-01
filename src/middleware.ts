import { auth } from "@/auth";

export default auth((req) => {
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
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account", "/account/:path*"],
};
