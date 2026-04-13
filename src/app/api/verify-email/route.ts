import { NextResponse } from "next/server";
import { publicOriginForServer } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Legacy links used `?token=` on this API route. A GET still cannot consume the token (scanners).
 * This response only runs JavaScript in a real browser to move the secret into a URL hash and open
 * `/verify-email`, which POSTs to `/api/verify-email/complete`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const next = searchParams.get("next")?.trim();
  const publicBase = publicOriginForServer();

  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=missing", publicBase));
  }

  const tokenJson = JSON.stringify(token);
  const nextJson = next ? JSON.stringify(next) : "null";
  const prefix = JSON.stringify(`${publicBase}/verify-email#`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>LuxPads — Confirm email</title>
</head>
<body>
  <p>Continuing to email confirmation…</p>
  <noscript>
    <p>JavaScript is required to confirm your email.
    <a href="${escapeHtmlAttr(`${publicBase}/login?verify=missing`)}">Sign in</a> and resend the confirmation email if needed.</p>
  </noscript>
  <script>
(function(){
  var t=${tokenJson};
  var n=${nextJson};
  var sp=new URLSearchParams();
  sp.set("t",t);
  if(n){sp.set("n",n);}
  location.replace(${prefix}+sp.toString());
})();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
