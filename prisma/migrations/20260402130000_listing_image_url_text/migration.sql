-- Listing image URLs can be full S3 / CDN URLs (longer than default VARCHAR).
ALTER TABLE `ListingImage` MODIFY `url` TEXT NOT NULL;
