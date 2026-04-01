"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (status !== "authenticated" || !session?.user?.isImpersonating) {
    return null;
  }

  const label =
    session.user.name?.trim() ||
    session.user.email ||
    "this owner";

  async function returnToAdmin() {
    setPending(true);
    try {
      await update({ action: "stopImpersonation" });
      router.refresh();
      router.push("/admin");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="relative z-[100] border-b border-amber-900/25 bg-[#d4af37] px-4 py-2.5 text-stone-950 shadow-sm"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 sm:px-6 lg:px-8">
        <p className="text-sm font-medium">
          Logged in as <span className="font-semibold">{label}</span>
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          className="border-stone-800/30 bg-stone-950 text-amber-50 hover:bg-stone-900 hover:text-white"
          onClick={() => void returnToAdmin()}
        >
          {pending ? "Returning…" : "Return to Admin"}
        </Button>
      </div>
    </div>
  );
}
