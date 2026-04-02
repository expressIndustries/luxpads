import path from "path";

/**
 * Directory where listing uploads are stored on disk.
 * Default: `<cwd>/public/uploads` (URLs stay `/uploads/...`).
 * Set `LUXPADS_UPLOADS_ROOT` when using a Docker volume or shared NFS so replicas share files.
 */
export function getUploadsRoot(): string {
  const override = process.env.LUXPADS_UPLOADS_ROOT?.trim();
  if (override) return path.resolve(override);
  return path.join(process.cwd(), "public", "uploads");
}

export function mimeForUploadExtension(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  if (e === ".gif") return "image/gif";
  return "image/jpeg";
}
