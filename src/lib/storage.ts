import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredObject = { url: string; key: string };

/** Raster formats we accept for listing photos (extension chosen from MIME when possible). */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function isAllowedListingImageMime(mime: string): boolean {
  return Object.prototype.hasOwnProperty.call(MIME_TO_EXT, mime.toLowerCase());
}

function extensionForImageFile(file: File): string {
  const t = file.type.toLowerCase();
  if (MIME_TO_EXT[t]) return MIME_TO_EXT[t];
  const ext = path.extname(file.name).toLowerCase();
  if (ext === ".jpeg" || ext === ".jpe") return ".jpg";
  if ([".jpg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  return ".jpg";
}

/**
 * Local dev storage under /public/uploads. Swap for S3/Cloudinary in production.
 */
export async function saveUploadedImage(
  file: File,
  subfolder = "listings",
): Promise<StoredObject> {
  const ext = extensionForImageFile(file);
  const key = `${subfolder}/${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const full = path.join(process.cwd(), "public", "uploads", key);
  await writeFile(full, bytes);
  return { url: `/uploads/${key}`, key };
}
