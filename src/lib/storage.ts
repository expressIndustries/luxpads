import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getUploadsRoot } from "@/lib/uploads-path";
import {
  deleteListingImageObject,
  isS3ListingStorageConfigured,
  listingImagesKeyPrefix,
  objectKeyFromStoredImageUrl,
  publicUrlForObjectKey,
  putListingImageObject,
} from "@/lib/s3-listing-images";

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
 * Saves listing photos to S3 when `AWS_BUCKET` + region are set; otherwise under
 * `public/uploads` (or `LUXPADS_UPLOADS_ROOT`) with URL `/uploads/...`.
 */
export async function saveUploadedImage(
  file: File,
  subfolder = "listings",
): Promise<StoredObject> {
  const ext = extensionForImageFile(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  if (isS3ListingStorageConfigured()) {
    const prefix = listingImagesKeyPrefix();
    const key = `${prefix}/${randomUUID()}${ext}`;
    await putListingImageObject(key, bytes, contentType);
    return { url: publicUrlForObjectKey(key), key };
  }

  const key = `${subfolder}/${randomUUID()}${ext}`;
  const root = getUploadsRoot();
  const dir = path.join(root, subfolder);
  await mkdir(dir, { recursive: true });
  const full = path.join(root, key);
  await writeFile(full, bytes);
  return { url: `/uploads/${key}`, key };
}

/**
 * Removes the file for a stored listing image URL (local `/uploads/...` or S3 object we own).
 */
export async function deleteStoredListingImage(imageUrl: string): Promise<void> {
  if (imageUrl.startsWith("/uploads/")) {
    const rel = imageUrl.replace(/^\/uploads\//, "");
    if (!rel || rel.includes("..")) return;
    const root = path.resolve(getUploadsRoot());
    const full = path.resolve(root, rel);
    if (full !== root && !full.startsWith(root + path.sep)) return;
    try {
      await unlink(full);
    } catch {
      /* missing file is fine */
    }
    return;
  }

  if (!isS3ListingStorageConfigured()) return;

  const objectKey = objectKeyFromStoredImageUrl(imageUrl);
  if (!objectKey) return;

  const prefix = listingImagesKeyPrefix();
  if (!objectKey.startsWith(`${prefix}/`)) return;

  try {
    await deleteListingImageObject(objectKey);
  } catch {
    /* avoid blocking DB delete if S3 returns an error */
  }
}
