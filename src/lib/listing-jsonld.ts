import { formatMoney } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

type ListingForJsonLd = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  propertyType: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  nightlyRateCents: number;
  images: { url: string; alt: string | null }[];
};

/**
 * VacationRental + Offer — aligns with schema.org types Google commonly uses for rentals.
 * @see https://schema.org/VacationRental
 */
export function buildListingJsonLd(listing: ListingForJsonLd) {
  const pageUrl = absoluteUrl(`/listing/${listing.slug}`);
  const images = listing.images.map((i) => i.url).filter(Boolean);

  const offer = {
    "@type": "Offer",
    priceCurrency: "USD",
    price: (listing.nightlyRateCents / 100).toFixed(2),
    url: pageUrl,
    availability: "https://schema.org/InStock",
    name: "Indicative nightly rate",
  };

  const geo =
    listing.latitude != null && listing.longitude != null
      ? {
          "@type": "GeoCoordinates",
          latitude: listing.latitude,
          longitude: listing.longitude,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": `${pageUrl}#rental`,
    name: listing.title,
    description: (listing.summary || listing.description).replace(/\s+/g, " ").trim().slice(0, 5000),
    url: pageUrl,
    image: images.length ? images : undefined,
    priceRange: `${formatMoney(listing.nightlyRateCents)} per night (indicative)`,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.addressLine1,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.postalCode,
      addressCountry: listing.country,
    },
    ...(geo ? { geo } : {}),
    numberOfRooms: listing.bedrooms,
    makesOffer: offer,
  };
}

export function buildListingBreadcrumbJsonLd(listing: { slug: string; title: string; city: string; state: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Explore",
        item: absoluteUrl("/search"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${listing.city}, ${listing.state}`,
        item: absoluteUrl(`/search?city=${encodeURIComponent(listing.city)}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: listing.title,
        item: absoluteUrl(`/listing/${listing.slug}`),
      },
    ],
  };
}
