"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function turnstileConfigured(): boolean {
  return Boolean(siteKey?.trim());
}

type Props = {
  onToken: (token: string | null) => void;
  /** Distinct Turnstile analytics if you use one widget per action in Cloudflare dashboard */
  action?: string;
};

/**
 * Cloudflare Turnstile (managed / interactive challenge). Requires matching server `TURNSTILE_SECRET_KEY`.
 */
export function TurnstileField({ onToken, action }: Props) {
  if (!siteKey?.trim()) {
    return (
      <p className="text-xs text-stone-500">
        Bot protection is not configured in this environment (no site key).
      </p>
    );
  }

  return (
    <div className="min-h-[65px]">
      <Turnstile
        siteKey={siteKey}
        options={{
          theme: "auto",
          size: "normal",
          action,
        }}
        onSuccess={(token) => onToken(token)}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    </div>
  );
}
