/** Max size per image for listing uploads (client + `/api/upload`). */
export const LISTING_IMAGE_MAX_BYTES = 15 * 1024 * 1024;

export function listingImageMaxSizeLabel(): string {
  return `${Math.round(LISTING_IMAGE_MAX_BYTES / (1024 * 1024))} MB`;
}
