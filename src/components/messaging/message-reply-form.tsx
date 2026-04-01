"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { MessageActionState } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const initial: MessageActionState = {};

function SubmitRow({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="sm:w-auto">
      {pending ? "Sending…" : label}
    </Button>
  );
}

type Props = {
  conversationId: string;
  action: (prev: MessageActionState, formData: FormData) => Promise<MessageActionState>;
  submitLabel?: string;
};

export function MessageReplyForm({ conversationId, action, submitLabel = "Send reply" }: Props) {
  const [state, formAction] = useFormState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      <div className="space-y-2">
        <Label htmlFor={`reply-${conversationId}`}>Your message</Label>
        <Textarea
          id={`reply-${conversationId}`}
          name="body"
          required
          rows={4}
          minLength={1}
          maxLength={8000}
          placeholder="Write a reply…"
          className="min-h-[100px] resize-y bg-white"
        />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Message sent.</p> : null}
      <SubmitRow label={submitLabel} />
    </form>
  );
}
