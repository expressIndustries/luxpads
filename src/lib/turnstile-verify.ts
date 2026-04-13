import { headers } from "next/headers";

/** Best-effort client IP for Turnstile `remoteip`. */
export async function getRequestIp(): Promise<string | undefined> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || undefined;
  return h.get("x-real-ip") ?? undefined;
}

/**
 * Cloudflare Turnstile server-side verification.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * If `TURNSTILE_SECRET_KEY` is unset, verification is skipped (local dev). Set both
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in production to enforce.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteip?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: true };
  }
  const t = typeof token === "string" ? token.trim() : "";
  if (!t) {
    console.error("[turnstile] missing_token", { hasSecret: Boolean(secret) });
    return { ok: false, error: "Please complete the security check." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", t);
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success === true) {
      return { ok: true };
    }
    const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
    console.error("[turnstile] siteverify_failed", {
      success: data.success,
      errorCodes,
      httpStatus: res.status,
      remoteipPresent: Boolean(remoteip),
    });
    return { ok: false, error: "Security check failed. Please try again." };
  } catch (e) {
    console.error("[turnstile] siteverify_exception", {
      message: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: "Security check failed. Please try again." };
  }
}
