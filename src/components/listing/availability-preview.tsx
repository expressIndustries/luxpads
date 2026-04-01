"use client";

import { blockedDatesSet } from "@/lib/availability";
import type { AvailabilityBlock } from "@prisma/client";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";

const WINDOW_SIZE = 3;

export function AvailabilityPreview({ blocks }: { blocks: Pick<AvailabilityBlock, "startDate" | "endDate">[] }) {
  const blocked = useMemo(() => blockedDatesSet(blocks), [blocks]);
  const [offset, setOffset] = useState(0);

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
          <MonthMini key={format(m, "yyyy-MM")} month={m} blocked={blocked} />
        ))}
      </div>
      <p className="mt-6 text-xs text-stone-500">Dark dates are blocked or booked on the owner calendar.</p>
    </div>
  );
}

function MonthMini({ month, blocked }: { month: Date; blocked: Set<string> }) {
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
          const isBlocked = blocked.has(key);
          return (
            <span
              key={key}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${
                isBlocked ? "bg-stone-800 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"
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
