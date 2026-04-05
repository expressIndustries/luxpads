import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicListingBySlug } from "@/lib/queries/listing-by-slug";
import { formatHostDisplayName, formatMoney } from "@/lib/utils";
import {
  ListingGalleryLightboxGrid,
  ListingGalleryLightboxProvider,
  ListingHeroLightboxTrigger,
} from "@/components/listing/listing-gallery-lightbox";
import { ListingMap } from "@/components/listing/listing-map";
import { AvailabilityPreview } from "@/components/listing/availability-preview";
import { InquiryForm } from "@/components/listing/inquiry-form";
import { siteCopy } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  if (!listing) return { title: "Listing" };
  const image = listing.images[0]?.url;
  return {
    title: listing.title,
    description: listing.summary.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.summary,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  if (!listing) notFound();

  const host = formatHostDisplayName(
    listing.owner.ownerProfile?.displayName ?? listing.owner.name ?? "Homeowner",
  );
  const hostBio = listing.owner.ownerProfile?.bio;
  const hero = listing.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80";
  const galleryImages = listing.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: listing.title,
    description: listing.summary,
    image: listing.images.map((i) => i.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.addressLine1,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.postalCode,
      addressCountry: listing.country,
    },
    numberOfRooms: listing.bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: listing.maxGuests },
    priceRange: `${formatMoney(listing.nightlyRateCents)} per night (indicative)`,
  };

  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ListingGalleryLightboxProvider images={galleryImages} listingTitle={listing.title}>
        <div className="relative aspect-[21/9] min-h-[320px] w-full overflow-hidden bg-stone-100">
          <Image src={hero} alt="" fill priority unoptimized className="object-cover" sizes="100vw" />
          <ListingHeroLightboxTrigger />
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-stone-950/55 to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[3] flex items-end justify-center px-4 pb-10 sm:px-6 lg:px-8">
            <p className="text-center text-base font-semibold uppercase tracking-[0.28em] text-white sm:text-lg md:text-xl">
              {listing.city}, {listing.state}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl border-b border-stone-100 px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
            <h1 className="font-serif text-3xl leading-tight text-stone-900 sm:text-4xl lg:text-5xl">{listing.title}</h1>
            <p className="text-stone-700 leading-relaxed lg:pt-1">{listing.summary}</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1fr_380px] sm:px-6 lg:px-8">
          <div className="space-y-12">
            {listing.images.length > 0 ? (
              <section>
                <h2 className="font-serif text-2xl text-stone-900">Gallery</h2>
                <ListingGalleryLightboxGrid />
              </section>
            ) : null}

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-stone-900">About this home</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{listing.description}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Guests" value={`${listing.maxGuests}`} />
              <Stat label="Bedrooms" value={`${listing.bedrooms}`} />
              <Stat label="Bathrooms" value={`${listing.bathrooms}`} />
            </div>
          </section>

          {listing.sleepingArrangements ? (
            <section>
              <h2 className="font-serif text-2xl text-stone-900">Sleeping arrangements</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{listing.sleepingArrangements}</p>
            </section>
          ) : null}

          <section>
            <h2 className="font-serif text-2xl text-stone-900">Amenities</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {listing.amenities.map((a) => (
                <li key={a.amenityId} className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
                  {a.amenity.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Policies</h2>
              <div className="mt-4 space-y-4 text-sm text-stone-700">
                {listing.houseRules ? (
                  <div>
                    <p className="font-medium text-stone-900">House rules</p>
                    <p className="mt-1 whitespace-pre-line">{listing.houseRules}</p>
                  </div>
                ) : null}
                {listing.checkInOut ? (
                  <div>
                    <p className="font-medium text-stone-900">Check-in / check-out</p>
                    <p className="mt-1 whitespace-pre-line">{listing.checkInOut}</p>
                  </div>
                ) : null}
                {listing.cancellationPolicy ? (
                  <div>
                    <p className="font-medium text-stone-900">Cancellation</p>
                    <p className="mt-1 whitespace-pre-line">{listing.cancellationPolicy}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Location</h2>
              <div className="mt-4">
                <ListingMap
                  label="Approximate Location"
                  lat={listing.latitude}
                  lng={listing.longitude}
                  locationQuery={`${listing.addressLine1}, ${listing.city}, ${listing.state} ${listing.postalCode}`}
                  mapSalt={listing.slug}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-stone-900">Availability</h2>
            <p className="mt-2 text-sm text-stone-600">
              Calendar reflects owner-managed holds. Confirm dates directly with the homeowner.
            </p>
            <div className="mt-6">
              <AvailabilityPreview blocks={listing.availability} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Indicative rate</p>
            <p className="mt-2 font-serif text-3xl text-stone-900">
              {formatMoney(listing.nightlyRateCents)}
              <span className="text-base font-sans font-normal text-stone-500"> / night</span>
            </p>
            <p className="mt-2 text-xs text-stone-500">Minimum {listing.minNights} nights. Taxes and fees may apply—settled with the owner.</p>
            {listing.cleaningFeeNote ? (
              <p className="mt-3 text-xs text-stone-600">
                <span className="font-medium text-stone-800">Cleaning / notes:</span> {listing.cleaningFeeNote}
              </p>
            ) : null}
            <div className="mt-6 border-t border-stone-100 pt-6">
              <p className="text-sm font-medium text-stone-900">Contact owner</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                {siteCopy.marketplaceDisclaimer}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl text-stone-900">Hosted by {host}</h2>
            {hostBio ? <p className="mt-3 text-sm text-stone-600">{hostBio}</p> : null}
            <p className="mt-4 text-xs text-stone-500">
              Verified contact happens after you send an inquiry. {siteCopy.legalName} does not process rental payments.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl text-stone-900">Send inquiry</h2>
            <p className="mt-2 text-sm text-stone-600">
              Share your dates and intent. This is not instant booking—owners respond on their timeline.
            </p>
            <div className="mt-6">
              <InquiryForm listingSlug={listing.slug} />
            </div>
          </div>
        </aside>
      </div>
      </ListingGalleryLightboxProvider>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-medium text-stone-900">{value}</p>
    </div>
  );
}
