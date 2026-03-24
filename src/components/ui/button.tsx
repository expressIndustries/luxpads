import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm border border-stone-900/10",
  secondary:
    "bg-white text-stone-900 border border-stone-200 hover:border-stone-300 hover:bg-stone-50",
  ghost: "text-stone-700 hover:bg-stone-100 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-red-700/20",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
