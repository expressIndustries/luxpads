"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileField, turnstileConfigured } from "@/components/security/turnstile-field";
import { gaEvent } from "@/lib/gtag";

function safeInternalPath(raw: string | null): string {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function SignupForm({ fromContact = false }: { fromContact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const callbackUrl = safeInternalPath(searchParams.get("callbackUrl"));
  const contactFlow = fromContact || searchParams.get("contact") === "1";
  const accountType = contactFlow ? "renter" : "owner";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (turnstileConfigured() && !turnstileToken?.trim()) {
      setError("Please complete the security check.");
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    if (turnstileToken?.trim()) {
      fd.set("cf-turnstile-response", turnstileToken);
    }
    const res = await registerUser({}, fd);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    gaEvent("sign_up", {
      method: "email",
      flow: contactFlow ? "contact_owner" : "organic",
    });
    const sign = await signIn("credentials", { email, password, redirect: false });
    if (sign?.error) {
      setError("Account created but sign-in failed. Try logging in.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="accountType" value={accountType} />
      <input type="hidden" name="redirectPath" value={callbackUrl} />
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
        <p className="text-xs text-stone-500">At least 8 characters.</p>
      </div>
      <p className="text-xs text-stone-600">
        {contactFlow
          ? "We will email you a confirmation link before you can contact the owner."
          : "Signing up is free. When email delivery is enabled, we send a quick confirmation link before you can message owners."}
      </p>
      <TurnstileField action="signup" onToken={setTurnstileToken} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
