/** Env helpers for S3 listing images — no @aws-sdk import (safe for next.config.ts). */

export function awsRegion(): string {
  return (
    process.env.AWS_DEFAULT_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    ""
  );
}

export function awsBucket(): string | undefined {
  const b = process.env.AWS_BUCKET?.trim();
  return b || undefined;
}

export function isS3ListingStorageConfigured(): boolean {
  return Boolean(awsBucket() && awsRegion());
}

export function listingImagesKeyPrefix(): string {
  const p = process.env.AWS_S3_LISTING_PREFIX?.trim() || "listing-images";
  return p.replace(/^\/+|\/+$/g, "");
}

function defaultVirtualHostedBaseUrl(): string {
  const bucket = awsBucket()!;
  const region = awsRegion()!;
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function publicBaseUrlForListingImages(): string {
  const custom = process.env.AWS_S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  return custom || defaultVirtualHostedBaseUrl();
}

function joinBaseAndKey(base: string, key: string): string {
  const segments = key.split("/").map((s) => encodeURIComponent(s));
  return `${base.replace(/\/+$/, "")}/${segments.join("/")}`;
}

export function publicUrlForObjectKey(key: string): string {
  return joinBaseAndKey(publicBaseUrlForListingImages(), key);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function objectKeyFromStoredImageUrl(imageUrl: string): string | null {
  const bucket = awsBucket();
  if (!bucket) return null;

  let u: URL;
  try {
    u = new URL(imageUrl);
  } catch {
    return null;
  }

  const pathname = u.pathname.replace(/^\/+/, "");
  if (!pathname) return null;
  const decoded = decodeURIComponent(pathname);

  const custom = process.env.AWS_S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (custom) {
    try {
      const baseHost = new URL(custom).hostname;
      if (u.hostname === baseHost) return decoded;
    } catch {
      /* fall through */
    }
    if (imageUrl.startsWith(`${custom}/`)) {
      return imageUrl.slice(custom.length + 1);
    }
  }

  const region = awsRegion();
  const vh = `${bucket}.s3.${region}.amazonaws.com`;
  if (u.hostname === vh) return decoded;

  if (region === "us-east-1" && u.hostname === `${bucket}.s3.amazonaws.com`) {
    return decoded;
  }

  const bucketS3Re = new RegExp(`^${escapeRegex(bucket)}\\.s3([.-])`);
  if (bucketS3Re.test(u.hostname) && u.hostname.endsWith(".amazonaws.com")) {
    return decoded;
  }

  return null;
}

export function nextImageRemoteHostnames(): string[] {
  const bucket = process.env.AWS_BUCKET?.trim();
  const region = (
    process.env.AWS_DEFAULT_REGION ||
    process.env.AWS_REGION ||
    "us-east-1"
  ).trim();
  const extra = (process.env.NEXT_IMAGE_S3_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  const hosts = new Set<string>(extra);
  if (bucket) {
    hosts.add(`${bucket}.s3.${region}.amazonaws.com`);
    if (region === "us-east-1") {
      hosts.add(`${bucket}.s3.amazonaws.com`);
    }
  }

  const custom = process.env.AWS_S3_PUBLIC_BASE_URL?.trim();
  if (custom) {
    try {
      hosts.add(new URL(custom).hostname);
    } catch {
      /* ignore */
    }
  }

  return [...hosts];
}
