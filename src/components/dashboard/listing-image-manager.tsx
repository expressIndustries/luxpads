"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteListingImage, setHighlightListingImage } from "@/lib/actions/listing-actions";
import { Button } from "@/components/ui/button";

type Row = { id: string; url: string; sortOrder: number };

export function ListingImageManager({ listingId, images }: { listingId: string; images: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [highlightingId, setHighlightingId] = useState<string | null>(null);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;
    const files = Array.from(list);
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("listingId", listingId);
    for (const file of files) {
      fd.append("file", file);
    }
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Upload failed");
      return;
    }
    router.refresh();
    e.target.value = "";
  }

  async function remove(id: string) {
    setError(null);
    try {
      await deleteListingImage(id, listingId);
      router.refresh();
    } catch {
      setError("Could not delete image.");
    }
  }

  async function makeCover(imageId: string) {
    setError(null);
    setHighlightingId(imageId);
    try {
      await setHighlightListingImage(imageId, listingId);
      router.refresh();
    } catch {
      setError("Could not update cover photo.");
    } finally {
      setHighlightingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-stone-900">Photos</p>
        <p className="text-xs text-stone-500">
          The first photo is the cover (hero on the listing and in search). Click any other photo to make it the cover.
          You can select several images at once. JPEG, PNG, WebP, or GIF. When{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">AWS_BUCKET</code> and region are set, new
          uploads go to S3 under <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">listing-images/</code>;
          otherwise files stay under <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">/uploads</code>.
        </p>
        <label className="mt-3 inline-flex cursor-pointer rounded-full border border-stone-200 bg-white px-4 py-2 text-sm hover:border-stone-300">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            disabled={uploading}
            onChange={onFile}
          />
          {uploading ? "Uploading…" : "Upload images"}
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {sorted.map((img, index) => {
          const isCover = index === 0;
          const busy = highlightingId === img.id;
          return (
            <div
              key={img.id}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-stone-100 ${
                isCover ? "border-amber-400 ring-2 ring-amber-200" : "border-stone-200"
              }`}
            >
              <Image src={img.url} alt="" fill unoptimized className="pointer-events-none object-cover" sizes="200px" />
              {isCover ? (
                <div className="pointer-events-none absolute left-2 top-2 z-[1] rounded-full bg-amber-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Cover
                </div>
              ) : (
                <button
                  type="button"
                  disabled={busy || highlightingId !== null}
                  onClick={() => void makeCover(img.id)}
                  className="absolute inset-0 z-0 flex flex-col items-stretch justify-end bg-stone-950/0 pb-11 transition hover:bg-stone-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-600 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Set as cover photo"
                >
                  <span className="mx-auto mb-1 rounded-full bg-stone-900/75 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm group-hover:bg-stone-900/90">
                    {busy ? "Updating…" : "Set as cover"}
                  </span>
                </button>
              )}
              <Button
                type="button"
                variant="danger"
                className="absolute bottom-2 right-2 z-10 !px-2 !py-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  void remove(img.id);
                }}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
