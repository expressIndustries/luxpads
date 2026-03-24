import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const listingId = form.get("listingId");
  if (!(file instanceof File) || typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId: session.user.id },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  const agg = await prisma.listingImage.aggregate({
    where: { listingId },
    _max: { sortOrder: true },
  });
  const nextOrder = (agg._max.sortOrder ?? -1) + 1;
  const stored = await saveUploadedImage(file, "listings");
  const row = await prisma.listingImage.create({
    data: {
      listingId,
      url: stored.url,
      sortOrder: nextOrder,
      alt: listing.title,
    },
  });

  return NextResponse.json({ url: row.url, id: row.id });
}
