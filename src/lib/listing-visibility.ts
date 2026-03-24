import type { Prisma } from "@prisma/client";
import { ListingStatus } from "@prisma/client";

/** Listings visible on public search and detail (not merchant of record — owner must have active membership). */
export function publicListingWhere(
  extra?: Prisma.ListingWhereInput,
): Prisma.ListingWhereInput {
  return {
    status: ListingStatus.published,
    owner: {
      suspended: false,
      subscription: {
        is: {
          status: { in: ["active", "trialing"] },
        },
      },
    },
    ...extra,
  };
}
