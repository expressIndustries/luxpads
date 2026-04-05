"use client";

import {
  calendarInitialMonthOffset,
  explicitAvailableDatesSet,
  unavailableDatesSet,
} from "@/lib/availability";
import type { AvailabilityBlock } from "@prisma/client";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";

const WINDOW_SIZE = 3;

export function AvailabilityPreview({
  blocks,
}: {
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[];
}) {
  const blocksKey = useMemo(
    () =>
      blocks
        .map((b) => `${b.startDate.toString()}-${b.endDate.toString()}-${b.type}`)
        .join("|"),
    [blocks],
  );

  return <AvailabilityPreviewKeyed key={blocksKey} blocks={blocks} />;
}

function AvailabilityPreviewKeyed({
  blocks,
}: {
  blocks: Pick<AvailabilityBlock, "startDate" | "endDate" | "type">[];
}) {
  const unavailable = useMemo(() => unavailableDatesSet(blocks), [blocks]);
  const availableMarked = useMemo(() => explicitAvailableDatesSet(blocks), [blocks]);
  const [offset, setOffset] = useState(() => calendarInitialMonthOffset(blocks, WINDOW_SIZE));

  const anchor = startOfMonth(new Date());
  const firstMonth = addMonths(anchor, offset);
  const months = Array.from({ length: WINDOW_SIZE }, (_, i) => addMonths(firstMonth, i));

  const canGoEarlier = offset > 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          Showing {format(firstMonth, "MMMM yyyy")} – {format(addMonths(firstMonth, WINDOW_SIZE - 1), "MMMM yyyy")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoEarlier}
            onClick={() => setOffset((o) => Math.max(0, o - WINDOW_SIZE))}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Earlier
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => o + WINDOW_SIZE)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
          >
            Later →
          </button>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {months.map((m) => (
          <MonthMini key={format(m, "yyyy-MM")} month={m} unavailable={unavailable} availableMarked={availableMarked} />
        ))}
      </div>
      <p className="mt-6 text-xs text-stone-500">
        Dark dates are booked, booking in progress, or otherwise unavailable. Light green highlights dates the owner
        marked explicitly available. Unmarked open dates are still shown as open.
      </p>
    </div>
  );
}

function MonthMini({
  month,
  unavailable,
  availableMarked,
}: {
  month: Date;
  unavailable: Set<string>;
  availableMarked: Set<string>;
}) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const pad = (start.getDay() + 6) % 7;

  return (
    <div>
      <p className="text-center font-medium text-stone-900">{format(month, "MMMM yyyy")}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-stone-400">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: pad }).map((_, i) => (
          <span key={`p-${i}`} />
        ))}
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const isUnavailable = unavailable.has(key);
          const isAvailMarked = !isUnavailable && availableMarked.has(key);
          return (
            <span
              key={key}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${
                isUnavailable
                  ? "bg-stone-800 text-white"
                  : isAvailMarked
                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                    : "bg-white text-stone-700 ring-1 ring-stone-200"
              }`}
            >
              {format(d, "d")}
            </span>
          );
        })}
      </div>
    </div>
  );
}
