import type { Metadata } from "next";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Confirm email",
  robots: { index: false, follow: false },
};

/**
 * Email links point here with `#t=<token>` (fragment is not sent to the server, so link scanners
 * cannot burn the token). The client POSTs the token to `/api/verify-email/complete`.
 */
export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
