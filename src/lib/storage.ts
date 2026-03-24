import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredObject = { url: string; key: string };

/**
 * Local dev storage under /public/uploads. Swap for S3/Cloudinary in production.
 */
export async function saveUploadedImage(
  file: File,
  subfolder = "listings",
): Promise<StoredObject> {
  const ext = path.extname(file.name) || ".jpg";
  const key = `${subfolder}/${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const full = path.join(process.cwd(), "public", "uploads", key);
  await writeFile(full, bytes);
  return { url: `/uploads/${key}`, key };
}
