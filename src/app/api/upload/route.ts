import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { LISTING_IMAGE_MAX_BYTES, listingImageMaxSizeLabel } from "@/lib/listing-image-upload-limits";
import { prisma } from "@/lib/prisma";
import { isAllowedListingImageMime, saveUploadedImage } from "@/lib/storage";

/** Max files per request (FormData can append many `file` entries). */
const MAX_FILES_PER_UPLOAD = 24;

export const maxDuration = 120;

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "owner" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const listingId = form.get("listingId");
  if (typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const files = form
    .getAll("file")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "No image files provided." }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json(
      { error: `You can upload at most ${MAX_FILES_PER_UPLOAD} images at once.` },
      { status: 400 },
    );
  }

  const listing = await prisma.listing.findFirst({
    where: role === "admin" ? { id: listingId } : { id: listingId, ownerId: session.user.id },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const maxLabel = listingImageMaxSizeLabel();
  for (const file of files) {
    if (!isAllowedListingImageMime(file.type)) {
      return NextResponse.json(
        { error: "Each file must be a JPEG, PNG, WebP, or GIF image." },
        { status: 400 },
      );
    }
    if (file.size > LISTING_IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { error: `Each image must be at most ${maxLabel} (${file.name}). Upload one at a time or compress the file.` },
        { status: 400 },
      );
    }
  }

  const agg = await prisma.listingImage.aggregate({
    where: { listingId },
    _max: { sortOrder: true },
  });
  let nextOrder = (agg._max.sortOrder ?? -1) + 1;

  const images: { id: string; url: string }[] = [];
  let storedOnLocalDisk = false;
  for (const file of files) {
    const stored = await saveUploadedImage(file, "listings");
    if (!stored.url.startsWith("http")) {
      storedOnLocalDisk = true;
    }
    const row = await prisma.listingImage.create({
      data: {
        listingId,
        url: stored.url,
        sortOrder: nextOrder,
        alt: listing.title,
      },
    });
    nextOrder += 1;
    images.push({ id: row.id, url: row.url });
  }

  if (storedOnLocalDisk && process.env.NODE_ENV === "production") {
    console.warn(
      "[upload] Image(s) written to local disk; S3 is off. Set AWS_BUCKET + AWS_DEFAULT_REGION (+ keys or IAM role). See .env.example.",
    );
  }

  return NextResponse.json({ images });
}
