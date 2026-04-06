"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteListing } from "@/lib/actions/listing-actions";
import { Button } from "@/components/ui/button";

export function ListingDeleteControls({
  listingId,
  listingTitle,
  redirectAfterDelete,
}: {
  listingId: string;
  listingTitle: string;
  redirectAfterDelete: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phrase, setPhrase] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canDelete = phrase === "DELETE";

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    function onClose() {
      setPhrase("");
      setMsg(null);
    }
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  function open() {
    setMsg(null);
    dialogRef.current?.showModal();
  }

  function dismiss() {
    dialogRef.current?.close();
  }

  async function onDelete() {
    if (!canDelete) return;
    setPending(true);
    setMsg(null);
    const r = await deleteListing(listingId, phrase);
    setPending(false);
    if (r.error) {
      setMsg(r.error);
      return;
    }
    dismiss();
    router.push(redirectAfterDelete);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="text-xs text-stone-400 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-600 hover:decoration-stone-400"
      >
        Delete listing
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,28rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-xl backdrop:bg-stone-900/40"
        aria-labelledby="delete-listing-title"
      >
        <h2 id="delete-listing-title" className="font-serif text-lg text-stone-900">
          Delete this listing?
        </h2>
        <div className="mt-3 space-y-2 text-sm text-stone-600">
          <p>
            This permanently removes{' '}
            <span className="font-medium text-stone-800">&quot;{listingTitle}&quot;</span> and related data: photos,
            availability, amenities links, and message threads tied to this listing.
          </p>
          <p className="text-stone-500">
            You cannot undo this. Consider unpublishing instead if you only want to hide it.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div className="space-y-1">
            <label htmlFor="delete-confirm" className="text-xs font-medium text-stone-700">
              Type <span className="font-mono">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
              placeholder="DELETE"
            />
          </div>
          {msg ? <p className="text-xs text-red-600">{msg}</p> : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="danger" disabled={!canDelete || pending} onClick={() => void onDelete()}>
              {pending ? "Deleting…" : "Permanently delete"}
            </Button>
            <Button type="button" variant="secondary" disabled={pending} onClick={dismiss}>
              Cancel
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
