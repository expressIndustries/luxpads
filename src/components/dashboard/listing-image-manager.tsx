"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteListingImage } from "@/lib/actions/listing-actions";
import { Button } from "@/components/ui/button";

type Row = { id: string; url: string; sortOrder: number };

export function ListingImageManager({ listingId, images }: { listingId: string; images: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("listingId", listingId);
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

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-stone-900">Photos</p>
        <p className="text-xs text-stone-500">Upload is stored locally under /public/uploads for dev; swap to S3/Cloudinary later.</p>
        <label className="mt-3 inline-flex cursor-pointer rounded-full border border-stone-200 bg-white px-4 py-2 text-sm hover:border-stone-300">
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={onFile} />
          {uploading ? "Uploading…" : "Upload image"}
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
            <Button
              type="button"
              variant="danger"
              className="absolute bottom-2 right-2 !px-2 !py-1 text-xs"
              onClick={() => remove(img.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
