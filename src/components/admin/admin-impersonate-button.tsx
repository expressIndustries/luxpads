"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { ownerId: string; ownerLabel: string };

export function AdminImpersonateButton({ ownerId, ownerLabel }: Props) {
  const { update } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await update({ action: "impersonate", userId: ownerId });
      router.refresh();
      router.push("/dashboard");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      className="!px-3 !py-1 text-xs"
      onClick={() => void onClick()}
      title={`Open owner hub as ${ownerLabel}`}
    >
      {pending ? "…" : "View as owner"}
    </Button>
  );
}
