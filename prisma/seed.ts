/**
 * ⚠️ Destructive: deletes all application rows before inserting demo data.
 * To keep your current data, run `npm run db:backup` or `npm run db:backup:docker` first;
 * restore with `npm run db:restore <file>` (add `:docker` if you use the docker backup path).
 * Do not run this against a database you need to preserve.
 */
import { randomBytes } from "crypto";
import { PrismaClient, Role, ListingStatus, AvailabilityBlockType, MessageSender } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.featuredDestination.deleteMany();
  await prisma.amenity.deleteMany();

  const password = await hash("LuxPads!demo123", 12);

  await prisma.amenity.createMany({
    data: [
      { slug: "pool", label: "Heated pool", category: "Outdoor", sortOrder: 0 },
      { slug: "hot-tub", label: "Hot tub", category: "Outdoor", sortOrder: 0 },
      { slug: "chef-kitchen", label: "Chef's kitchen", category: "Interior", sortOrder: 0 },
      { slug: "wine-cellar", label: "Wine cellar", category: "Interior", sortOrder: 0 },
      { slug: "home-theater", label: "Private theater", category: "Interior", sortOrder: 0 },
      { slug: "gym", label: "Fitness studio", category: "Wellness", sortOrder: 0 },
      { slug: "fireplace", label: "Statement fireplace", category: "Interior", sortOrder: 0 },
      { slug: "ev-charging", label: "EV charging", category: "Parking", sortOrder: 0 },
      { slug: "ski-locker", label: "Ski locker / mudroom", category: "Outdoor", sortOrder: 0 },
      { slug: "ocean-view", label: "Ocean views", category: "Outdoor", sortOrder: 0 },
      { slug: "fire-pit", label: "Fire pit", category: "Outdoor", sortOrder: 0 },
      { slug: "outdoor-furnished-patio", label: "Outdoor furnished patio", category: "Outdoor", sortOrder: 0 },
      { slug: "mountain-views", label: "Mountain views", category: "Outdoor", sortOrder: 0 },
      { slug: "city-views", label: "City views", category: "Outdoor", sortOrder: 0 },
      { slug: "ebikes-scooters", label: "eBikes / eScooters", category: "Outdoor", sortOrder: 0 },
      { slug: "outdoor-bbq", label: "Outdoor BBQ", category: "Outdoor", sortOrder: 0 },
      { slug: "sauna", label: "Sauna", category: "Wellness", sortOrder: 0 },
      { slug: "cold-plunge", label: "Cold plunge", category: "Wellness", sortOrder: 0 },
      { slug: "trail-access", label: "Trail access", category: "Outdoor", sortOrder: 0 },
      { slug: "downtown-walkable", label: "Downtown walkable", category: "Outdoor", sortOrder: 0 },
      { slug: "golf", label: "Golf access", category: "Outdoor", sortOrder: 1000 },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@luxpads.co",
      passwordHash: password,
      name: "LuxPads Admin",
      role: Role.admin,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: "owner1@luxpads.co",
      passwordHash: password,
      name: "Elena Whitmore",
      role: Role.owner,
      phone: "+1 310 555 0142",
      ownerProfile: {
        create: {
          displayName: "Whitmore Estates",
          bio: "Curated mountain and coastal homes for memorable stays.",
          contactEmail: "owner1@luxpads.co",
          contactPhone: "+1 310 555 0142",
        },
      },
    },
    include: { ownerProfile: true },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "owner2@luxpads.co",
      passwordHash: password,
      name: "Marcus Chen",
      role: Role.owner,
      ownerProfile: {
        create: {
          displayName: "Chen Collective",
          bio: "Architect-led residences across the Mountain West and wine country.",
          contactEmail: "owner2@luxpads.co",
        },
      },
    },
    include: { ownerProfile: true },
  });

  const owner3 = await prisma.user.create({
    data: {
      email: "owner3@luxpads.co",
      passwordHash: password,
      name: "Sofia Navarro",
      role: Role.owner,
      ownerProfile: {
        create: {
          displayName: "Navarro Villas",
          bio: "Desert modernism and coastal calm—always owner-managed.",
          contactEmail: "owner3@luxpads.co",
        },
      },
    },
    include: { ownerProfile: true },
  });

  await prisma.user.create({
    data: {
      email: "renter@luxpads.co",
      passwordHash: password,
      name: "Jordan Lee",
      role: Role.renter,
    },
  });

  const homes: Array<{
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
    ownerId: string;
  }> = [
    {
      slug: "aspen-ridge-glass-house",
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
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      ],
      amenitySlugs: ["pool", "hot-tub", "chef-kitchen", "fireplace", "ski-locker"],
      ownerId: owner1.id,
    },
    {
      slug: "malibu-pacific-residence",
      title: "Malibu Pacific Residence",
      summary: "Cliffside calm, endless Pacific light, and a kitchen made for long weekends.",
      description:
        "Soft limestone, wide decks, and a primary suite that opens to the horizon. Ideal for small teams or families seeking privacy with quick access to coastal trails and Malibu’s creative scene.",
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
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      ],
      amenitySlugs: ["ocean-view", "chef-kitchen", "hot-tub", "ev-charging"],
      ownerId: owner1.id,
    },
    {
      slug: "napa-vineyard-estate",
      title: "Napa Vineyard Estate",
      summary: "Rows of cabernet at your doorstep, a cellar for collectors, and slow mornings on the terrace.",
      description:
        "A wine country compound with a chef’s kitchen, outdoor hearth, and guest house. Perfect for long weekends that spill into Monday tastings.",
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
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
      ],
      amenitySlugs: ["wine-cellar", "pool", "chef-kitchen", "fireplace", "golf"],
      ownerId: owner2.id,
    },
    {
      slug: "scottsdale-desert-atrium",
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
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80",
      ],
      amenitySlugs: ["pool", "gym", "chef-kitchen", "ev-charging"],
      ownerId: owner3.id,
    },
    {
      slug: "jackson-hole-timber-peaks",
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
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1600&q=80",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1600&q=80",
      ],
      amenitySlugs: ["ski-locker", "hot-tub", "fireplace", "home-theater"],
      ownerId: owner2.id,
    },
    {
      slug: "30a-dune-house",
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
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1600&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80",
      ],
      amenitySlugs: ["ocean-view", "pool", "chef-kitchen"],
      ownerId: owner3.id,
    },
    {
      slug: "palm-springs-modern-oasis",
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
      houseRules: "No amplified music outdoors. Respect neighbors’ privacy.",
      checkInOut: "4pm / 11am.",
      cancellationPolicy: "Direct homeowner agreement.",
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
      ],
      amenitySlugs: ["pool", "gym", "fireplace", "ev-charging"],
      ownerId: owner3.id,
    },
    {
      slug: "park-city-ledger-chalet",
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
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
        "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1600&q=80",
      ],
      amenitySlugs: ["ski-locker", "home-theater", "hot-tub", "chef-kitchen"],
      ownerId: owner2.id,
    },
    {
      slug: "sonoma-hill-villa",
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
      cleaningFeeNote: "Optional daily tidy via owner’s team.",
      sleepingArrangements: "All king-bedded suites; office with sleeper.",
      houseRules: "Events up to 16 with approval. No drones.",
      checkInOut: "Flexible with notice.",
      cancellationPolicy: "Handled directly with homeowner.",
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      ],
      amenitySlugs: ["wine-cellar", "pool", "chef-kitchen", "downtown-walkable"],
      ownerId: owner2.id,
    },
    {
      slug: "telluride-alpine-loft",
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
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1600&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
      ],
      amenitySlugs: ["fireplace", "mountain-views", "ski-locker"],
      ownerId: owner1.id,
    },
  ];

  for (const h of homes) {
    const listing = await prisma.listing.create({
      data: {
        ownerId: h.ownerId,
        slug: h.slug,
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
        amenities: {
          create: h.amenitySlugs.map((slug) => ({
            amenity: { connect: { slug } },
          })),
        },
        images: {
          create: h.images.map((url, i) => ({
            url,
            sortOrder: i,
            alt: h.title,
          })),
        },
      },
    });

    await prisma.availabilityBlock.create({
      data: {
        listingId: listing.id,
        startDate: new Date("2026-01-20"),
        endDate: new Date("2026-01-28"),
        type: AvailabilityBlockType.booked,
        note: "Private booking",
      },
    });
    await prisma.availabilityBlock.create({
      data: {
        listingId: listing.id,
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-14"),
        type: AvailabilityBlockType.booked,
        note: "Owner maintenance",
      },
    });
  }

  const firstListing = await prisma.listing.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstListing) {
    const renterUser = await prisma.user.findFirst({ where: { email: "renter@luxpads.co" } });
    await prisma.conversation.create({
      data: {
        listingId: firstListing.id,
        ownerId: firstListing.ownerId,
        renterName: "Jordan Lee",
        renterEmail: "renter@luxpads.co",
        renterPhone: "+1 415 555 0199",
        renterUserId: renterUser?.id ?? null,
        checkIn: new Date("2026-03-01"),
        checkOut: new Date("2026-03-06"),
        guestCount: 4,
        mailThreadToken: randomBytes(24).toString("hex"),
        messages: {
          create: {
            senderRole: MessageSender.renter,
            body: "We're a small production team looking for a quiet stay with strong Wi‑Fi and space for 4. Could you share your direct booking process and any references?",
          },
        },
      },
    });
  }

  await prisma.featuredDestination.createMany({
    data: [
      {
        slug: "aspen",
        name: "Aspen & Snowmass",
        subtitle: "Peak season energy, Rocky Mountain calm",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        sortOrder: 0,
      },
      {
        slug: "malibu",
        name: "Malibu Coast",
        subtitle: "Pacific light, private decks",
        imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
        sortOrder: 1,
      },
      {
        slug: "napa-sonoma",
        name: "Napa & Sonoma",
        subtitle: "Wine country weekends that linger",
        imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
        sortOrder: 2,
      },
      {
        slug: "park-city",
        name: "Park City",
        subtitle: "Mountain town polish",
        imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
        sortOrder: 3,
      },
    ],
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "seed_complete",
      targetType: "system",
      targetId: "seed",
      metadata: { listings: homes.length },
    },
  });

  console.log("Seed complete.");
  console.log("Admin:", "admin@luxpads.co");
  console.log("Owners:", "owner1@luxpads.co", "owner2@luxpads.co", "owner3@luxpads.co");
  console.log("Renter:", "renter@luxpads.co");
  console.log("Password for all:", "LuxPads!demo123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
