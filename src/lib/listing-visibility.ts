import type { Prisma } from "@prisma/client";
import { ListingStatus } from "@prisma/client";

/** Listings visible on public search and detail (owner must not be suspended). */
export function publicListingWhere(
  extra?: Prisma.ListingWhereInput,
): Prisma.ListingWhereInput {
  return {
    status: ListingStatus.published,
    owner: {
      suspended: false,
    },
    ...extra,
  };
}
