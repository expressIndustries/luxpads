import { handlePostVerifyCookieHandoff } from "@/lib/verify-handoff-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePostVerifyCookieHandoff(request);
}
