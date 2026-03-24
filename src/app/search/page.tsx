import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { searchListings } from "@/lib/queries/search-listings";
import { ListingCard } from "@/components/listing/listing-card";
import { PROPERTY_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Browse luxury homes",
  description: "Search by destination, dates, guests, and amenities. Contact owners directly.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v;
}

function listParam(v: string | string[] | undefined) {
  if (!v) return [] as string[];
  return Array.isArray(v) ? v : [v];
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const city = first(sp.city);
  const q = first(sp.q);
  const guests = Number(first(sp.guests) ?? "") || undefined;
  const minBedrooms = Number(first(sp.minBedrooms) ?? "") || undefined;
  const minBathrooms = Number(first(sp.minBathrooms) ?? "") || undefined;
  const minPriceDollars = Number(first(sp.minPrice) ?? "") || undefined;
  const maxPriceDollars = Number(first(sp.maxPrice) ?? "") || undefined;
  const minPrice = minPriceDollars != null ? Math.round(minPriceDollars * 100) : undefined;
  const maxPrice = maxPriceDollars != null ? Math.round(maxPriceDollars * 100) : undefined;
  const propertyType = first(sp.propertyType);
  const checkIn = first(sp.checkIn);
  const checkOut = first(sp.checkOut);
  const amenities = listParam(sp.amenities);
  const amenitiesFilter = amenities.length ? amenities : undefined;

  const [listings, amenityList] = await Promise.all([
    searchListings({
      city,
      q,
      guests,
      minBedrooms,
      minBathrooms,
      minPrice,
      maxPrice,
      propertyType,
      checkIn,
      checkOut,
      amenities: amenitiesFilter,
    }),
    prisma.amenity.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="font-serif text-4xl text-stone-900">Explore homes</h1>
        <p className="mt-3 text-sm text-stone-600">
          No traveler booking fees. When you’re ready, contact the homeowner to finalize details direct.
        </p>
      </header>

      <form method="get" className="mt-10 space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Destination</label>
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City or region"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Check-in</label>
            <input
              name="checkIn"
              type="date"
              defaultValue={checkIn ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Check-out</label>
            <input
              name="checkOut"
              type="date"
              defaultValue={checkOut ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Guests</label>
            <input
              name="guests"
              type="number"
              min={1}
              defaultValue={guests ?? ""}
              placeholder="Any"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Min bedrooms</label>
            <input
              name="minBedrooms"
              type="number"
              min={0}
              defaultValue={minBedrooms ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Min bathrooms</label>
            <input
              name="minBathrooms"
              type="number"
              min={0}
              step={0.5}
              defaultValue={minBathrooms ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Property type</label>
            <select
              name="propertyType"
              defaultValue={propertyType ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            >
              <option value="">Any</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Min price / night (USD)</label>
            <input
              name="minPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={minPriceDollars ?? ""}
              placeholder="e.g. 1500"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
            <p className="text-[11px] text-stone-500">Whole dollars per night.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Max price / night (USD)</label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={maxPriceDollars ?? ""}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">Amenities</legend>
          <div className="flex flex-wrap gap-3">
            {amenityList.map((a) => {
              const checked = amenities.includes(a.slug);
              return (
                <label key={a.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={a.slug}
                    defaultChecked={!!checked}
                    className="rounded border-stone-300"
                  />
                  {a.label}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-500">Selecting multiple amenities narrows to homes that include all selected.</p>
        </fieldset>
        <input type="hidden" name="q" value={q ?? ""} />
        <button
          type="submit"
          className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Apply filters
        </button>
      </form>

      <div className="mt-12">
        <p className="text-sm text-stone-600">
          {listings.length} home{listings.length === 1 ? "" : "s"} match your criteria
        </p>
        {listings.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600">
            No published listings match those filters. Try widening dates or removing some amenities.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={{
                  slug: l.slug,
                  title: l.title,
                  city: l.city,
                  state: l.state,
                  maxGuests: l.maxGuests,
                  bedrooms: l.bedrooms,
                  bathrooms: l.bathrooms,
                  nightlyRateCents: l.nightlyRateCents,
                  heroImage: l.images[0]?.url ?? null,
                  featured: l.featured,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
