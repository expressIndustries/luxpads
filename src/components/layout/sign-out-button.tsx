"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="primary"
      className="!px-4 !py-2 text-sm"
      onClick={() => {
        // Relative path; auth `redirect` callback resolves against AUTH_URL / NEXT_PUBLIC_APP_URL when set
        void signOut({ callbackUrl: "/" });
      }}
    >
      Sign out
    </Button>
  );
}
