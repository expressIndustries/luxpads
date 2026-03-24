import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-stone-200/80 bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.04)]", className)}
      {...props}
    />
  );
}
