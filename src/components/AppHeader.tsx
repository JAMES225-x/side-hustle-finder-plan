"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck, UserCircle } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/cn";

const ROOT_PATHS = new Set(["/"]);

export function AppHeader() {
  const pathname = usePathname();
  const isHome = ROOT_PATHS.has(pathname);
  const [initial, setInitial] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = (await res.json()) as {
          ok: boolean;
          user: { name: string | null; email: string | null; isGuest: boolean } | null;
        };
        if (!cancelled && json.ok && json.user && !json.user.isGuest) {
          setInitial((json.user.name?.trim()?.[0] ?? json.user.email?.[0] ?? "U").toUpperCase());
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2.5">
          {!isHome ? (
            <button
              type="button"
              onClick={() => history.back()}
              aria-label="Bumalik"
              className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
            </button>
          ) : null}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-[13px] font-extrabold tracking-tight text-ink-950">
                Side Hustle Finder
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                Pilipinas
              </p>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/scam-shield"
            aria-label="Scam check"
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors hover:bg-brand-100 active:scale-95"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 transition-colors active:scale-95",
              initial
                ? "bg-brand-600 text-white ring-brand-700 text-xs font-extrabold"
                : "bg-ink-100 text-ink-500 ring-ink-100 hover:bg-ink-200"
            )}
          >
            {initial ?? <UserCircle className="h-5 w-5" strokeWidth={2} />}
          </Link>
        </div>
      </div>
    </header>
  );
}
