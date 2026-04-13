import { NextResponse } from "next/server";
import { respondToEmailVerificationRequest } from "@/lib/email-verify-completion";
import { publicOriginForServer } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * In-browser POST bridge. Email scanners typically GET the link but do not submit this form,
 * so the one-time token is not consumed until the user's browser runs (or they use noscript).
 */
function verifyEmailAutoPostHtml(token: string, nextParam: string | null): string {
  const nextStr = nextParam?.trim() || "";
  const nextJs = nextStr ? JSON.stringify(nextStr) : "null";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>LuxPads — Confirm email</title>
</head>
<body>
  <p>Confirming your email…</p>
  <noscript>
    <p>Enable JavaScript or tap the button to finish.</p>
    <form method="post" action="/api/verify-email">
      <input type="hidden" name="token" value="${escapeHtmlAttr(token)}"/>
      ${nextStr ? `<input type="hidden" name="next" value="${escapeHtmlAttr(nextStr)}"/>` : ""}
      <button type="submit">Confirm email</button>
    </form>
  </noscript>
  <script>
(function(){
  var t=${JSON.stringify(token)};
  var n=${nextJs};
  var f=document.createElement("form");
  f.method="POST";
  f.action="/api/verify-email";
  var a=document.createElement("input");
  a.name="token";
  a.value=t;
  f.appendChild(a);
  if(n){
    var b=document.createElement("input");
    b.name="next";
    b.value=n;
    f.appendChild(b);
  }
  document.body.appendChild(f);
  f.submit();
})();
  </script>
</body>
</html>`;
}

/**
 * Does NOT consume the token (GET is often prefetched by mail security scanners).
 * Returns HTML that POSTs to this same path, which performs verification.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const next = searchParams.get("next");
  const publicBase = publicOriginForServer();

  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=missing", publicBase));
  }

  const html = verifyEmailAutoPostHtml(token, next);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
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
