"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/actions/change-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ChangePasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

export function ChangePasswordForm({ disabledReason }: { disabledReason?: string | null }) {
  const [state, formAction] = useFormState(changePassword, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (disabledReason) {
    return <p className="text-sm text-stone-600">{disabledReason}</p>;
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(fe.currentPassword)}
        />
        {fe.currentPassword ? <p className="text-sm text-red-600">{fe.currentPassword}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={Boolean(fe.newPassword)}
        />
        {fe.newPassword ? <p className="text-sm text-red-600">{fe.newPassword}</p> : null}
        <p className="text-xs text-stone-500">At least 8 characters.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={Boolean(fe.confirmPassword)}
        />
        {fe.confirmPassword ? <p className="text-sm text-red-600">{fe.confirmPassword}</p> : null}
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status">
          Your password was updated. Use it the next time you sign in.
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
