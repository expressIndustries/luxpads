"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { offsetViewportCenter, PRIVACY_MAP_DISK_RADIUS_MILES } from "@/lib/maps/approximate-area";
import { GOOGLE_MAP_CUSTOM_STYLES, GOOGLE_MAP_PIN_ICON_URL } from "@/lib/maps/google-map-styles";

const PRIVACY_DISK_RADIUS_M = PRIVACY_MAP_DISK_RADIUS_MILES * 1609.34;

type Props = {
  lat: number;
  lng: number;
  mapSalt?: string | null;
  apiKey: string;
  label?: string;
};

/** Tighter zoom on the offset viewport; exact coords are never pinned (privacy). */
const MAP_ZOOM = 17;

export function ListingInteractiveMap({
  lat,
  lng,
  mapSalt,
  apiKey,
  label = "Approximate Location",
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
        zoom: MAP_ZOOM,
        center: { lat: viewCenter.lat, lng: viewCenter.lng },
        disableDefaultUI: true,
        zoomControl: true,
        styles: GOOGLE_MAP_CUSTOM_STYLES as google.maps.MapTypeStyle[],
      });

      if (mapSalt?.trim()) {
        new g.Circle({
          map,
          center: { lat: viewCenter.lat, lng: viewCenter.lng },
          radius: PRIVACY_DISK_RADIUS_M,
          fillColor: "#FF0000",
          fillOpacity: 0.28,
          strokeColor: "#FF0000",
          strokeWeight: 2,
        });
      } else {
        new g.Marker({
          position: { lat, lng },
          map,
          icon: {
            url: GOOGLE_MAP_PIN_ICON_URL,
            scaledSize: new g.Size(20, 24),
          },
        });
      }
    })();

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [scriptReady, lat, lng, mapSalt, viewCenter.lat, viewCenter.lng]);

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
      <figcaption className="text-xs text-stone-500">
        Approximate area only — not the exact address. Map data © Google
      </figcaption>
    </figure>
  );
}
