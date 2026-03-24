import type { SubscriptionStatus } from "@prisma/client";

const ACTIVE: SubscriptionStatus[] = ["active", "trialing"];

export function isSubscriptionActive(status: SubscriptionStatus | null | undefined) {
  return !!status && ACTIVE.includes(status);
}
