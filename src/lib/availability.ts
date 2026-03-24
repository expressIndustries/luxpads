import type { AvailabilityBlock } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";

/** Inclusive date-only range overlap (PostgreSQL @db.Date stored as UTC midnight). */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  const as = startOfDay(aStart).getTime();
  const ae = startOfDay(aEnd).getTime();
  const bs = startOfDay(bStart).getTime();
  const be = startOfDay(bEnd).getTime();
  return as <= be && bs <= ae;
}

export function isRangeBlocked(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate">[],
  checkIn: Date,
  checkOut: Date,
): boolean {
  return blocks.some((b) => rangesOverlap(checkIn, checkOut, b.startDate, b.endDate));
}

/** Build a Set of YYYY-MM-DD strings that are unavailable (inclusive block dates). */
export function blockedDatesSet(blocks: Pick<AvailabilityBlock, "startDate" | "endDate">[]) {
  const set = new Set<string>();
  for (const b of blocks) {
    let d = startOfDay(b.startDate);
    const end = startOfDay(b.endDate);
    while (!isAfterDay(d, end)) {
      set.add(d.toISOString().slice(0, 10));
      d = addDays(d, 1);
    }
  }
  return set;
}

function isAfterDay(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function mergeSuggestionsForICal(_listingId: string) {
  // Hook for future iCal import — keep API stable
  return { supported: false as const };
}
