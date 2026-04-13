import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { searchListings } from "@/lib/queries/search-listings";
import { ListingCard } from "@/components/listing/listing-card";
import { ExploreFiltersForm } from "@/components/search/explore-filters-form";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const city = first(sp.city)?.trim();
  const title = city
    ? `Luxury vacation rentals in ${city} | ${siteCopy.legalName}`
    : `Browse luxury vacation rentals | ${siteCopy.legalName}`;
  const description = city
    ? `Find homes in ${city}. Filter by guests, dates, and amenities. No traveler booking fees — message homeowners directly on ${siteCopy.domainDisplay}.`
    : `Search luxury homes by destination, dates, guests, and amenities. Contact owners directly on ${siteCopy.domainDisplay} — no traveler booking fees.`;
  const canonicalPath = city ? `/search?city=${encodeURIComponent(city)}` : "/search";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      type: "website",
      locale: "en_US",
      siteName: siteCopy.legalName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 200),
    },
  };
}

function listParam(v: string | string[] | undefined) {
  if (!v) return [] as string[];
  return Array.isArray(v) ? v : [v];
}

function countActiveExploreFilters(params: {
  city?: string;
  q?: string;
  guests?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minPriceDollars?: number;
  maxPriceDollars?: number;
  propertyType?: string;
  checkIn?: string;
  checkOut?: string;
  amenities: string[];
}): number {
  let n = 0;
  if (params.city?.trim()) n += 1;
  if (params.q?.trim()) n += 1;
  if (params.checkIn?.trim()) n += 1;
  if (params.checkOut?.trim()) n += 1;
  if (params.guests != null && params.guests > 0) n += 1;
  if (params.minBedrooms != null && params.minBedrooms > 0) n += 1;
  if (params.minBathrooms != null && params.minBathrooms > 0) n += 1;
  if (params.minPriceDollars != null && params.minPriceDollars > 0) n += 1;
  if (params.maxPriceDollars != null && params.maxPriceDollars > 0) n += 1;
  if (params.propertyType?.trim()) n += 1;
  n += params.amenities.length;
  return n;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
    prisma.amenity.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
  ]);

  const activeFilterCount = countActiveExploreFilters({
    city,
    q,
    guests,
    minBedrooms,
    minBathrooms,
    minPriceDollars,
    maxPriceDollars,
    propertyType,
    checkIn,
    checkOut,
    amenities,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="font-serif text-4xl text-stone-900">Explore homes</h1>
        <p className="mt-3 text-sm text-stone-600">
          No traveler booking fees. When you’re ready, contact the homeowner to finalize details direct.
        </p>
      </header>

      <div className="mt-10">
        <ExploreFiltersForm
          defaultOpen={activeFilterCount > 0}
          activeFilterCount={activeFilterCount}
          city={city ?? ""}
          checkIn={checkIn ?? ""}
          checkOut={checkOut ?? ""}
          guests={guests != null ? String(guests) : ""}
          minBedrooms={minBedrooms != null ? String(minBedrooms) : ""}
          minBathrooms={minBathrooms != null ? String(minBathrooms) : ""}
          minPrice={minPriceDollars != null ? String(minPriceDollars) : ""}
          maxPrice={maxPriceDollars != null ? String(maxPriceDollars) : ""}
          propertyType={propertyType ?? ""}
          q={q ?? ""}
          selectedAmenitySlugs={amenities}
          amenityList={amenityList.map((a) => ({ id: a.id, slug: a.slug, label: a.label }))}
        />
      </div>

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
