import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteCopy } from "@/lib/constants";
import { sundancePageImages } from "@/content/sundance-page-images";
import { absoluteUrl, siteOrigin } from "@/lib/seo";

const OFFICIAL_SUNDANCE_BOULDER =
  "https://www.sundance.org/blogs/2027-sundance-film-festival-to-take-place-january-21-31-in-boulder-colorado/";

const SUNDANCE_PATH = "/rent-home-for-sundance-film-festival-boulder" as const;

const sundanceDescription =
  "January 21–31, 2027: rent your Boulder, Colorado home for the Sundance Film Festival. Venue areas (Pearl Street, CU, Dairy Arts, Chautauqua), free LuxPads listings, and direct guest inquiries.";

const sundanceHeroAbsoluteUrl = sundancePageImages.hero.src.startsWith("http")
  ? sundancePageImages.hero.src
  : `${siteOrigin()}${sundancePageImages.hero.src}`;

export const metadata: Metadata = {
  title: "Rent your Boulder home for Sundance Film Festival 2027 | LuxPads",
  description: sundanceDescription,
  alternates: { canonical: SUNDANCE_PATH },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteCopy.legalName,
    url: absoluteUrl(SUNDANCE_PATH),
    title: "Sundance Film Festival 2027 in Boulder — list your rental home | LuxPads",
    description: sundanceDescription,
    images: [
      {
        url: sundanceHeroAbsoluteUrl,
        width: sundancePageImages.hero.width,
        height: sundancePageImages.hero.height,
        alt: "Flatirons and Boulder, Colorado — Sundance Film Festival 2027 host city",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent your home for Sundance 2027 in Boulder, Colorado",
    description: sundanceDescription.slice(0, 200),
    images: [sundanceHeroAbsoluteUrl],
  },
};

const venueAreas = [
  {
    title: "Downtown & Pearl Street vicinity",
    blurb: "Theater screenings, energy, and late-night foot traffic. Roughly the core north of Baseline and west of 28th.",
    examples: ["Boulder Theater", "Boulder Public Library — Canyon Theater", "eTown Hall"],
  },
  {
    title: "University of Colorado Boulder campus",
    blurb: "Major screening and event hubs on and around the Hill and central campus — the heart of CU Boulder activity during the festival.",
    examples: ["Macky Auditorium", "Muenzinger Auditorium", "Roe Green Theatre", "Old Main"],
  },
  {
    title: "Dairy Arts Center",
    blurb: "North of downtown near Alpine — arts campus with multiple screens and talks.",
    examples: ["Boedecker Theater", "Gordon Gamm Theater", "Dairy campus programming"],
  },
  {
    title: "Chautauqua & the Flatirons",
    blurb: "Iconic foothills setting southwest of downtown; limited parking — walkable access from nearby neighborhoods is a plus.",
    examples: ["Chautauqua Auditorium"],
  },
  {
    title: "Additional screening & school venues",
    blurb: "Spread across the city — guests often prefer a short drive or transit hop rather than walking everything.",
    examples: [
      "Cinemark Century Boulder",
      "Boulder High School Auditorium",
      "Casey Middle School Auditorium",
    ],
  },
];

const steps = [
  {
    title: "Create your free owner account",
    body: `Sign up on ${siteCopy.legalName} in a few minutes. Listing is free — there’s no platform subscription.`,
    href: "/signup",
    cta: "Create account",
  },
  {
    title: "Build a standout listing",
    body: "Add strong photos, amenities, house rules, and a clear summary. Highlight parking, workspace, and proximity to downtown or campus if that’s your edge.",
    href: "/dashboard/listings/new",
    cta: "Start a listing",
  },
  {
    title: "Publish and set availability",
    body: "Publish when you’re ready (admin review may apply). Block or open the January 21–31, 2027 window on your calendar so inquiries match reality.",
    href: "/dashboard/calendar",
    cta: "Owner dashboard",
  },
  {
    title: "Respond to guests directly",
    body: "Renters reach you through LuxPads inquiries. You handle screening, lease, and payment off-platform — on your terms.",
    href: "/owners",
    cta: "Owner playbook",
  },
];

function sundanceStructuredData() {
  const pageUrl = absoluteUrl(SUNDANCE_PATH);
  const heroPath = sundancePageImages.hero.src;
  const heroAbsolute = heroPath.startsWith("http") ? heroPath : `${siteOrigin()}${heroPath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Rent your home for the 2027 Sundance Film Festival in Boulder, Colorado",
        description: sundanceDescription,
        isPartOf: {
          "@type": "WebSite",
          name: siteCopy.legalName,
          url: siteOrigin(),
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: heroAbsolute,
        },
        about: {
          "@type": "Event",
          name: "Sundance Film Festival 2027",
          startDate: "2027-01-21",
          endDate: "2027-01-31",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: "Boulder, Colorado",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Boulder",
              addressRegion: "CO",
              addressCountry: "US",
            },
          },
          sameAs: OFFICIAL_SUNDANCE_BOULDER,
        },
      },
      {
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
            name: "Sundance 2027 · Boulder",
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export default function SundanceBoulderPage() {
  return (
    <div className="bg-[#faf9f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sundanceStructuredData()) }} />
      <section className="relative isolate min-h-[62vh] overflow-hidden">
        <Image
          src={sundancePageImages.hero}
          alt="Boulder Flatirons and foothills — host city for Sundance Film Festival 2027"
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/88 via-stone-900/55 to-stone-900/25" />
        <div className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/90">Boulder · January 2027</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Rent your home for the Sundance Film Festival in Boulder
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-200/95">
            The{" "}
            <strong className="font-semibold text-white">2027 Sundance Film Festival</strong> runs{" "}
            <strong className="font-semibold text-white">January 21–31</strong> in Boulder, Colorado — the festival’s
            first edition in the city. List your property on {siteCopy.legalName} and connect directly with production
            teams, industry guests, and travelers.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100"
            >
              List your home
            </Link>
            <Link
              href="/search"
              className="inline-flex rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Browse Boulder-area stays
            </Link>
          </div>
          <p className="mt-8 max-w-xl text-xs leading-relaxed text-stone-300/90">
            Official dates and venues are published by Sundance Institute. Always confirm schedules at{" "}
            <a href={OFFICIAL_SUNDANCE_BOULDER} className="underline decoration-stone-400 underline-offset-2">
              sundance.org
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl text-stone-900">Why Boulder for 2027</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Sundance is moving its flagship festival to Boulder starting in 2027, bringing world premieres, industry
            programming, and tens of thousands of visitors to theaters across town — from the Pearl Street corridor and
            Dairy Arts to CU Boulder and the Chautauqua foothills. Homeowners near these hubs are positioned to host
            crews, executives, and festival-goers who want space, kitchens, and quiet outside the venue rush.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Boulder in the frame</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sundancePageImages.boulderMoments.map((img) => (
              <figure key={img.src.src} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width:1024px) 50vw, 25vw"
                  />
                </div>
                <figcaption className="border-t border-stone-100 px-3 py-2 text-xs text-stone-600">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Homes that fit the moment</h3>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Think warm interiors, room for gear, and honest photos — the kind of Boulder-area homes guests book when
            they want more than a hotel during a busy festival week.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {sundancePageImages.homeInspiration.map((img) => (
              <figure key={img.src} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote S3 URLs; avoids build-time image host coupling */}
                  <img src={img.src} alt={img.alt} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <figcaption className="border-t border-stone-100 px-4 py-3 text-sm text-stone-700">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-stone-900">Festival dates &amp; venue areas</h2>
          <p className="mt-3 text-sm font-medium text-stone-800">January 21–31, 2027 · Boulder, Colorado</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-600">
            Screenings and events use venues across the city. Below is a <strong className="font-medium text-stone-800">rough</strong>{" "}
            guide to where activity clusters — not a map of every entrance. Use it to describe your home’s convenience
            (“15 minutes to Dairy,” “walkable to Pearl”) in your listing copy.
          </p>
          <ul className="mt-10 space-y-8">
            {venueAreas.map((area) => (
              <li key={area.title} className="border-l-2 border-amber-800/40 pl-6">
                <h3 className="font-serif text-xl text-stone-900">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{area.blurb}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Examples</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {area.examples.map((v) => (
                    <li
                      key={v}
                      className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-stone-500">
            Venue list summarized from public Sundance Institute announcements; final lineups and addresses belong to
            the festival.{" "}
            <a href={OFFICIAL_SUNDANCE_BOULDER} className="font-medium text-amber-900 underline underline-offset-2">
              Read the official Boulder announcement
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Rent Your Home for the 2027 Sundance Film Festival in Boulder
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-stone-600">
          {siteCopy.legalName} is a listing marketplace: you keep control of pricing, contracts, and who stays in your
          home. We don’t clip booking fees on the traveler side — guests inquire, you respond, and you finalize the
          rental directly. For a high-demand week like Sundance, that means fewer middlemen and clearer expectations.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Free to list — no platform subscription",
            "Calendar and availability you manage yourself",
            "Inquiries with guest context before you say yes",
            "Ideal for multi-night festival stays and small groups",
            "Showcase parking, Wi‑Fi, and distance to key venue areas",
            "You set house rules and cancellation language",
          ].map((item) => (
            <li key={item} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700 shadow-sm">
              <span className="mt-0.5 text-amber-800" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-stone-900 px-4 py-16 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-white">Steps to get your home ready to rent</h2>
          <p className="mt-3 max-w-2xl text-sm text-stone-300">
            A straightforward path from account to published listing — tune the details for Sundance week as you go.
          </p>
          <ol className="mt-12 space-y-10">
            {steps.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-4 border-b border-stone-700/80 pb-10 last:border-0 last:pb-0 md:flex-row md:items-start md:gap-10">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-600/90 font-serif text-xl text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-xl text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-300">{step.body}</p>
                  <Link
                    href={step.href}
                    className="mt-4 inline-flex text-sm font-semibold text-amber-200 underline decoration-amber-200/50 underline-offset-4 hover:text-white hover:decoration-white"
                  >
                    {step.cta} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Get started
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-stone-500 px-8 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-300 hover:bg-stone-800"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
