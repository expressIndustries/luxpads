-- Run once if demo listings exist but `featured` is 0 (e.g. older SQL import).
-- Then restart the app if you use aggressive caching (usually not needed).

UPDATE `Listing` SET `featured` = 1
WHERE `slug` IN (
  'aspen-ridge-glass-house',
  'malibu-pacific-residence',
  'scottsdale-desert-atrium',
  'park-city-ledger-chalet'
);
