"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button type="button" variant="primary" className="!px-4 !py-2 text-sm" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}
