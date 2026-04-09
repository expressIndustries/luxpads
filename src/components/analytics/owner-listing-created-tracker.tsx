"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { gaEvent } from "@/lib/gtag";

/**
 * One-shot GA4 event after server redirects from /dashboard/listings/new with query flags; strips them from the URL.
 */
export function OwnerListingCreatedTracker({
  listingId,
  enabled,
  isFirstListing,
}: {
  listingId: string;
  enabled: boolean;
  isFirstListing: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (!enabled || fired.current) return;
    fired.current = true;
    gaEvent("owner_create_listing", {
      listing_id: listingId,
      first_listing: isFirstListing,
    });
    const next = new URLSearchParams(searchParams.toString());
    next.delete("owner_listing_created");
    next.delete("first");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [enabled, isFirstListing, listingId, pathname, router, searchParams]);

  return null;
}
