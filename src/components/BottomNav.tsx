"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, ShieldAlert, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; match: string[] };

const ITEMS: Item[] = [
  { href: "/", label: "Home", match: ["/"] },
  { href: "/hustles", label: "Raket", match: ["/hustles"] },
  { href: "/quiz", label: "Match", match: ["/quiz"] },
  { href: "/scam-shield", label: "Scam", match: ["/scam-shield"] },
  { href: "/tracker", label: "Kita", match: ["/tracker"] },
];

function isActive(pathname: string, item: Item) {
  if (item.href === "/") return pathname === "/";
  return item.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

const ICONS = {
  "/": Home,
  "/hustles": Briefcase,
  "/quiz": Sparkles,
  "/scam-shield": ShieldAlert,
  "/tracker": Wallet,
} as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50"
      aria-label="Pangunahing nabigasyon"
    >
      <div className="mx-auto w-full max-w-md border-t border-ink-100 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="grid grid-cols-5 px-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = ICONS[item.href as keyof typeof ICONS];
            const isQuiz = item.href === "/quiz";
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center justify-center gap-0.5 py-1"
              >
                <span
                  className={cn(
                    "grid h-10 w-14 place-items-center rounded-full transition-all duration-200",
                    isQuiz
                      ? active
                        ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                        : "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-400 group-active:bg-ink-50"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", isQuiz && "h-[22px] w-[22px]")}
                    strokeWidth={active || isQuiz ? 2.5 : 2}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold leading-none tracking-wide",
                    isQuiz
                      ? "text-brand-700"
                      : active
                        ? "text-brand-700"
                        : "text-ink-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
