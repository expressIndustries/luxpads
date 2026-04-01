/**
 * Generates deploy/luxpads-sample-data.sql for importing demo listings on a live MySQL DB.
 * Run: npx tsx scripts/generate-sample-data-sql.ts > deploy/luxpads-sample-data.sql
 *
 * Password for all demo users: LuxPads!demo123 (bcrypt below is fixed for that string).
 */
import { createWriteStream } from "fs";
import { resolve } from "path";

const OUT = resolve("deploy/luxpads-sample-data.sql");

/** bcrypt hash for LuxPads!demo123, cost 12 — do not change or logins break */
const PASSWORD_HASH = "$2b$12$jWmZyv7QSfo33Ehg7pqzIep3zVZuwKVEGDufws.uGa/f5REdJ98Hm";

function q(s: string | null | undefined): string {
  if (s == null) return "NULL";
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\n/g, "\\n") + "'";
}

function now3() {
  return "CURRENT_TIMESTAMP(3)";
}

const U = {
  admin: "cseedusradmin00000000001",
  owner1: "cseedusrowner1000000001",
  owner2: "cseedusrowner2000000001",
  owner3: "cseedusrowner3000000001",
  renter: "cseedusrrenter000000001",
} as const;

const P = {
  o1: "cseedprofowner10000000001",
  o2: "cseedprofowner20000000001",
  o3: "cseedprofowner30000000001",
} as const;

const AMENITIES: { id: string; slug: string; label: string; category: string }[] = [
  { id: "cseedamenpool00000000001", slug: "pool", label: "Heated pool", category: "Outdoor" },
  { id: "cseedamenhtub00000000001", slug: "hot-tub", label: "Hot tub", category: "Outdoor" },
  { id: "cseedamenckit00000000001", slug: "chef-kitchen", label: "Chef's kitchen", category: "Interior" },
  { id: "cseedamenwcel00000000001", slug: "wine-cellar", label: "Wine cellar", category: "Interior" },
  { id: "cseedamenhthe00000000001", slug: "home-theater", label: "Private theater", category: "Interior" },
  { id: "cseedamengym000000000001", slug: "gym", label: "Fitness studio", category: "Wellness" },
  { id: "cseedamenfpl00000000001", slug: "fireplace", label: "Statement fireplace", category: "Interior" },
  { id: "cseedamencnc00000000001", slug: "concierge", label: "Concierge-ready", category: "Service" },
  { id: "cseedamenevc00000000001", slug: "ev-charging", label: "EV charging", category: "Parking" },
  { id: "cseedamenskil0000000001", slug: "ski-locker", label: "Ski locker / mudroom", category: "Outdoor" },
  { id: "cseedamenocean000000001", slug: "ocean-view", label: "Ocean views", category: "Outdoor" },
  { id: "cseedamengolf0000000001", slug: "golf", label: "Golf access", category: "Outdoor" },
];

const slugToAmenityId = Object.fromEntries(AMENITIES.map((a) => [a.slug, a.id]));

type Home = {
  id: string;
  slug: string;
  owner: keyof typeof U;
  featured: boolean;
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
  images: string[];
  amenitySlugs: string[];
};

const homes: Home[] = [
  {
    id: "cseedlistaspen00000000001",
    slug: "aspen-ridge-glass-house",
    owner: "owner1",
    featured: true,
    title: "Aspen Ridge Glass House",
    summary: "Floor-to-ceiling views, quiet ridge line, minutes to downtown Aspen.",
    description:
      "A sculptural retreat wrapped in glass and warm oak. Designed for mountain-town entertaining with a quiet, residential feel. Heated terraces, radiant floors, and a pantry ready for private chef service.",
    propertyType: "Mountain Lodge",
    city: "Aspen",
    state: "Colorado",
    country: "United States",
    postalCode: "81611",
    addressLine1: "1200 Ridge Road",
    lat: 39.1911,
    lng: -106.8175,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5.5,
    beds: 6,
    nightlyRateCents: 420000,
    minNights: 4,
    cleaningFeeNote: "Professional turnover billed directly by the homeowner.",
    sleepingArrangements: "Primary suite with king; four guest suites; media room with queen sleeper.",
    houseRules: "No events without prior approval. Quiet hours after 11pm. No smoking indoors.",
    checkInOut: "Check-in 4pm / Check-out 11am. Smart lock details sent after inquiry.",
    cancellationPolicy: "Cancellations handled directly with the homeowner per signed agreement.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    ],
    amenitySlugs: ["pool", "hot-tub", "chef-kitchen", "fireplace", "ski-locker"],
  },
  {
    id: "cseedlistmalibu0000000001",
    slug: "malibu-pacific-residence",
    owner: "owner1",
    featured: true,
    title: "Malibu Pacific Residence",
    summary: "Cliffside calm, endless Pacific light, and a kitchen made for long weekends.",
    description:
      "Soft limestone, wide decks, and a primary suite that opens to the horizon. Ideal for small teams or families seeking privacy with quick access to coastal trails and Malibu's creative scene.",
    propertyType: "Beach House",
    city: "Malibu",
    state: "California",
    country: "United States",
    postalCode: "90265",
    addressLine1: "28800 Pacific Coast Highway",
    lat: 34.0259,
    lng: -118.7798,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    beds: 5,
    nightlyRateCents: 385000,
    minNights: 3,
    cleaningFeeNote: "Beach path rinse station; housekeeping coordinated with owner.",
    sleepingArrangements: "Two oceanfront king suites; two queen rooms; office with daybed.",
    houseRules: "Outdoor music low after 9pm. No commercial shoots without approval.",
    checkInOut: "Gated entry; concierge greeting available on request.",
    cancellationPolicy: "Owner-managed; terms confirmed in writing before payment.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
    ],
    amenitySlugs: ["ocean-view", "chef-kitchen", "hot-tub", "ev-charging"],
  },
  {
    id: "cseedlistnapa000000000001",
    slug: "napa-vineyard-estate",
    owner: "owner2",
    featured: false,
    title: "Napa Vineyard Estate",
    summary: "Rows of cabernet at your doorstep, a cellar for collectors, and slow mornings on the terrace.",
    description:
      "A wine country compound with a chef's kitchen, outdoor hearth, and guest house. Perfect for long weekends that spill into Monday tastings.",
    propertyType: "Wine Country Retreat",
    city: "Napa",
    state: "California",
    country: "United States",
    postalCode: "94558",
    addressLine1: "1400 Silverado Trail",
    lat: 38.3492,
    lng: -122.2841,
    maxGuests: 12,
    bedrooms: 6,
    bathrooms: 6,
    beds: 7,
    nightlyRateCents: 450000,
    minNights: 3,
    cleaningFeeNote: "Estate fee disclosed in owner agreement.",
    sleepingArrangements: "Main house five suites; detached casita with king.",
    houseRules: "No parties over 20 guests. Pool fence alarms must remain armed.",
    checkInOut: "4pm arrival; vineyard walkthrough optional day one.",
    cancellationPolicy: "Direct with homeowner; peak weekends may require deposit.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
    ],
    amenitySlugs: ["wine-cellar", "pool", "chef-kitchen", "fireplace", "golf"],
  },
  {
    id: "cseedlistscotts0000000001",
    slug: "scottsdale-desert-atrium",
    owner: "owner3",
    featured: true,
    title: "Scottsdale Desert Atrium",
    summary: "Courtyard pools, soft desert light, and resort-quiet privacy.",
    description:
      "Indoor-outdoor living with rammed earth tones, a 50-foot pool, and a gym bathed in morning sun. Built for extended spring and winter escapes.",
    propertyType: "Desert Oasis",
    city: "Scottsdale",
    state: "Arizona",
    country: "United States",
    postalCode: "85251",
    addressLine1: "6120 Desert Fairways Drive",
    lat: 33.4942,
    lng: -111.9261,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5,
    beds: 6,
    nightlyRateCents: 275000,
    minNights: 4,
    cleaningFeeNote: "Pool heat optional; owner quotes seasonally.",
    sleepingArrangements: "Casita suite; four interior suites; bunk room optional for families.",
    houseRules: "No glass near pool. Pets considered case-by-case.",
    checkInOut: "Smart home tutorial on arrival.",
    cancellationPolicy: "Owner-managed; peak weeks are firm once contracted.",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80",
    ],
    amenitySlugs: ["pool", "gym", "chef-kitchen", "ev-charging"],
  },
  {
    id: "cseedlistjackson000000001",
    slug: "jackson-hole-timber-peaks",
    owner: "owner2",
    featured: false,
    title: "Jackson Hole Timber Peaks",
    summary: "Reclaimed timber great room, Teton glimpses, and après-fire ritual.",
    description:
      "A modern lodge with soaring ceilings, radiant heat, and mudroom built for serious ski weeks. Ideal for teams needing workspace and wellness space between mountain days.",
    propertyType: "Ski-in Ski-out",
    city: "Jackson",
    state: "Wyoming",
    country: "United States",
    postalCode: "83001",
    addressLine1: "1850 Moose Wilson Road",
    lat: 43.4799,
    lng: -110.7624,
    maxGuests: 9,
    bedrooms: 4,
    bathrooms: 4.5,
    beds: 5,
    nightlyRateCents: 310000,
    minNights: 5,
    cleaningFeeNote: "Boot dryers and gear storage included.",
    sleepingArrangements: "Two primary-caliber suites; bunk room; loft king.",
    houseRules: "No outdoor shoes past mudroom. Hot tub closes at midnight.",
    checkInOut: "4pm / 10am during peak.",
    cancellationPolicy: "Snow dates negotiated directly with homeowner.",
    images: [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1600&q=80",
    ],
    amenitySlugs: ["ski-locker", "hot-tub", "fireplace", "home-theater"],
  },
  {
    id: "cseedlist30a000000000001",
    slug: "30a-dune-house",
    owner: "owner3",
    featured: false,
    title: "30A Dune House",
    summary: "Sugar-white interiors, dune decks, and bikes for the timber trail.",
    description:
      "A coastal modern home set back from the bustle with curated art and a kitchen designed for long-table dinners after beach sunsets.",
    propertyType: "Beach House",
    city: "Santa Rosa Beach",
    state: "Florida",
    country: "United States",
    postalCode: "32459",
    addressLine1: "110 Dune Allen Lane",
    lat: 30.3166,
    lng: -86.1164,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3.5,
    beds: 5,
    nightlyRateCents: 198000,
    minNights: 4,
    cleaningFeeNote: "Sand management fee may apply for large groups.",
    sleepingArrangements: "Two kings; two queens; twin trundle room.",
    houseRules: "Rooftop quiet after 10pm. No fireworks.",
    checkInOut: "Meet at property or lockbox.",
    cancellationPolicy: "Owner handles all refunds and rebooks.",
    images: [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80",
    ],
    amenitySlugs: ["ocean-view", "pool", "chef-kitchen"],
  },
  {
    id: "cseedlistpalms0000000001",
    slug: "palm-springs-modern-oasis",
    owner: "owner3",
    featured: false,
    title: "Palm Springs Modern Oasis",
    summary: "Courtyard pool, mountain silhouette, and gallery-white walls.",
    description:
      "Classic desert modern lines with new systems and a primary suite that opens to water and sky. Perfect for groups who want calm, not crowds.",
    propertyType: "Desert Oasis",
    city: "Palm Springs",
    state: "California",
    country: "United States",
    postalCode: "92264",
    addressLine1: "780 Vista Chino",
    lat: 33.8003,
    lng: -116.5406,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    beds: 3,
    nightlyRateCents: 165000,
    minNights: 3,
    cleaningFeeNote: "Pool heat quoted separately in season.",
    sleepingArrangements: "Three king suites; one converts to twins on request.",
    houseRules: "No amplified music outdoors. Respect neighbors' privacy.",
    checkInOut: "4pm / 11am.",
    cancellationPolicy: "Direct homeowner agreement.",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
    ],
    amenitySlugs: ["pool", "gym", "fireplace", "ev-charging"],
  },
  {
    id: "cseedlistparkct0000000001",
    slug: "park-city-ledger-chalet",
    owner: "owner2",
    featured: true,
    title: "Park City Ledger Chalet",
    summary: "Warm minimalism, après terrace, and quick canyon access.",
    description:
      "A refined chalet with layered textures, a statement kitchen, and a lower-level lounge wired for screenings and strategy sessions alike.",
    propertyType: "Mountain Lodge",
    city: "Park City",
    state: "Utah",
    country: "United States",
    postalCode: "84060",
    addressLine1: "2650 Aspen Springs Drive",
    lat: 40.6461,
    lng: -111.498,
    maxGuests: 11,
    bedrooms: 5,
    bathrooms: 5,
    beds: 6,
    nightlyRateCents: 295000,
    minNights: 4,
    cleaningFeeNote: "Shuttle coordination available through owner.",
    sleepingArrangements: "Two primary suites; bunk room; two queens; office sleeper.",
    houseRules: "No smoking. Garage EV plug shared schedule.",
    checkInOut: "4pm / 10am peak weeks.",
    cancellationPolicy: "Owner-managed; peak holiday weeks non-refundable once contracted.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1600&q=80",
    ],
    amenitySlugs: ["ski-locker", "home-theater", "hot-tub", "chef-kitchen"],
  },
  {
    id: "cseedlistsonoma0000000001",
    slug: "sonoma-hill-villa",
    owner: "owner2",
    featured: false,
    title: "Sonoma Hill Villa",
    summary: "Olive trees, long sunsets, and a kitchen built for collaboration.",
    description:
      "Hilltop privacy minutes from Sonoma Plaza. Indoor-outdoor flow with a fire-lit courtyard and a study that doubles as a quiet war room.",
    propertyType: "Wine Country Retreat",
    city: "Sonoma",
    state: "California",
    country: "United States",
    postalCode: "95476",
    addressLine1: "880 Castle Road",
    lat: 38.2952,
    lng: -122.4587,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    beds: 4,
    nightlyRateCents: 245000,
    minNights: 3,
    cleaningFeeNote: "Optional daily tidy via owner's team.",
    sleepingArrangements: "All king-bedded suites; office with sleeper.",
    houseRules: "Events up to 16 with approval. No drones.",
    checkInOut: "Flexible with notice.",
    cancellationPolicy: "Handled directly with homeowner.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
    ],
    amenitySlugs: ["wine-cellar", "pool", "chef-kitchen", "concierge"],
  },
  {
    id: "cseedlisttelluride0000001",
    slug: "telluride-alpine-loft",
    owner: "owner1",
    featured: false,
    title: "Telluride Alpine Loft",
    summary: "Skybridge views, layered stone, and a kitchen for fireside suppers.",
    description:
      "Perched for alpenglow, this lofted residence pairs rugged materials with quiet luxury—ideal for small groups who want walkable charm and serious comfort.",
    propertyType: "Mountain Lodge",
    city: "Telluride",
    state: "Colorado",
    country: "United States",
    postalCode: "81435",
    addressLine1: "220 S Oak Street",
    lat: 37.9375,
    lng: -107.8123,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3.5,
    beds: 4,
    nightlyRateCents: 220000,
    minNights: 4,
    cleaningFeeNote: "Gear storage in building.",
    sleepingArrangements: "Three bedrooms: two kings, one queen; loft sitting area.",
    houseRules: "HOA quiet hours enforced.",
    checkInOut: "Meet greeter at lobby.",
    cancellationPolicy: "Owner-managed.",
    images: [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
    ],
    amenitySlugs: ["fireplace", "concierge", "ski-locker"],
  },
];

function ownerId(k: Home["owner"]): string {
  return U[k];
}

function main() {
  const lines: string[] = [];
  lines.push("-- LuxPads sample data (matches prisma/seed.ts demo content)");
  lines.push("-- Import AFTER migrations: mysql -u USER -p DATABASE < deploy/luxpads-sample-data.sql");
  lines.push("-- Demo password for all accounts below: LuxPads!demo123");
  lines.push("");
  lines.push("SET FOREIGN_KEY_CHECKS=0;");
  lines.push("SET NAMES utf8mb4;");
  lines.push("");
  lines.push("DELETE FROM `Message`;");
  lines.push("DELETE FROM `Conversation`;");
  lines.push("DELETE FROM `AdminAction`;");
  lines.push("DELETE FROM `Favorite`;");
  lines.push("DELETE FROM `AvailabilityBlock`;");
  lines.push("DELETE FROM `ListingAmenity`;");
  lines.push("DELETE FROM `ListingImage`;");
  lines.push("DELETE FROM `Listing`;");
  lines.push("DELETE FROM `OwnerProfile`;");
  lines.push("DELETE FROM `User`;");
  lines.push("DELETE FROM `FeaturedDestination`;");
  lines.push("DELETE FROM `Amenity`;");
  lines.push("");
  lines.push("SET FOREIGN_KEY_CHECKS=1;");
  lines.push("");

  for (const a of AMENITIES) {
    lines.push(
      `INSERT INTO \`Amenity\` (\`id\`,\`slug\`,\`label\`,\`category\`) VALUES (${q(a.id)},${q(a.slug)},${q(a.label)},${q(a.category)});`,
    );
  }
  lines.push("");

  const users: { id: string; email: string; name: string; role: string; phone: string | null }[] = [
    { id: U.admin, email: "admin@luxpads.co", name: "LuxPads Admin", role: "admin", phone: null },
    { id: U.owner1, email: "owner1@luxpads.co", name: "Elena Whitmore", role: "owner", phone: "+1 310 555 0142" },
    { id: U.owner2, email: "owner2@luxpads.co", name: "Marcus Chen", role: "owner", phone: null },
    { id: U.owner3, email: "owner3@luxpads.co", name: "Sofia Navarro", role: "owner", phone: null },
    { id: U.renter, email: "renter@luxpads.co", name: "Jordan Lee", role: "renter", phone: null },
  ];
  for (const u of users) {
    lines.push(
      `INSERT INTO \`User\` (\`id\`,\`email\`,\`emailVerified\`,\`passwordHash\`,\`name\`,\`phone\`,\`role\`,\`suspended\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(u.id)},${q(u.email)},NULL,${q(PASSWORD_HASH)},${q(u.name)},${u.phone ? q(u.phone) : "NULL"},${q(u.role)},0,${now3()},${now3()});`,
    );
  }
  lines.push("");

  lines.push(
    `INSERT INTO \`OwnerProfile\` (\`id\`,\`userId\`,\`displayName\`,\`bio\`,\`contactEmail\`,\`contactPhone\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(P.o1)},${q(U.owner1)},${q("Whitmore Estates")},${q("Curated mountain and coastal homes for memorable stays.")},${q("owner1@luxpads.co")},${q("+1 310 555 0142")},${now3()},${now3()});`,
  );
  lines.push(
    `INSERT INTO \`OwnerProfile\` (\`id\`,\`userId\`,\`displayName\`,\`bio\`,\`contactEmail\`,\`contactPhone\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(P.o2)},${q(U.owner2)},${q("Chen Collective")},${q("Architect-led residences across the Mountain West and wine country.")},${q("owner2@luxpads.co")},NULL,${now3()},${now3()});`,
  );
  lines.push(
    `INSERT INTO \`OwnerProfile\` (\`id\`,\`userId\`,\`displayName\`,\`bio\`,\`contactEmail\`,\`contactPhone\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(P.o3)},${q(U.owner3)},${q("Navarro Villas")},${q("Desert modernism and coastal calm—always owner-managed.")},${q("owner3@luxpads.co")},NULL,${now3()},${now3()});`,
  );
  lines.push("");

  let imgCounter = 0;
  let availCounter = 0;
  for (const h of homes) {
    const oid = ownerId(h.owner);
    lines.push(
      `INSERT INTO \`Listing\` (\`id\`,\`ownerId\`,\`slug\`,\`title\`,\`summary\`,\`description\`,\`propertyType\`,\`addressLine1\`,\`city\`,\`state\`,\`country\`,\`postalCode\`,\`latitude\`,\`longitude\`,\`maxGuests\`,\`bedrooms\`,\`bathrooms\`,\`beds\`,\`sleepingArrangements\`,\`houseRules\`,\`checkInOut\`,\`cancellationPolicy\`,\`nightlyRateCents\`,\`cleaningFeeNote\`,\`minNights\`,\`status\`,\`featured\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(h.id)},${q(oid)},${q(h.slug)},${q(h.title)},${q(h.summary)},${q(h.description)},${q(h.propertyType)},${q(h.addressLine1)},${q(h.city)},${q(h.state)},${q(h.country)},${q(h.postalCode)},${h.lat},${h.lng},${h.maxGuests},${h.bedrooms},${h.bathrooms},${h.beds},${q(h.sleepingArrangements)},${q(h.houseRules)},${q(h.checkInOut)},${q(h.cancellationPolicy)},${h.nightlyRateCents},${q(h.cleaningFeeNote)},${h.minNights},'published',${h.featured ? 1 : 0},${now3()},${now3()});`,
    );
    for (let i = 0; i < h.images.length; i++) {
      imgCounter++;
      const imgId = `cseedimg${String(imgCounter).padStart(6, "0")}`;
      lines.push(
        `INSERT INTO \`ListingImage\` (\`id\`,\`listingId\`,\`url\`,\`sortOrder\`,\`alt\`,\`createdAt\`) VALUES (${q(imgId)},${q(h.id)},${q(h.images[i])},${i},${q(h.title)},${now3()});`,
      );
    }
    for (const slug of h.amenitySlugs) {
      const aid = slugToAmenityId[slug];
      if (!aid) throw new Error(`Unknown amenity ${slug}`);
      lines.push(`INSERT INTO \`ListingAmenity\` (\`listingId\`,\`amenityId\`) VALUES (${q(h.id)},${q(aid)});`);
    }
    availCounter++;
    lines.push(
      `INSERT INTO \`AvailabilityBlock\` (\`id\`,\`listingId\`,\`startDate\`,\`endDate\`,\`type\`,\`note\`,\`createdAt\`) VALUES (${q(`cseedavail${String(availCounter).padStart(4, "0")}booked`)},${q(h.id)},'2026-01-20','2026-01-28','booked',${q("Private booking")},${now3()});`,
    );
    availCounter++;
    lines.push(
      `INSERT INTO \`AvailabilityBlock\` (\`id\`,\`listingId\`,\`startDate\`,\`endDate\`,\`type\`,\`note\`,\`createdAt\`) VALUES (${q(`cseedavail${String(availCounter).padStart(4, "0")}block`)},${q(h.id)},'2026-02-10','2026-02-14','blocked',${q("Owner maintenance")},${now3()});`,
    );
  }
  lines.push("");

  const firstListingId = homes[0]!.id;
  const firstOwnerId = ownerId(homes[0]!.owner);
  const convId = "cseedconv00000000000001";
  const msgId = "cseedmsg00000000000001";
  const demoThreadToken = "cafebabecafebabecafebabecafebabecafebabecafebabe";
  lines.push(
    `INSERT INTO \`Conversation\` (\`id\`,\`listingId\`,\`ownerId\`,\`renterName\`,\`renterEmail\`,\`renterPhone\`,\`renterUserId\`,\`checkIn\`,\`checkOut\`,\`guestCount\`,\`mailThreadToken\`,\`createdAt\`,\`updatedAt\`) VALUES (${q(convId)},${q(firstListingId)},${q(firstOwnerId)},${q("Jordan Lee")},${q("renter@luxpads.co")},${q("+1 415 555 0199")},${q(U.renter)},'2026-03-01','2026-03-06',4,${q(demoThreadToken)},${now3()},${now3()});`,
  );
  lines.push(
    `INSERT INTO \`Message\` (\`id\`,\`conversationId\`,\`senderRole\`,\`body\`,\`createdAt\`,\`readByOwnerAt\`,\`readByRenterAt\`) VALUES (${q(msgId)},${q(convId)},'renter',${q("We're a small production team looking for a quiet stay with strong Wi‑Fi and space for 4. Could you share your direct booking process and any references?")},${now3()},NULL,NULL);`,
  );
  lines.push("");

  const dests = [
    ["cseeddestaspen0000000001", "aspen", "Aspen & Snowmass", "Peak season energy, Rocky Mountain calm", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", 0],
    ["cseeddestmalibu000000001", "malibu", "Malibu Coast", "Pacific light, private decks", "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80", 1],
    ["cseeddestnapa00000000001", "napa-sonoma", "Napa & Sonoma", "Wine country weekends that linger", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80", 2],
    ["cseeddestpark0000000001", "park-city", "Park City", "Mountain town polish", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80", 3],
  ] as const;
  for (const [id, slug, name, subtitle, imageUrl, sortOrder] of dests) {
    lines.push(
      `INSERT INTO \`FeaturedDestination\` (\`id\`,\`slug\`,\`name\`,\`subtitle\`,\`imageUrl\`,\`sortOrder\`,\`active\`) VALUES (${q(id)},${q(slug)},${q(name)},${q(subtitle)},${q(imageUrl)},${sortOrder},1);`,
    );
  }
  lines.push("");

  lines.push(
    `INSERT INTO \`AdminAction\` (\`id\`,\`adminId\`,\`action\`,\`targetType\`,\`targetId\`,\`metadata\`,\`createdAt\`) VALUES (${q("cseedadminact0000000001")},${q(U.admin)},${q("sql_sample_import")},${q("system")},${q("sample-data")},CAST(${q(JSON.stringify({ listings: homes.length }))} AS JSON),${now3()});`,
  );

  const ws = createWriteStream(OUT);
  for (const line of lines) {
    ws.write(line + "\n");
  }
  ws.end();
  console.error("Wrote", OUT);
}

main();
