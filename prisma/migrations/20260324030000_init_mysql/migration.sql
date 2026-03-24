-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('renter', 'owner', 'admin') NOT NULL DEFAULT 'renter',
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnerProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OwnerProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `stripePriceId` VARCHAR(191) NOT NULL,
    `stripeProductId` VARCHAR(191) NULL,
    `amountCents` INTEGER NOT NULL,
    `interval` VARCHAR(191) NOT NULL DEFAULT 'month',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plan_stripePriceId_key`(`stripePriceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `stripeCustomerId` VARCHAR(191) NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `status` ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete') NOT NULL DEFAULT 'incomplete',
    `currentPeriodEnd` DATETIME(3) NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_userId_key`(`userId`),
    UNIQUE INDEX `Subscription_stripeCustomerId_key`(`stripeCustomerId`),
    UNIQUE INDEX `Subscription_stripeSubscriptionId_key`(`stripeSubscriptionId`),
    INDEX `Subscription_stripeSubscriptionId_idx`(`stripeSubscriptionId`),
    INDEX `Subscription_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `propertyType` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'United States',
    `postalCode` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `maxGuests` INTEGER NOT NULL,
    `bedrooms` INTEGER NOT NULL,
    `bathrooms` DOUBLE NOT NULL,
    `beds` INTEGER NOT NULL,
    `sleepingArrangements` TEXT NULL,
    `houseRules` TEXT NULL,
    `checkInOut` TEXT NULL,
    `cancellationPolicy` TEXT NULL,
    `nightlyRateCents` INTEGER NOT NULL,
    `cleaningFeeNote` TEXT NULL,
    `minNights` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('draft', 'pending_review', 'published', 'suspended', 'archived') NOT NULL DEFAULT 'draft',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Listing_slug_key`(`slug`),
    INDEX `Listing_status_city_idx`(`status`, `city`),
    INDEX `Listing_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingImage` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `alt` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ListingImage_listingId_sortOrder_idx`(`listingId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Amenity` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,

    UNIQUE INDEX `Amenity_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingAmenity` (
    `listingId` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`listingId`, `amenityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AvailabilityBlock` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `type` ENUM('blocked', 'booked') NOT NULL DEFAULT 'blocked',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AvailabilityBlock_listingId_startDate_endDate_idx`(`listingId`, `startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inquiry` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `renterName` VARCHAR(191) NOT NULL,
    `renterEmail` VARCHAR(191) NOT NULL,
    `renterPhone` VARCHAR(191) NULL,
    `checkIn` DATE NULL,
    `checkOut` DATE NULL,
    `guestCount` INTEGER NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `renterUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Inquiry_listingId_idx`(`listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAction` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminAction_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Favorite_userId_listingId_key`(`userId`, `listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeaturedDestination` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `FeaturedDestination_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OwnerProfile` ADD CONSTRAINT `OwnerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingImage` ADD CONSTRAINT `ListingImage_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAmenity` ADD CONSTRAINT `ListingAmenity_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAmenity` ADD CONSTRAINT `ListingAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailabilityBlock` ADD CONSTRAINT `AvailabilityBlock_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_renterUserId_fkey` FOREIGN KEY (`renterUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAction` ADD CONSTRAINT `AdminAction_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

