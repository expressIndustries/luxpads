"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { gaEvent } from "@/lib/gtag";

/**
 * Fires GA4 conversion when email verification completes (link from Mailgun).
 * Strips `email_verified` and `contact_flow` from the URL after one shot.
 */
export function EmailVerifiedTracker({ listingSlug }: { listingSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (searchParams.get("email_verified") !== "1" || fired.current) return;
    fired.current = true;
    const fromContact = searchParams.get("contact_flow") === "1";
    gaEvent("renter_email_verified", {
      listing_slug: listingSlug,
      from_contact: fromContact,
    });
    const next = new URLSearchParams(searchParams.toString());
    next.delete("email_verified");
    next.delete("contact_flow");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [listingSlug, pathname, router, searchParams]);

  return null;
}
