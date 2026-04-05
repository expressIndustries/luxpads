"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteListingImage,
  reorderListingImages,
  setHighlightListingImage,
} from "@/lib/actions/listing-actions";
import { Button } from "@/components/ui/button";

type Row = { id: string; url: string; sortOrder: number };

function sortRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

function serverSignature(rows: Row[]): string {
  return sortRows(rows)
    .map((i) => `${i.id}:${i.sortOrder}`)
    .join("|");
}

function DragHandleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-4 w-4" {...props}>
      <circle cx="6" cy="5" r="1.5" />
      <circle cx="14" cy="5" r="1.5" />
      <circle cx="6" cy="10" r="1.5" />
      <circle cx="14" cy="10" r="1.5" />
      <circle cx="6" cy="15" r="1.5" />
      <circle cx="14" cy="15" r="1.5" />
    </svg>
  );
}

function SortableImageCard({
  img,
  isCover,
  reorderLocked,
  highlightBusy,
  highlightingId,
  onMakeCover,
  onRemove,
}: {
  img: Row;
  isCover: boolean;
  reorderLocked: boolean;
  highlightBusy: boolean;
  highlightingId: string | null;
  onMakeCover: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
    disabled: reorderLocked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.92 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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
          disabled={highlightBusy || highlightingId !== null || reorderLocked}
          onClick={() => void onMakeCover(img.id)}
          className="absolute inset-0 z-0 flex flex-col items-stretch justify-end bg-stone-950/0 pb-11 pr-12 pt-10 transition hover:bg-stone-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-600 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Set as cover photo"
        >
          <span className="mx-auto mb-1 rounded-full bg-stone-900/75 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm group-hover:bg-stone-900/90">
            {highlightBusy ? "Updating…" : "Set as cover"}
          </span>
        </button>
      )}
      <button
        type="button"
        className={`absolute right-2 top-2 z-20 flex h-9 w-9 cursor-grab items-center justify-center rounded-lg border border-stone-200/90 bg-white/95 text-stone-600 shadow-sm backdrop-blur-sm touch-none hover:bg-white hover:text-stone-900 active:cursor-grabbing ${
          reorderLocked ? "pointer-events-none opacity-40" : ""
        }`}
        aria-label="Drag to reorder photos"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon />
      </button>
      <Button
        type="button"
        variant="danger"
        className="absolute bottom-2 right-2 z-10 !px-2 !py-1 text-xs"
        disabled={reorderLocked}
        onClick={(e) => {
          e.stopPropagation();
          void onRemove(img.id);
        }}
      >
        Remove
      </Button>
    </div>
  );
}

export function ListingImageManager({ listingId, images }: { listingId: string; images: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [highlightingId, setHighlightingId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState<Row[]>(() => sortRows(images));

  const sig = serverSignature(images);
  useEffect(() => {
    setOrdered(sortRows(images));
  }, [listingId, sig]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderLocked = uploading || orderSaving;
  const sortableIds = ordered.map((i) => i.id);

  async function persistOrder(next: Row[], revertTo: Row[]) {
    setOrderSaving(true);
    setError(null);
    try {
      await reorderListingImages(
        listingId,
        next.map((r) => r.id),
      );
      router.refresh();
    } catch {
      setError("Could not save photo order.");
      setOrdered(revertTo);
    } finally {
      setOrderSaving(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrdered((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      const prev = [...items];
      const next = arrayMove(items, oldIndex, newIndex);
      void persistOrder(next, prev);
      return next;
    });
  }

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
          The first photo is the cover (hero on the listing and in search). Drag the{" "}
          <span className="font-medium text-stone-700">grip</span> (six dots, top-right) to reorder photos. Click
          another photo to make it the cover. You can select several images at once. JPEG, PNG, WebP, or GIF.
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
      {orderSaving ? (
        <p className="text-xs text-stone-500">Saving order…</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ordered.length === 0 ? null : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-3">
              {ordered.map((img, index) => (
                <SortableImageCard
                  key={img.id}
                  img={img}
                  isCover={index === 0}
                  reorderLocked={reorderLocked}
                  highlightBusy={highlightingId === img.id}
                  highlightingId={highlightingId}
                  onMakeCover={makeCover}
                  onRemove={remove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
