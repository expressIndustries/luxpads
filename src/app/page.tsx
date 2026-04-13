import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedListings } from "@/lib/queries/search-listings";
import { ListingCard } from "@/components/listing/listing-card";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl, siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

const HOME_HERO =
  "https://luxpads.s3.us-east-1.amazonaws.com/listing-images/5061ef72-2524-47a2-b649-6e02ebbcb876.jpg";

const homeDescription =
  "Luxury vacation homes with no traveler booking fees. Browse featured stays, contact homeowners directly, and list your property for free on LuxPads.";

export const metadata: Metadata = {
  title: { absolute: `${siteCopy.legalName} | ${siteCopy.tagline}` },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteCopy.legalName} | ${siteCopy.tagline}`,
    description: homeDescription,
    url: absoluteUrl("/"),
    type: "website",
    locale: "en_US",
    siteName: siteCopy.legalName,
    images: [{ url: HOME_HERO, alt: "Luxury vacation home — book directly with the owner on LuxPads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteCopy.legalName} | ${siteCopy.tagline}`,
    description: homeDescription.slice(0, 200),
    images: [HOME_HERO],
  },
};

function homeStructuredData() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: siteCopy.legalName,
        alternateName: siteCopy.domainDisplay,
        url: origin,
        description: homeDescription,
        publisher: { "@id": `${origin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: siteCopy.legalName,
        url: origin,
      },
    ],
  };
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedListings>> = [];
  try {
    featured = await getFeaturedListings(6);
  } catch {
    /* MySQL down, bad DATABASE_URL, or migrations not applied — still render the marketing shell */
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData()) }} />
      <section className="relative isolate min-h-[78vh] overflow-hidden">
        <Image
          src={HOME_HERO}
          alt="Luxury vacation home exterior — explore homes on LuxPads"
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/35 to-stone-900/20" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-200/90">{siteCopy.domainDisplay}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {siteCopy.legalName}
          </h1>
          <p className="mt-4 max-w-2xl text-2xl font-medium leading-snug text-stone-100 sm:text-3xl">
            {siteCopy.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-200/95 sm:text-xl">
            No traveler booking fees. Owners list for free; you arrange stays directly with the homeowner.
          </p>
          <div className="mt-10">
            <Link
              href="/search"
              className="inline-flex h-[46px] items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100"
            >
              Explore homes
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">Featured residences</h2>
            <p className="mt-2 max-w-xl text-sm text-stone-600">
              Hand-picked luxury homes—always contact the owner directly.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 shadow-sm hover:border-stone-300 hover:bg-stone-50"
          >
            View all
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0 ? (
            <p className="col-span-full text-sm text-stone-600">
              No listings to show yet.{" "}
              <Link href="/search" className="font-medium text-amber-900 underline underline-offset-2">
                Browse all homes
              </Link>
              {process.env.NODE_ENV === "development" ? (
                <span className="mt-2 block text-xs text-stone-500">
                  Local tip: start MySQL, set <code className="rounded bg-stone-100 px-1">DATABASE_URL</code> in{" "}
                  <code className="rounded bg-stone-100 px-1">.env</code>, then{" "}
                  <code className="rounded bg-stone-100 px-1">npx prisma migrate dev</code> and optional{" "}
                  <code className="rounded bg-stone-100 px-1">npm run db:seed</code>.
                </span>
              ) : null}
            </p>
          ) : (
            featured.map((l) => (
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
            ))
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl border border-stone-200 bg-white p-10 shadow-sm lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">List your home with confidence</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Listing is free—no platform commission on your bookings. You screen guests, set contracts, and collect
              payment off-platform while we showcase your property beautifully.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-700">
              <li>— Premium listing pages with availability tools</li>
              <li>— Inquiries routed to your inbox</li>
              <li>— No traveler booking fees (better conversion)</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/owners"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-stone-800"
              >
                Owner overview
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 shadow-sm hover:border-stone-300 hover:bg-stone-50"
              >
                Create owner account
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
            <Image
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80"
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
