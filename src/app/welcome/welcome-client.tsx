"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeWelcome } from "@/lib/actions/welcome";

type Props = {
  dest: string | null;
  emailVerifiedBanner: boolean;
};

export function WelcomeClient({ dest, emailVerifiedBanner }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <>
      {emailVerifiedBanner ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Your email is confirmed. Continue to browse listings and message homeowners.
        </div>
      ) : null}
      <h1 className="font-serif text-3xl text-stone-900">Welcome to LuxPads</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        You can search homes, save favorites, and message owners directly. To list a property you need a separate owner
        account—use a different email address after{" "}
        <a href="/owners" className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4">
          For owners
        </a>
        .
      </p>
      <div className="mt-10">
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={() => startTransition(() => completeWelcome(dest))}
        >
          {pending ? "Continuing…" : "Continue"}
        </Button>
      </div>
    </>
  );
}
