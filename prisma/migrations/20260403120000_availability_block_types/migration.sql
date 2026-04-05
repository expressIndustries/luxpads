-- Replace blocked/booked enum with available / booking_in_progress / booked.
-- Legacy `blocked` rows become `booked` (unavailable).

ALTER TABLE `AvailabilityBlock` MODIFY COLUMN `type` VARCHAR(32) NOT NULL DEFAULT 'blocked';

UPDATE `AvailabilityBlock` SET `type` = 'booked' WHERE `type` = 'blocked';

ALTER TABLE `AvailabilityBlock` MODIFY COLUMN `type` ENUM('available', 'booking_in_progress', 'booked') NOT NULL DEFAULT 'available';
