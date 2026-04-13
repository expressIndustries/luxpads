"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Phase = "working" | "bad_link" | "failed";

const failCopy: Record<string, string> = {
  invalid:
    "This confirmation link is not valid anymore. Sign in and resend the confirmation email from the listing or your account.",
  expired: "This confirmation link has expired. Sign in and resend a new confirmation email.",
  missing: "Something went wrong opening this link. Try signing in and resend the confirmation email.",
};

export function VerifyEmailClient() {
  const [phase, setPhase] = useState<Phase>("working");
  const [failCode, setFailCode] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(raw);
      const token = (params.get("t") ?? params.get("token") ?? "").trim();
      const nextRaw = (params.get("n") ?? "").trim();

      if (!token) {
        setPhase("bad_link");
        return;
      }

      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

      const payload: { token: string; next?: string } = { token };
      if (nextRaw) payload.next = nextRaw;

      void (async () => {
        try {
          const res = await fetch(`${window.location.origin}/api/verify-email/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
            signal: ac.signal,
          });

          const data = (await res.json()) as {
            ok?: boolean;
            redirectUrl?: string;
            code?: string;
          };

          if (!data.ok || typeof data.redirectUrl !== "string" || !data.redirectUrl) {
            setPhase("failed");
            setFailCode(typeof data.code === "string" ? data.code : "invalid");
            return;
          }

          window.location.assign(data.redirectUrl);
        } catch {
          if (ac.signal.aborted) return;
          setPhase("failed");
          setFailCode("network");
        }
      })();
    });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  if (phase === "bad_link") {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Confirm email</h1>
        <p className="text-muted-foreground text-sm">
          Open the confirmation link from your email in this browser. If the link is incomplete, sign in and resend
          verification.
        </p>
        <Link href="/login" className="text-primary text-sm font-medium underline underline-offset-4">
          Sign in
        </Link>
      </div>
    );
  }

  if (phase === "failed") {
    const msg =
      failCode === "network"
        ? "We could not reach the server. Check your connection and try again."
        : failCopy[failCode ?? ""] ?? failCopy.invalid;
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Could not confirm</h1>
        <p className="text-muted-foreground text-sm">{msg}</p>
        <Link href="/login" className="text-primary text-sm font-medium underline underline-offset-4">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Confirming your email…</h1>
      <p className="text-muted-foreground text-sm">One moment.</p>
    </div>
  );
}
