"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { ListingStatus, type Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

async function requireOwner() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/** Owner (their listing) or admin (any listing). */
async function requireOwnerOrAdmin(): Promise<{ userId: string; isAdmin: boolean }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const role = session.user.role as Role;
  if (role !== "owner" && role !== "admin") throw new Error("Unauthorized");
  return { userId: session.user.id, isAdmin: role === "admin" };
}

export async function createDraftListing(): Promise<{ id: string } | { error: string }> {
  try {
    const ownerId = await requireOwner();
    const slug = `draft-${randomUUID().slice(0, 10)}`;
    const listing = await prisma.listing.create({
      data: {
        ownerId,
        slug,
        title: "Untitled residence",
        summary: "Add a compelling one-paragraph summary for search results.",
        description:
          "Describe your home’s story, layout, and what makes it special for guests.",
        propertyType: "Estate",
        addressLine1: "Address — edit in listing settings",
        city: "City",
        state: "State",
        country: "United States",
        postalCode: "00000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        nightlyRateCents: 100000,
        minNights: 3,
        status: ListingStatus.draft,
      },
    });
    revalidatePath("/dashboard/listings");
    return { id: listing.id };
  } catch {
    return { error: "Could not create listing." };
  }
}

const listingUpdateSchema = z.object({
  id: z.string().min(10).max(64),
  title: z.string().min(3).max(200),
  summary: z.string().min(20).max(600),
  description: z.string().min(40).max(20000),
  propertyType: z.string().min(2).max(80),
  addressLine1: z.string().min(3).max(200),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(120),
  country: z.string().min(2).max(120),
  postalCode: z.string().min(3).max(30),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  maxGuests: z.coerce.number().int().min(1).max(50),
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().min(0).max(30),
  beds: z.coerce.number().int().min(1).max(40),
  sleepingArrangements: z.string().max(8000).optional().nullable(),
  houseRules: z.string().max(8000).optional().nullable(),
  checkInOut: z.string().max(4000).optional().nullable(),
  cancellationPolicy: z.string().max(8000).optional().nullable(),
  nightlyRateDollars: z.coerce.number().min(1).max(1000000),
  cleaningFeeNote: z.string().max(2000).optional().nullable(),
  minNights: z.coerce.number().int().min(1).max(365),
});

export async function updateListing(formData: FormData): Promise<void> {
  try {
    const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
    const amenitySlugs = formData.getAll("amenitySlugs").map(String).filter(Boolean);

    const parsed = listingUpdateSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      summary: formData.get("summary"),
      description: formData.get("description"),
      propertyType: formData.get("propertyType"),
      addressLine1: formData.get("addressLine1"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      postalCode: formData.get("postalCode"),
      latitude: formData.get("latitude") || null,
      longitude: formData.get("longitude") || null,
      maxGuests: formData.get("maxGuests"),
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      beds: formData.get("beds"),
      sleepingArrangements: formData.get("sleepingArrangements") || null,
      houseRules: formData.get("houseRules") || null,
      checkInOut: formData.get("checkInOut") || null,
      cancellationPolicy: formData.get("cancellationPolicy") || null,
      nightlyRateDollars: formData.get("nightlyRateDollars"),
      cleaningFeeNote: formData.get("cleaningFeeNote") || null,
      minNights: formData.get("minNights"),
    });

    if (!parsed.success) return;

    const data = parsed.data;
    const existing = await prisma.listing.findFirst({
      where: isAdmin ? { id: data.id } : { id: data.id, ownerId },
    });
    if (!existing) return;

    let slug = existing.slug;
    if (existing.status === ListingStatus.draft || existing.slug.startsWith("draft-")) {
      slug = uniqueSlug(data.title, randomUUID().slice(0, 8));
    }

    const validAmenities = await prisma.amenity.findMany({
      where: { slug: { in: amenitySlugs } },
      select: { slug: true },
    });
    const amenityCreates = validAmenities.map((a) => ({
      amenity: { connect: { slug: a.slug } },
    }));

    await prisma.$transaction([
      prisma.listingAmenity.deleteMany({ where: { listingId: data.id } }),
      prisma.listing.update({
        where: { id: data.id },
        data: {
          slug,
          title: data.title,
          summary: data.summary,
          description: data.description,
          propertyType: data.propertyType,
          addressLine1: data.addressLine1,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          maxGuests: data.maxGuests,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          beds: data.beds,
          sleepingArrangements: data.sleepingArrangements,
          houseRules: data.houseRules,
          checkInOut: data.checkInOut,
          cancellationPolicy: data.cancellationPolicy,
          nightlyRateCents: Math.round(data.nightlyRateDollars * 100),
          cleaningFeeNote: data.cleaningFeeNote,
          minNights: data.minNights,
          amenities: {
            create: amenityCreates,
          },
        },
      }),
    ]);

    revalidatePath(`/dashboard/listings/${data.id}/edit`);
    revalidatePath(`/admin/listings/${data.id}/edit`);
    revalidatePath(`/listing/${slug}`);
    revalidatePath("/search");
    revalidatePath("/admin");
  } catch {
    /* noop */
  }
}

export async function publishListing(listingId: string): Promise<{ error?: string; ok?: boolean }> {
  try {
    const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();

    const listing = await prisma.listing.findFirst({
      where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
      include: { images: true },
    });
    if (!listing) return { error: "Listing not found." };
    if (!listing.images.length) {
      return { error: "Add at least one photo before publishing." };
    }

    const requireApproval = process.env.REQUIRE_LISTING_APPROVAL === "true";
    const status = requireApproval ? ListingStatus.pending_review : ListingStatus.published;

    const newSlug = listing.slug.startsWith("draft-")
      ? uniqueSlug(listing.title, randomUUID().slice(0, 8))
      : listing.slug;

    await prisma.listing.update({
      where: { id: listingId },
      data: { status, slug: newSlug },
    });

    revalidatePath("/dashboard/listings");
    revalidatePath(`/admin/listings/${listingId}/edit`);
    revalidatePath("/search");
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Could not publish." };
  }
}

export async function unpublishListing(listingId: string) {
  try {
    const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
    await prisma.listing.updateMany({
      where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
      data: { status: ListingStatus.draft },
    });
    revalidatePath("/dashboard/listings");
    revalidatePath(`/admin/listings/${listingId}/edit`);
    revalidatePath("/search");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch {
    return { error: "Could not unpublish." };
  }
}

export async function deleteListingImage(imageId: string, listingId: string) {
  const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
  const img = await prisma.listingImage.findFirst({
    where: isAdmin
      ? { id: imageId, listingId }
      : { id: imageId, listingId, listing: { ownerId } },
  });
  if (!img) throw new Error("Not found");
  await prisma.listingImage.delete({ where: { id: imageId } });
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  revalidatePath(`/admin/listings/${listingId}/edit`);
}

export async function reorderListingImages(listingId: string, orderedIds: string[]) {
  const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
  const listing = await prisma.listing.findFirst({
    where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
  });
  if (!listing) throw new Error("Not found");
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.listingImage.updateMany({
        where: { id, listingId },
        data: { sortOrder: index },
      }),
    ),
  );
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  revalidatePath(`/admin/listings/${listingId}/edit`);
}
