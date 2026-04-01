type MapPlaceholderProps = {
  label?: string;
  lat?: number | null;
  lng?: number | null;
  /** When lat/lng are missing, Google Static Maps can still center on a free-text address. */
  locationQuery?: string | null;
  /** With coordinates, enables privacy map: red ~0.15 mi circle at true point, viewport offset from exact location. */
  mapSalt?: string | null;
  /** "Open in Google Maps" search text (e.g. city + state) so exact coords are not linked. */
  mapsSearchQuery?: string | null;
};

/** Server-side keys (read at runtime) — use these in Docker/production so you do not need rebuild after setting .env. */
function mapEnv() {
  const provider = (
    process.env.MAP_PROVIDER?.trim() ||
    process.env.NEXT_PUBLIC_MAP_PROVIDER?.trim()
  )?.toLowerCase();

  const googleKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  const mapboxToken =
    process.env.MAPBOX_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  return { provider, googleKey, mapboxToken };
}

/** Same-origin proxy — avoids browser referrer / key-exposure issues with maps.googleapis.com. */
function googleStaticMapProxySrc(lat: number, lng: number, mapSalt?: string | null): string {
  const q = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (mapSalt?.trim()) q.set("salt", mapSalt.trim());
  return `/api/maps/static?${q.toString()}`;
}

function googleStaticMapProxySrcFromAddress(address: string): string {
  const q = new URLSearchParams({ address });
  return `/api/maps/static?${q.toString()}`;
}

function mapboxStaticMapUrl(lat: number, lng: number, accessToken: string): string {
  // Center + zoom (no overlay) — same pattern as Mapbox docs; avoids overlay encoding edge cases.
  const params = new URLSearchParams({ access_token: accessToken });
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},14/640x360@2x?${params.toString()}`;
}

function FallbackPlaceholder({
  label,
  reason,
}: Pick<MapPlaceholderProps, "label" | "lat" | "lng"> & { reason?: "mapbox_needs_coords" }) {
  return (
    <div className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-gradient-to-br from-stone-100 to-stone-50 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</p>
      {reason === "mapbox_needs_coords" ? (
        <p className="mt-2 max-w-sm px-6 text-sm text-stone-600">
          Mapbox static previews need latitude and longitude on the listing. Add coordinates in the listing editor, or
          switch to <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_MAP_PROVIDER=google</code>{" "}
          to map by street address.
        </p>
      ) : (
        <p className="mt-2 max-w-sm px-6 text-sm text-stone-600">
          Map preview — set <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">MAP_PROVIDER=google</code> (or{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_MAP_PROVIDER</code>) and{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">GOOGLE_MAPS_API_KEY</code> in{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">.env</code>. Docker: pass the same vars into the
          container (no rebuild). Local <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">next dev</code>: restart
          after changing env.
        </p>
      )}
    </div>
  );
}

export function MapPlaceholder({
  label = "Approximate Location",
  lat,
  lng,
  locationQuery,
  mapSalt,
  mapsSearchQuery,
}: MapPlaceholderProps) {
  const { provider, googleKey, mapboxToken } = mapEnv();

  const coordsOk = lat != null && lng != null;
  const googleCanMap =
    provider === "google" && Boolean(googleKey) && (coordsOk || Boolean(locationQuery?.trim()));

  if (provider === "mapbox" && mapboxToken && !coordsOk) {
    return <FallbackPlaceholder label={label} lat={lat} lng={lng} reason="mapbox_needs_coords" />;
  }

  if (!googleCanMap && !(provider === "mapbox" && mapboxToken && coordsOk)) {
    return <FallbackPlaceholder label={label} lat={lat} lng={lng} />;
  }

  if (provider === "google" && googleKey) {
    const src = coordsOk
      ? googleStaticMapProxySrc(lat!, lng!, mapSalt)
      : googleStaticMapProxySrcFromAddress(locationQuery!.trim());
    const openQuery =
      coordsOk && mapsSearchQuery?.trim()
        ? mapsSearchQuery.trim()
        : coordsOk
          ? `${lat},${lng}`
          : locationQuery!.trim();
    const openHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openQuery)}`;
    return (
      <figure className="space-y-2">
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- proxied Static Maps; avoid Image optimizer */}
          <img
            src={src}
            alt={label}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
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

  if (provider === "mapbox" && mapboxToken && lat != null && lng != null) {
    const src = mapboxStaticMapUrl(lat, lng, mapboxToken);
    const openHref = mapsSearchQuery?.trim()
      ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(mapsSearchQuery.trim())}`
      : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
    return (
      <figure className="space-y-2">
        <p className="text-sm font-medium text-stone-900">{label}</p>
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
