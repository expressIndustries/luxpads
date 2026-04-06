/**
 * Idempotent: creates or updates exactly 3 published listings with fixed slugs.
 * Safe to re-run; does not delete other rows. Use: `npm run db:seed:samples`
 *
 * Loads DATABASE_URL from `.env` if unset. Creates a demo owner if no owner exists; ensures a few amenities exist.
 */
import { PrismaClient, ListingStatus, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { loadDatabaseUrl } from "../scripts/db-env.js";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = loadDatabaseUrl();
}

const prisma = new PrismaClient();

const SAMPLE_OWNER_EMAIL = "sample-listings-owner@luxpads.demo";

const BASELINE_AMENITIES = [
  { slug: "pool", label: "Heated pool", category: "Outdoor", sortOrder: 0 },
  { slug: "chef-kitchen", label: "Chef's kitchen", category: "Interior", sortOrder: 0 },
  { slug: "fireplace", label: "Statement fireplace", category: "Interior", sortOrder: 0 },
  { slug: "mountain-views", label: "Mountain views", category: "Outdoor", sortOrder: 0 },
  { slug: "hot-tub", label: "Hot tub", category: "Outdoor", sortOrder: 0 },
] as const;

type SampleHome = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  propertyType: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  addressLine1: string;
  lat: number;
  lng: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  nightlyRateCents: number;
  minNights: number;
  cleaningFeeNote: string;
  sleepingArrangements: string;
  houseRules: string;
  checkInOut: string;
  cancellationPolicy: string;
  featured: boolean;
  images: string[];
  amenitySlugs: string[];
};

const SAMPLES: SampleHome[] = [
  {
    slug: "luxpads-sample-boulder-meadow",
    title: "Boulder Meadow Modern",
    summary: "Flatirons views, quiet residential street, fifteen minutes to Pearl Street and campus.",
    description:
      "A light-filled contemporary home with walls of glass toward the meadow and mountains. Ideal for small groups who want Boulder access without downtown noise. Radiant heat, a cook’s kitchen, and a patio wired for evening lounging.",
    propertyType: "Mountain Lodge",
    city: "Boulder",
    state: "Colorado",
    country: "United States",
    postalCode: "80302",
    addressLine1: "Sample Meadow Lane (demo listing)",
    lat: 40.015,
    lng: -105.2705,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3.5,
    beds: 5,
    nightlyRateCents: 485_00,
    minNights: 3,
    cleaningFeeNote: "Demo listing — coordinate with owner for turnover.",
    sleepingArrangements: "Primary king; two queens; office with sleeper sofa.",
    houseRules: "No events without approval. Quiet hours after 10pm.",
    checkInOut: "Check-in 4pm / check-out 11am.",
    cancellationPolicy: "Terms agreed directly with the homeowner.",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
    ],
    amenitySlugs: ["mountain-views", "chef-kitchen", "fireplace", "hot-tub"],
  },
  {
    slug: "luxpads-sample-sedona-courtyard",
    title: "Sedona Red Rock Courtyard",
    summary: "Adobe-quiet courtyard, pool, and big-sky sunsets over the red rocks.",
    description:
      "Single-level layout wrapped around a private pool and ramada. Mornings on the terrace, afternoons by the water, and easy drives to trailheads. Built for relaxed desert weeks with friends or family.",
    propertyType: "Desert Oasis",
    city: "Sedona",
    state: "Arizona",
    country: "United States",
    postalCode: "86336",
    addressLine1: "Sample Courtyard Way (demo listing)",
    lat: 34.8697,
    lng: -111.761,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    beds: 4,
    nightlyRateCents: 325_00,
    minNights: 4,
    cleaningFeeNote: "Demo listing — pool heat quoted seasonally.",
    sleepingArrangements: "Two king suites; one room with two twins.",
    houseRules: "No glass in pool area. Pets by approval only.",
    checkInOut: "Smart lock; arrival details after inquiry.",
    cancellationPolicy: "Owner-managed; holiday weeks may require deposit.",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80",
    ],
    amenitySlugs: ["pool", "chef-kitchen", "fireplace", "hot-tub"],
  },
  {
    slug: "luxpads-sample-charleston-harbor",
    title: "Charleston Harbor Guest House",
    summary: "Piazza porches, harbor breezes, and a kitchen made for long-table suppers.",
    description:
      "A refined low-country guest house with heart-pine floors and a screened porch. Walkable to dining; easy Uber to the historic district. Suited to couples or a small family who want Southern charm without a huge estate.",
    propertyType: "Estate",
    city: "Charleston",
    state: "South Carolina",
    country: "United States",
    postalCode: "29401",
    addressLine1: "Sample East Bay Street (demo listing)",
    lat: 32.7765,
    lng: -79.9311,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2.5,
    beds: 3,
    nightlyRateCents: 275_00,
    minNights: 2,
    cleaningFeeNote: "Demo listing — linens and turnover per owner agreement.",
    sleepingArrangements: "Primary king; second bedroom queen; reading nook daybed.",
    houseRules: "Respect neighbors on shared piazza. No smoking indoors.",
    checkInOut: "Meet greeter or lockbox; 3pm / 11am.",
    cancellationPolicy: "Direct with homeowner.",
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80",
    ],
    amenitySlugs: ["chef-kitchen", "fireplace", "pool"],
  },
];

async function ensureBaselineAmenities() {
  for (const a of BASELINE_AMENITIES) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      create: { ...a },
      update: {},
    });
  }
}

async function ensureSampleOwnerId(): Promise<string> {
  const existing = await prisma.user.findFirst({
    where: { role: Role.owner },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.id;

  const passwordHash = await hash("LuxPads!demo123", 12);
  const user = await prisma.user.create({
    data: {
      email: SAMPLE_OWNER_EMAIL,
      passwordHash,
      name: "Sample Listings Owner",
      role: Role.owner,
      ownerProfile: {
        create: {
          displayName: "LuxPads Sample Homes",
          bio: "Owns the three fixed demo listings for local testing.",
          contactEmail: SAMPLE_OWNER_EMAIL,
        },
      },
    },
  });
  console.log(`Created demo owner ${SAMPLE_OWNER_EMAIL} (password: LuxPads!demo123)`);
  return user.id;
}

async function upsertSampleListing(h: SampleHome, ownerId: string) {
  const amenityRows = await prisma.amenity.findMany({
    where: { slug: { in: [...h.amenitySlugs] } },
    select: { id: true, slug: true },
  });
  const amenityIds = amenityRows.map((r) => r.id);
  if (amenityIds.length < h.amenitySlugs.length) {
    const found = new Set(amenityRows.map((r) => r.slug));
    const missing = h.amenitySlugs.filter((s) => !found.has(s));
    console.warn(`Listing ${h.slug}: skipping missing amenities: ${missing.join(", ")}`);
  }

  const core = {
    ownerId,
    title: h.title,
    summary: h.summary,
    description: h.description,
    propertyType: h.propertyType,
    addressLine1: h.addressLine1,
    city: h.city,
    state: h.state,
    country: h.country,
    postalCode: h.postalCode,
    latitude: h.lat,
    longitude: h.lng,
    maxGuests: h.maxGuests,
    bedrooms: h.bedrooms,
    bathrooms: h.bathrooms,
    beds: h.beds,
    sleepingArrangements: h.sleepingArrangements,
    houseRules: h.houseRules,
    checkInOut: h.checkInOut,
    cancellationPolicy: h.cancellationPolicy,
    nightlyRateCents: h.nightlyRateCents,
    cleaningFeeNote: h.cleaningFeeNote,
    minNights: h.minNights,
    status: ListingStatus.published,
    featured: h.featured,
  };

  const existing = await prisma.listing.findUnique({ where: { slug: h.slug }, select: { id: true } });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.listingImage.deleteMany({ where: { listingId: existing.id } });
      await tx.listingAmenity.deleteMany({ where: { listingId: existing.id } });
      await tx.listing.update({
        where: { id: existing.id },
        data: core,
      });
      await tx.listingImage.createMany({
        data: h.images.map((url, i) => ({
          listingId: existing.id,
          url,
          sortOrder: i,
          alt: h.title,
        })),
      });
      if (amenityIds.length) {
        await tx.listingAmenity.createMany({
          data: amenityIds.map((amenityId) => ({ listingId: existing.id, amenityId })),
          skipDuplicates: true,
        });
      }
    });
    console.log(`Updated sample listing /listing/${h.slug}`);
    return;
  }

  await prisma.listing.create({
    data: {
      ...core,
      slug: h.slug,
      images: {
        create: h.images.map((url, i) => ({
          url,
          sortOrder: i,
          alt: h.title,
        })),
      },
      amenities: {
        create: amenityIds.map((amenityId) => ({
          amenity: { connect: { id: amenityId } },
        })),
      },
    },
  });
  console.log(`Created sample listing /listing/${h.slug}`);
}

async function main() {
  await ensureBaselineAmenities();
  const ownerId = await ensureSampleOwnerId();

  for (const h of SAMPLES) {
    await upsertSampleListing(h, ownerId);
  }

  console.log("\nDone. Three published listings (fixed slugs):");
  for (const h of SAMPLES) {
    console.log(`  • ${h.title} → /listing/${h.slug}`);
  }
  console.log("\nRe-run anytime: npm run db:seed:samples");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
