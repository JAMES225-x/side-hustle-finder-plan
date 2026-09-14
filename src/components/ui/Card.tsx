import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface rounded-2xl p-4", className)} {...props} />;
}

export function CardInteractive({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("surface surface-hover rounded-2xl p-4", className)}
      {...props}
    />
  );
}
