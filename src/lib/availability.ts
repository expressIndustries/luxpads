import { AvailabilityBlockType, type AvailabilityBlock } from "@prisma/client";
import { addDays, differenceInCalendarMonths, format, startOfDay } from "date-fns";

/** Types that count as unavailable for guests (search + public calendar). */
export function isUnavailableBlockType(type: AvailabilityBlockType): boolean {
  return type === AvailabilityBlockType.booked || type === AvailabilityBlockType.booking_in_progress;
}

/** Inclusive date-only range overlap (DATE columns stored as UTC midnight). */
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
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
  checkIn: Date,
  checkOut: Date,
): boolean {
  return blocks
    .filter((b) => isUnavailableBlockType(b.type))
    .some((b) => rangesOverlap(checkIn, checkOut, b.startDate, b.endDate));
}

/** YYYY-MM-DD keys for dates that are unavailable to guests. */
export function unavailableDatesSet(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
): Set<string> {
  const set = new Set<string>();
  for (const b of blocks) {
    if (!isUnavailableBlockType(b.type)) continue;
    let d = startOfDay(b.startDate);
    const end = startOfDay(b.endDate);
    while (!isAfterDay(d, end)) {
      set.add(d.toISOString().slice(0, 10));
      d = addDays(d, 1);
    }
  }
  return set;
}

/** @deprecated Use unavailableDatesSet — same behavior for guest-facing calendars. */
export function blockedDatesSet(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
): Set<string> {
  return unavailableDatesSet(blocks);
}

/** Days explicitly marked Available by the owner (for subtle highlight). */
export function explicitAvailableDatesSet(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
): Set<string> {
  const unavailable = unavailableDatesSet(blocks);
  const set = new Set<string>();
  for (const b of blocks) {
    if (b.type !== AvailabilityBlockType.available) continue;
    let d = startOfDay(b.startDate);
    const end = startOfDay(b.endDate);
    while (!isAfterDay(d, end)) {
      const key = d.toISOString().slice(0, 10);
      if (!unavailable.has(key)) set.add(key);
      d = addDays(d, 1);
    }
  }
  return set;
}

function isAfterDay(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** First calendar day from today onward that is not unavailable (for default calendar view). */
export function firstGuestAvailableDate(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
): Date | null {
  const unavailable = unavailableDatesSet(blocks);
  const today = startOfDay(new Date());
  const cap = addDays(today, 800);
  for (let d = today; d.getTime() <= cap.getTime(); d = addDays(d, 1)) {
    const key = format(d, "yyyy-MM-dd");
    if (!unavailable.has(key)) return d;
  }
  return null;
}

/**
 * Earliest start date among owner `available` blocks that still apply on or after today.
 * Used to scroll the listing calendar to the first marketed open window (e.g. only Jan 2027 open).
 */
export function firstFutureAvailableBlockStart(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
): Date | null {
  const today = startOfDay(new Date());
  let best: Date | null = null;
  for (const b of blocks) {
    if (b.type !== AvailabilityBlockType.available) continue;
    const start = startOfDay(b.startDate);
    const end = startOfDay(b.endDate);
    if (end.getTime() < today.getTime()) continue;
    if (!best || start.getTime() < best.getTime()) best = start;
  }
  return best;
}

/** Month offset (in months, aligned to `windowSize` steps) so the first guest-available date appears in the grid. */
export function calendarInitialMonthOffset(
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[],
  windowSize: number,
): number {
  const anchor = startOfDay(new Date());
  const anchorMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const first =
    firstFutureAvailableBlockStart(blocks) ?? firstGuestAvailableDate(blocks);
  if (!first) return 0;
  const targetMonth = new Date(first.getFullYear(), first.getMonth(), 1);
  const diff = differenceInCalendarMonths(targetMonth, anchorMonth);
  return Math.max(0, Math.floor(diff / windowSize) * windowSize);
}

export function mergeSuggestionsForICal() {
  return { supported: false as const };
}
