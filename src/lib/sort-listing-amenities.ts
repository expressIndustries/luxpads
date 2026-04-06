/**
 * Sort listing↔amenity join rows for display (sortOrder, then label).
 * Prefer this over Prisma nested `orderBy` on `amenity.sortOrder` — avoids client/schema drift
 * and works reliably across Prisma versions.
 */
export function sortListingAmenitiesForDisplay<
  T extends { amenity: { sortOrder: number; label: string } },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const d = a.amenity.sortOrder - b.amenity.sortOrder;
    if (d !== 0) return d;
    return a.amenity.label.localeCompare(b.amenity.label);
  });
}
