import { clsx } from "clsx";

/** Bell + dot for “you have unread guest messages” in owner dashboard nav. */
export function UnreadMessagesIcon({ className }: { className?: string }) {
  return (
    <span className={clsx("relative inline-flex shrink-0 text-amber-600", className)} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-current">
        <path
          d="M12 3a5 5 0 00-5 5v2.5l-1.2 2.4A1 1 0 006.67 15h10.66a1 1 0 00.87-1.1L17 10.5V8a5 5 0 00-5-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 18a2 2 0 004 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
    </span>
  );
}
