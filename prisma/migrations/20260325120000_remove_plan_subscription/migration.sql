-- Remove owner subscription / Stripe plan tables (listings are free).

ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_planId_fkey`;

DROP TABLE `Subscription`;
DROP TABLE `Plan`;
