-- Messaging: replace Inquiry with Conversation + Message (migrate existing rows).

ALTER TABLE `Inquiry` DROP FOREIGN KEY `Inquiry_listingId_fkey`;
ALTER TABLE `Inquiry` DROP FOREIGN KEY `Inquiry_renterUserId_fkey`;

CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `renterName` VARCHAR(191) NOT NULL,
    `renterEmail` VARCHAR(191) NOT NULL,
    `renterPhone` VARCHAR(191) NULL,
    `renterUserId` VARCHAR(191) NULL,
    `checkIn` DATE NULL,
    `checkOut` DATE NULL,
    `guestCount` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_listingId_renterEmail_key`(`listingId`, `renterEmail`),
    INDEX `Conversation_ownerId_idx`(`ownerId`),
    INDEX `Conversation_renterUserId_idx`(`renterUserId`),
    INDEX `Conversation_listingId_idx`(`listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderRole` ENUM('renter', 'owner') NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readByOwnerAt` DATETIME(3) NULL,
    `readByRenterAt` DATETIME(3) NULL,

    INDEX `Message_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Conversation` (`id`, `listingId`, `ownerId`, `renterName`, `renterEmail`, `renterPhone`, `renterUserId`, `checkIn`, `checkOut`, `guestCount`, `createdAt`, `updatedAt`)
SELECT
    MIN(i.`id`),
    i.`listingId`,
    l.`ownerId`,
    MAX(i.`renterName`),
    LOWER(TRIM(MAX(i.`renterEmail`))),
    MAX(i.`renterPhone`),
    MAX(i.`renterUserId`),
    MAX(i.`checkIn`),
    MAX(i.`checkOut`),
    MAX(i.`guestCount`),
    MIN(i.`createdAt`),
    MAX(i.`createdAt`)
FROM `Inquiry` i
INNER JOIN `Listing` l ON l.`id` = i.`listingId`
GROUP BY i.`listingId`, LOWER(TRIM(i.`renterEmail`));

INSERT INTO `Message` (`id`, `conversationId`, `senderRole`, `body`, `createdAt`, `readByOwnerAt`, `readByRenterAt`)
SELECT
    CONCAT(i.`id`, '_m'),
    c.`id`,
    'renter',
    i.`message`,
    i.`createdAt`,
    CASE WHEN i.`read` = 1 THEN i.`createdAt` ELSE NULL END,
    NULL
FROM `Inquiry` i
INNER JOIN `Conversation` c ON c.`listingId` = i.`listingId` AND c.`renterEmail` = LOWER(TRIM(i.`renterEmail`));

DROP TABLE `Inquiry`;

ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_renterUserId_fkey` FOREIGN KEY (`renterUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
