import { createHmac, timingSafeEqual } from "crypto";

const MAX_SKEW_SEC = 15 * 60;

/**
 * Mailgun webhook signing: HMAC-SHA256(signingKey, timestamp + token) === signature (hex).
 * @see https://documentation.mailgun.com/docs/mailgun/user-manual/webhooks/securing-webhooks
 */
export function verifyMailgunWebhookSignature(params: {
  signingKey: string;
  timestamp: string;
  token: string;
  signature: string;
}): boolean {
  const ts = Number(params.timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_SKEW_SEC) return false;

  const encoded = createHmac("sha256", params.signingKey)
    .update(params.timestamp.concat(params.token))
    .digest("hex");

  try {
    const a = Buffer.from(encoded, "hex");
    const b = Buffer.from(params.signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
