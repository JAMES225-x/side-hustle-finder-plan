import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const VARIANTS: Record<string, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 active:scale-[0.98]",
  secondary:
    "bg-white text-ink-800 ring-1 ring-ink-200 hover:bg-ink-50 active:scale-[0.98]",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/25 hover:bg-rose-700 active:scale-[0.98]",
};

const SIZES: Record<string, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-11 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-5 text-[15px] rounded-2xl gap-2",
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
