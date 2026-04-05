"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ListingGalleryImage = { id: string; url: string; alt: string | null };

type LightboxContextValue = {
  images: ListingGalleryImage[];
  listingTitle: string;
  openAt: (index: number) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("Listing gallery lightbox components must be used inside ListingGalleryLightboxProvider");
  return ctx;
}

type ProviderProps = {
  images: ListingGalleryImage[];
  listingTitle: string;
  children: ReactNode;
};

export function ListingGalleryLightboxProvider({ images, listingTitle, children }: ProviderProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
      setLightboxOpen(true);
    },
    [images.length],
  );

  const go = useCallback(
    (delta: number) => {
      setActiveIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, go]);

  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const value = useMemo(() => ({ images, listingTitle, openAt }), [images, listingTitle, openAt]);

  const canLightbox = images.length > 0;

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {lightboxOpen && canLightbox ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-stone-950/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          <div
            className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-stone-950/80 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-white/90">
              {activeIndex + 1} <span className="text-white/50">/</span> {images.length}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div
            className="relative z-10 flex min-h-0 flex-1 cursor-default items-center justify-center px-14 py-4 sm:px-16"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70 sm:left-4 sm:p-3"
              aria-label="Previous photo"
            >
              <span className="text-base sm:text-lg" aria-hidden>
                ←
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70 sm:right-4 sm:p-3"
              aria-label="Next photo"
            >
              <span className="text-base sm:text-lg" aria-hidden>
                →
              </span>
            </button>

            <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeIndex]?.url}
                alt={images[activeIndex]?.alt ?? `${listingTitle} — photo ${activeIndex + 1}`}
                className="max-h-[min(78vh,900px)] max-w-full object-contain"
              />
            </div>
          </div>

          <div
            className="relative z-10 shrink-0 border-t border-white/10 bg-stone-950/80 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Scroll or tap a thumbnail
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                    i === activeIndex ? "ring-amber-400" : "ring-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                >
                  <Image src={img.url} alt="" fill unoptimized className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}

export function ListingHeroLightboxTrigger() {
  const { images, openAt } = useLightbox();
  if (images.length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => openAt(0)}
      className="absolute inset-0 z-[1] cursor-zoom-in bg-transparent"
      aria-label={`View photo 1 of ${images.length}`}
    />
  );
}

export function ListingGalleryLightboxGrid() {
  const { images, listingTitle, openAt } = useLightbox();
  if (images.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {images.map((img, i) => (
        <button
          key={img.id}
          type="button"
          onClick={() => openAt(i)}
          className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-stone-100 text-left ring-stone-900/0 transition hover:ring-2 hover:ring-stone-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
          aria-label={`View photo ${i + 1} of ${images.length}`}
        >
          <Image
            src={img.url}
            alt={img.alt ?? listingTitle}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width:1024px) 100vw,50vw"
          />
        </button>
      ))}
    </div>
  );
}
