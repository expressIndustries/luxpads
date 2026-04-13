"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeWelcome, upgradeToOwner } from "@/lib/actions/welcome";

type Props = {
  upgradeOnly: boolean;
  dest: string | null;
  emailVerifiedBanner: boolean;
};

export function WelcomeClient({ upgradeOnly, dest, emailVerifiedBanner }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <>
      {emailVerifiedBanner ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          You are signed in. Choose how you want to use LuxPads to continue.
        </div>
      ) : null}
      <h1 className="font-serif text-3xl text-stone-900">
        {upgradeOnly ? "List your home on LuxPads" : "How will you use LuxPads?"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {upgradeOnly
          ? "Add an owner dashboard to publish and manage your property."
          : "Renters browse and message owners. Hosts get a dashboard to list and manage a home. You can become a host later from the header anytime."}
      </p>
      <div className="mt-10 space-y-4">
        {!upgradeOnly ? (
          <>
            <Button
              type="button"
              variant="secondary"
              className="h-auto min-h-[4.5rem] w-full flex-col items-start gap-1 py-4 text-left"
              disabled={pending}
              onClick={() => startTransition(() => completeWelcome("renter", dest))}
            >
              <span className="text-base font-semibold text-stone-900">I am looking for a place to stay</span>
              <span className="text-xs font-normal text-stone-600">
                Browse listings, save favorites, and message homeowners.
              </span>
            </Button>
            <Button
              type="button"
              className="h-auto min-h-[4.5rem] w-full flex-col items-start gap-1 py-4 text-left"
              disabled={pending}
              onClick={() => startTransition(() => completeWelcome("owner", dest))}
            >
              <span className="text-base font-semibold">I want to list my property</span>
              <span className="text-xs font-normal text-stone-500">
                Publish your home, calendar, and guest messages in the owner dashboard.
              </span>
            </Button>
          </>
        ) : (
          <Button
            type="button"
            className="w-full"
            disabled={pending}
            onClick={() => startTransition(() => upgradeToOwner())}
          >
            Become a host
          </Button>
        )}
      </div>
    </>
  );
}
