type MapPlaceholderProps = {
  label?: string;
  lat?: number | null;
  lng?: number | null;
};

export function MapPlaceholder({ label = "Approximate location", lat, lng }: MapPlaceholderProps) {
  return (
    <div className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-gradient-to-br from-stone-100 to-stone-50 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</p>
      <p className="mt-2 max-w-sm px-6 text-sm text-stone-600">
        Map preview — connect Google Maps or Mapbox with{" "}
        <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_MAP_PROVIDER</code> and your API key.
      </p>
      {lat != null && lng != null ? (
        <p className="mt-3 font-mono text-[11px] text-stone-400">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      ) : null}
    </div>
  );
}
