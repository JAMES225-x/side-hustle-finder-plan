import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "ink" | "brand" | "araw" | "green" | "yellow" | "red" | "blue";
};

const TONES: Record<string, string> = {
  ink: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
  araw: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  red: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  blue: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
};

export function Badge({ className, tone = "ink", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
