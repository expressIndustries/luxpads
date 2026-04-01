import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Listing "Hosted by" line: "Daniel Green" → "Daniel G."; one word left as-is.
 */
export function formatHostDisplayName(raw: string): string {
  const s = raw.trim().replace(/\s+/g, " ");
  if (!s) return "Homeowner";
  const parts = s.split(" ");
  if (parts.length === 1) return parts[0]!;
  const first = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1]!;
  const initial = last[0];
  if (!initial) return first;
  return `${first} ${initial.toUpperCase()}.`;
}
