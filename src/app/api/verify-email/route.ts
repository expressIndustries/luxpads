import { respondToEmailVerificationRequest } from "@/lib/email-verify-completion";

/** Single-click from email: consume token, set handoff cookie, redirect to `/api/verify-callback`. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next");
  return respondToEmailVerificationRequest(token, next);
}
