-- Opaque token for Mailgun reply+TOKEN@mail.luxpads.co routing (per conversation).

ALTER TABLE `Conversation` ADD COLUMN `mailThreadToken` VARCHAR(191) NULL;

UPDATE `Conversation`
SET `mailThreadToken` = LOWER(REPLACE(UUID(), '-', ''))
WHERE `mailThreadToken` IS NULL;

ALTER TABLE `Conversation` MODIFY `mailThreadToken` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `Conversation_mailThreadToken_key` ON `Conversation`(`mailThreadToken`);
