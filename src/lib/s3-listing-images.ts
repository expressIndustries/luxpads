import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  awsBucket,
  awsRegion,
  isS3ListingStorageConfigured,
} from "@/lib/s3-env";

let cachedClient: S3Client | null | undefined;

export {
  awsBucket,
  awsRegion,
  isS3ListingStorageConfigured,
  listingImagesKeyPrefix,
  objectKeyFromStoredImageUrl,
  publicBaseUrlForListingImages,
  publicUrlForObjectKey,
} from "@/lib/s3-env";

export function getS3Client(): S3Client | null {
  if (!isS3ListingStorageConfigured()) return null;
  if (cachedClient === undefined) {
    const region = awsRegion();
    const key = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
    cachedClient = new S3Client({
      region,
      credentials:
        key && secret
          ? {
              accessKeyId: key,
              secretAccessKey: secret,
            }
          : undefined,
      forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === "true",
    });
  }
  return cachedClient;
}

export async function putListingImageObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const client = getS3Client();
  const bucket = awsBucket();
  if (!client || !bucket) throw new Error("S3 is not configured");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteListingImageObject(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = awsBucket();
  if (!client || !bucket) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
