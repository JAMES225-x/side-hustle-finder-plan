import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  icon,
  title,
  description,
  right,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-extrabold leading-tight tracking-tight text-ink-950">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{description}</p>
          ) : null}
        </div>
      </div>
      {right}
    </div>
  );
}
