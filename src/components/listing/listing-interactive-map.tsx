"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { offsetViewportCenter } from "@/lib/maps/approximate-area";
import { GOOGLE_MAP_CUSTOM_STYLES, GOOGLE_MAP_PIN_ICON_URL } from "@/lib/maps/google-map-styles";

const CIRCLE_RADIUS_M = 0.15 * 1609.34;

type Props = {
  lat: number;
  lng: number;
  mapSalt?: string | null;
  apiKey: string;
  label?: string;
  mapsSearchQuery?: string | null;
};

export function ListingInteractiveMap({
  lat,
  lng,
  mapSalt,
  apiKey,
  label = "Approximate Location",
  mapsSearchQuery,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const viewCenter = mapSalt?.trim()
    ? offsetViewportCenter(lat, lng, mapSalt.trim())
    : { lat, lng };

  useEffect(() => {
    if (!scriptReady || !containerRef.current) return;
    const g = window.google?.maps;
    if (!g) return;

    let cancelled = false;
    const el = containerRef.current;

    (async () => {
      const { Map } = (await g.importLibrary("maps")) as google.maps.MapsLibrary;
      if (cancelled || !el) return;

      const map = new Map(el, {
        zoom: 14,
        center: { lat: viewCenter.lat, lng: viewCenter.lng },
        disableDefaultUI: true,
        zoomControl: true,
        styles: GOOGLE_MAP_CUSTOM_STYLES as google.maps.MapTypeStyle[],
      });

      if (mapSalt?.trim()) {
        new g.Circle({
          map,
          center: { lat, lng },
          radius: CIRCLE_RADIUS_M,
          fillColor: "#FF0000",
          fillOpacity: 0.28,
          strokeColor: "#FF0000",
          strokeWeight: 2,
        });
      }

      new g.Marker({
        position: { lat, lng },
        map,
        icon: {
          url: GOOGLE_MAP_PIN_ICON_URL,
          scaledSize: new g.Size(20, 24),
        },
      });
    })();

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [scriptReady, lat, lng, mapSalt, viewCenter.lat, viewCenter.lng]);

  const openQuery = mapsSearchQuery?.trim() || `${lat},${lng}`;
  const openHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openQuery)}`;

  return (
    <figure className="space-y-2">
      <p className="text-sm font-medium text-stone-900">{label}</p>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`}
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className="aspect-[16/9] min-h-[220px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm"
        aria-label={label}
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <span>Map data © Google</span>
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-900 underline-offset-2 hover:underline"
        >
          Open in Google Maps
        </a>
      </figcaption>
    </figure>
  );
}
