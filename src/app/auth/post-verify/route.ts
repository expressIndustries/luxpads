import { handlePostVerifyCookieHandoff } from "@/lib/verify-handoff-handler";

/**
 * Legacy handoff URL from older deploys. Same behavior as `/api/verify-callback`.
 * Cookie must use `path: '/'` in `email-verify-completion` so the browser sends it here too.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePostVerifyCookieHandoff(request);
}

export async function POST(request: Request) {
  return handlePostVerifyCookieHandoff(request);
}
