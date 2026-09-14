import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="surface animate-pop-in flex max-w-xs flex-col items-center gap-3 rounded-3xl p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass className="h-7 w-7" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-950">404 — Wala dito</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Baka na-move na ang page o mali ang link. Balik tayo sa legit na raket.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4" strokeWidth={2.25} />
              Umuwi muna
            </Button>
          </Link>
          <Link href="/hustles">
            <Button variant="secondary" className="w-full">
              Mag-browse ng raket
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
