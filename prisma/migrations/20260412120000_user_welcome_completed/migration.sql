-- AlterTable
ALTER TABLE `User` ADD COLUMN `welcomeCompletedAt` DATETIME(3) NULL;

-- Existing accounts skip the new welcome step
UPDATE `User` SET `welcomeCompletedAt` = `createdAt` WHERE `welcomeCompletedAt` IS NULL;
