"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const verifyMessages: Record<string, string> = {
  expired: "That confirmation link has expired. Sign in and use “Resend confirmation email” on the listing.",
  invalid: "That confirmation link is not valid. Try signing up again or resend from the listing page.",
  missing: "Missing confirmation link. Open the link from your email, or sign in and resend the confirmation.",
  session:
    "We could not finish signing you in from that link. Sign in with your password below, or open the confirmation link from your email again.",
  confirmed:
    "Your email is confirmed. Sign in with the password you used when you created your account.",
};

function safeCallbackPath(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = safeCallbackPath(search.get("callbackUrl") ?? "/dashboard");
  const verify = search.get("verify");
  const verifyHint = verify && verifyMessages[verify] ? verifyMessages[verify] : null;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {verifyHint ? <p className="text-sm text-amber-800">{verifyHint}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-stone-600">
        New here?{" "}
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
