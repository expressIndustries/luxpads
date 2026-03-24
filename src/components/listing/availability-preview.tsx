import { blockedDatesSet } from "@/lib/availability";
import type { AvailabilityBlock } from "@prisma/client";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";

export function AvailabilityPreview({ blocks }: { blocks: Pick<AvailabilityBlock, "startDate" | "endDate">[] }) {
  const blocked = blockedDatesSet(blocks);
  const today = new Date();
  const months = [today, addMonths(today, 1), addMonths(today, 2)];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {months.map((m) => (
        <MonthMini key={m.toISOString()} month={m} blocked={blocked} />
      ))}
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
      <p className="mt-3 text-xs text-stone-500">Dark dates are blocked or booked on the owner calendar.</p>
    </div>
  );
}
