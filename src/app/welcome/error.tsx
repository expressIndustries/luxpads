"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function WelcomeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[welcome] page_error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-serif text-2xl text-stone-900">Something went wrong</h1>
      <p className="text-muted-foreground mt-3 text-sm">
        We could not load the account setup screen. Try again, or sign in and open{" "}
        <span className="font-medium text-stone-800">/welcome</span> from your browser.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900"
          onClick={() => reset()}
        >
          Try again
        </button>
        <Link
          href="/login?welcome=retry&callbackUrl=/welcome"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
