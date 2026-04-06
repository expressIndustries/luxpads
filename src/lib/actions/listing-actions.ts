"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { ListingStatus, type Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteStoredListingImage } from "@/lib/storage";
import { DRAFT_LISTING_FIELD_TEMPLATES } from "@/lib/listing-draft-templates";
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
        title: DRAFT_LISTING_FIELD_TEMPLATES.title,
        summary: DRAFT_LISTING_FIELD_TEMPLATES.summary,
        description: DRAFT_LISTING_FIELD_TEMPLATES.description,
        propertyType: "Estate",
        addressLine1: DRAFT_LISTING_FIELD_TEMPLATES.addressLine1,
        city: DRAFT_LISTING_FIELD_TEMPLATES.city,
        state: DRAFT_LISTING_FIELD_TEMPLATES.state,
        country: DRAFT_LISTING_FIELD_TEMPLATES.country,
        postalCode: DRAFT_LISTING_FIELD_TEMPLATES.postalCode,
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

const trim = z.string().transform((s) => s.trim());

const listingUpdateSchema = z.object({
  id: trim.pipe(z.string().min(10).max(64)),
  title: trim.pipe(z.string().min(1, "Title is required").max(200)),
  /** Always saved; shorter copy is allowed — UI nudges toward 20+ chars for search. */
  summary: trim.pipe(z.string().max(600)),
  description: trim.pipe(z.string().max(20000)),
  propertyType: trim.pipe(z.string().min(1, "Property type is required").max(80)),
  addressLine1: trim.pipe(z.string().min(1, "Address is required").max(200)),
  city: trim.pipe(z.string().min(1, "City is required").max(120)),
  state: trim.pipe(z.string().min(1, "State or region is required").max(120)),
  country: trim.pipe(z.string().min(1, "Country is required").max(120)),
  postalCode: trim.pipe(z.string().min(1, "Postal code is required").max(30)),
  latitude: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = typeof v === "number" ? v : Number(String(v).trim());
      return Number.isFinite(n) ? n : null;
    }),
  longitude: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = typeof v === "number" ? v : Number(String(v).trim());
      return Number.isFinite(n) ? n : null;
    }),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest").max(50),
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().min(0).max(30),
  beds: z.coerce.number().int().min(1, "At least 1 bed").max(40),
  sleepingArrangements: z.union([z.string(), z.null()]).transform((s) => (s == null ? null : s.slice(0, 8000))),
  houseRules: z.union([z.string(), z.null()]).transform((s) => (s == null ? null : s.slice(0, 8000))),
  checkInOut: z.union([z.string(), z.null()]).transform((s) => (s == null ? null : s.slice(0, 4000))),
  cancellationPolicy: z.union([z.string(), z.null()]).transform((s) => (s == null ? null : s.slice(0, 8000))),
  nightlyRateDollars: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().min(0, "Rate cannot be negative").max(1_000_000),
  ),
  cleaningFeeNote: z.union([z.string(), z.null()]).transform((s) => (s == null ? null : s.slice(0, 2000))),
  minNights: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 1 : v),
    z.coerce.number().int().min(1, "Minimum 1 night").max(365),
  ),
});

const SUMMARY_IDEAL_MIN = 20;
const DESCRIPTION_IDEAL_MIN = 40;

export type ListingSaveState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  warnings?: { summary?: string; description?: string };
};

function zodFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  const flat = err.flatten();
  const fe = flat.fieldErrors as Record<string, string[] | undefined>;
  for (const [key, msgs] of Object.entries(fe)) {
    const first = msgs?.[0];
    if (first) out[key] = first;
  }
  return out;
}

export async function updateListing(
  _prev: ListingSaveState,
  formData: FormData,
): Promise<ListingSaveState> {
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
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      maxGuests: formData.get("maxGuests"),
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      beds: formData.get("beds"),
      sleepingArrangements: formData.get("sleepingArrangements"),
      houseRules: formData.get("houseRules"),
      checkInOut: formData.get("checkInOut"),
      cancellationPolicy: formData.get("cancellationPolicy"),
      nightlyRateDollars: formData.get("nightlyRateDollars"),
      cleaningFeeNote: formData.get("cleaningFeeNote"),
      minNights: formData.get("minNights"),
    });

    if (!parsed.success) {
      return {
        fieldErrors: zodFieldErrors(parsed.error),
        error: "Fix the fields marked below and save again.",
      };
    }

    const data = parsed.data;
    const existing = await prisma.listing.findFirst({
      where: isAdmin ? { id: data.id } : { id: data.id, ownerId },
    });
    if (!existing) {
      return { error: "Listing not found or you don’t have access to edit it." };
    }

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

    const warnings: ListingSaveState["warnings"] = {};
    if (data.summary.length < SUMMARY_IDEAL_MIN) {
      warnings.summary = `Your summary is short (${data.summary.length} characters). For stronger search results, aim for at least ${SUMMARY_IDEAL_MIN} characters.`;
    }
    if (data.description.length < DESCRIPTION_IDEAL_MIN) {
      warnings.description = `Your description is short (${data.description.length} characters). Guests respond better with at least ${DESCRIPTION_IDEAL_MIN} characters.`;
    }
    return {
      ok: true,
      ...(Object.keys(warnings).length ? { warnings } : {}),
    };
  } catch {
    return { error: "Something went wrong while saving. Please try again." };
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

const DELETE_CONFIRMATION = "DELETE";

/**
 * Permanently remove a listing (cascades DB rows). Storage objects are removed first.
 * `confirmation` must equal {@link DELETE_CONFIRMATION} (checked server-side).
 */
export async function deleteListing(
  listingId: string,
  confirmation: string,
): Promise<{ error?: string; ok?: boolean }> {
  try {
    if (confirmation !== DELETE_CONFIRMATION) {
      return { error: `Type ${DELETE_CONFIRMATION} exactly to confirm permanent deletion.` };
    }
    const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
    const listing = await prisma.listing.findFirst({
      where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
      include: { images: { select: { url: true } } },
    });
    if (!listing) {
      return { error: "Listing not found or you don’t have permission to delete it." };
    }

    const slug = listing.slug;
    for (const img of listing.images) {
      await deleteStoredListingImage(img.url);
    }

    await prisma.listing.delete({ where: { id: listingId } });

    revalidatePath("/dashboard/listings");
    revalidatePath(`/dashboard/listings/${listingId}/edit`);
    revalidatePath(`/admin/listings/${listingId}/edit`);
    revalidatePath(`/listing/${slug}`);
    revalidatePath("/search");
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Could not delete this listing. Try again or contact support." };
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
  await deleteStoredListingImage(img.url);
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  revalidatePath(`/admin/listings/${listingId}/edit`);
}

export async function reorderListingImages(listingId: string, orderedIds: string[]) {
  const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
  const listing = await prisma.listing.findFirst({
    where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
    select: { id: true, slug: true },
  });
  if (!listing) throw new Error("Not found");

  const existing = await prisma.listingImage.findMany({
    where: { listingId },
    select: { id: true },
  });
  const allowed = new Set(existing.map((r) => r.id));
  if (orderedIds.length !== allowed.size || !orderedIds.every((id) => allowed.has(id))) {
    throw new Error("Invalid image order");
  }

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
  revalidatePath(`/listing/${listing.slug}`);
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/dashboard/listings");
  revalidatePath("/admin");
}

/** Move image to sortOrder 0 — used as hero on listing page and cards. */
export async function setHighlightListingImage(imageId: string, listingId: string) {
  const { userId: ownerId, isAdmin } = await requireOwnerOrAdmin();
  const listing = await prisma.listing.findFirst({
    where: isAdmin ? { id: listingId } : { id: listingId, ownerId },
    select: { id: true, slug: true, images: { orderBy: { sortOrder: "asc" }, select: { id: true } } },
  });
  if (!listing) throw new Error("Not found");
  const ids = listing.images.map((i) => i.id);
  if (!ids.includes(imageId)) throw new Error("Not found");
  const reordered = [imageId, ...ids.filter((id) => id !== imageId)];
  await prisma.$transaction(
    reordered.map((id, index) =>
      prisma.listingImage.updateMany({
        where: { id, listingId },
        data: { sortOrder: index },
      }),
    ),
  );
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  revalidatePath(`/admin/listings/${listingId}/edit`);
  revalidatePath(`/listing/${listing.slug}`);
  revalidatePath("/dashboard/listings");
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/admin");
}
