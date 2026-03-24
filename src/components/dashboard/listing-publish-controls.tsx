"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishListing, unpublishListing } from "@/lib/actions/listing-actions";
import { Button } from "@/components/ui/button";
import { ListingStatus } from "@prisma/client";

export function ListingPublishControls({
  listingId,
  status,
}: {
  listingId: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function publish() {
    setPending(true);
    setMsg(null);
    const r = await publishListing(listingId);
    setPending(false);
    if (r.error) setMsg(r.error);
    else setMsg("Status updated.");
    router.refresh();
  }

  async function unpublish() {
    setPending(true);
    setMsg(null);
    const r = await unpublishListing(listingId);
    setPending(false);
    if ("error" in r && r.error) setMsg(r.error);
    else setMsg("Listing moved to draft.");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
      <p className="text-sm font-medium text-stone-900">Publishing</p>
      <p className="mt-1 text-xs text-stone-600">
        {status === ListingStatus.pending_review
          ? "Awaiting admin approval before going live."
          : status === ListingStatus.published
            ? "Live on the marketplace (membership must stay active)."
            : "Drafts are private until you publish."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {status !== ListingStatus.published ? (
          <Button type="button" disabled={pending} onClick={publish}>
            {status === ListingStatus.pending_review ? "Resubmit" : "Publish"}
          </Button>
        ) : (
          <Button type="button" variant="secondary" disabled={pending} onClick={unpublish}>
            Unpublish
          </Button>
        )}
      </div>
      {msg ? <p className="mt-3 text-xs text-stone-600">{msg}</p> : null}
    </div>
  );
}
