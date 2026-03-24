type MapPlaceholderProps = {
  label?: string;
  lat?: number | null;
  lng?: number | null;
};

function googleStaticMapUrl(lat: number, lng: number, apiKey: string): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "14",
    size: "640x360",
    scale: "2",
    markers: `color:0x57534e|${lat},${lng}`,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function mapboxStaticMapUrl(lat: number, lng: number, accessToken: string): string {
  // Center + zoom (no overlay) — same pattern as Mapbox docs; avoids overlay encoding edge cases.
  const params = new URLSearchParams({ access_token: accessToken });
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},14/640x360@2x?${params.toString()}`;
}

function FallbackPlaceholder({ label, lat, lng }: MapPlaceholderProps) {
  return (
    <div className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-gradient-to-br from-stone-100 to-stone-50 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</p>
      <p className="mt-2 max-w-sm px-6 text-sm text-stone-600">
        Map preview — set{" "}
        <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_MAP_PROVIDER</code>{" "}
        to <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">google</code> or{" "}
        <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">mapbox</code> and add the matching API
        key in <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">.env</code> (see{" "}
        <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">.env.example</code>).
      </p>
      {lat != null && lng != null ? (
        <p className="mt-3 font-mono text-[11px] text-stone-400">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      ) : null}
    </div>
  );
}

export function MapPlaceholder({ label = "Approximate location", lat, lng }: MapPlaceholderProps) {
  const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER?.toLowerCase().trim();
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  if (lat == null || lng == null) {
    return <FallbackPlaceholder label={label} lat={lat} lng={lng} />;
  }

  if (provider === "google" && googleKey) {
    const src = googleStaticMapUrl(lat, lng, googleKey);
    const openHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    return (
      <figure className="space-y-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- external map API URLs; avoid Image optimizer */}
          <img src={src} alt={label} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <span>Map data © Google</span>
          <a href={openHref} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-900 underline-offset-2 hover:underline">
            Open in Google Maps
          </a>
        </figcaption>
      </figure>
    );
  }

  if (provider === "mapbox" && mapboxToken) {
    const src = mapboxStaticMapUrl(lat, lng, mapboxToken);
    const openHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
    return (
      <figure className="space-y-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <figcaption className="text-xs text-stone-500">
          © Mapbox © OpenStreetMap ·{" "}
          <a href={openHref} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-900 underline-offset-2 hover:underline">
            View area on OpenStreetMap
          </a>
        </figcaption>
      </figure>
    );
  }

  return <FallbackPlaceholder label={label} lat={lat} lng={lng} />;
}
