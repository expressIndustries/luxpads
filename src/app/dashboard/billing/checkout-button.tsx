"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setPending(true);
    setMsg(null);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setMsg(data.error ?? "Checkout unavailable");
      return;
    }
    if (data.url) {
      window.location.href = data.url as string;
    }
  }

  return (
    <div>
      <Button type="button" disabled={pending} onClick={start}>
        {pending ? "Redirecting…" : "Start Stripe checkout"}
      </Button>
      {msg ? <p className="mt-3 text-sm text-amber-800">{msg}</p> : null}
    </div>
  );
}
