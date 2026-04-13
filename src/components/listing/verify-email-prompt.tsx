"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resendVerificationEmail, type ResendVerificationState } from "@/lib/actions/resend-verification";
import { Button } from "@/components/ui/button";

const initial: ResendVerificationState = {};

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" className="rounded-full text-sm" disabled={pending}>
      {pending ? "Sending…" : "Resend confirmation email"}
    </Button>
  );
}

export function VerifyEmailPrompt({ email, redirectPath }: { email: string; redirectPath: string }) {
  const [state, formAction] = useFormState(resendVerificationEmail, initial);

  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-950">
      <p className="font-medium">Confirm your email to message this owner</p>
      <p className="text-amber-900/90">
        We sent a confirmation link to <span className="font-medium">{email}</span>. Open it on this device or any
        device; you will return here ready to send your inquiry.
      </p>
      {state.ok ? <p className="text-emerald-800">Another confirmation email is on its way.</p> : null}
      {state.error ? <p className="text-red-600">{state.error}</p> : null}
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="redirectPath" value={redirectPath} />
        <ResendButton />
      </form>
    </div>
  );
}
