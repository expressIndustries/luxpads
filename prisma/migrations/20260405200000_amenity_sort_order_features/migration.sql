-- Amenity display order + new outdoor/wellness features; remove concierge.

ALTER TABLE `Amenity` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

UPDATE `Amenity` SET `sortOrder` = 1000 WHERE `slug` = 'golf';

DELETE la FROM `ListingAmenity` la
  INNER JOIN `Amenity` a ON la.`amenityId` = a.`id`
  WHERE a.`slug` = 'concierge';

DELETE FROM `Amenity` WHERE `slug` = 'concierge';

INSERT INTO `Amenity` (`id`, `slug`, `label`, `category`, `sortOrder`) VALUES
('amenity_feat_fire_pit', 'fire-pit', 'Fire pit', 'Outdoor', 0),
('amenity_feat_out_pat', 'outdoor-furnished-patio', 'Outdoor furnished patio', 'Outdoor', 0),
('amenity_feat_mt_views', 'mountain-views', 'Mountain views', 'Outdoor', 0),
('amenity_feat_city_vue', 'city-views', 'City views', 'Outdoor', 0),
('amenity_feat_ebikes', 'ebikes-scooters', 'eBikes / eScooters', 'Outdoor', 0),
('amenity_feat_bbq', 'outdoor-bbq', 'Outdoor BBQ', 'Outdoor', 0),
('amenity_feat_sauna', 'sauna', 'Sauna', 'Wellness', 0),
('amenity_feat_cold_pl', 'cold-plunge', 'Cold plunge', 'Wellness', 0),
('amenity_feat_trails', 'trail-access', 'Trail access', 'Outdoor', 0),
('amenity_feat_dtwalk', 'downtown-walkable', 'Downtown walkable', 'Outdoor', 0);
