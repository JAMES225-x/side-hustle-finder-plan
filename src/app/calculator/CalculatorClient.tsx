"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  PiggyBank,
  Repeat,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPhp } from "@/lib/format";
import { labelDifficulty } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/Disclaimer";

export type CalcHustle = {
  slug: string;
  nameTl: string;
  category: string;
  incomeMinPhp: number;
  incomeMaxPhp: number;
  capitalMinPhp: number;
  capitalMaxPhp: number;
  breakevenMonths: number | null;
  timeToFirstPesoDays: number;
  unitLabel: string | null;
  avgPhpPerUnit: number | null;
};

export function CalculatorClient({
  hustles,
  zeroCapital,
  presetSlug,
}: {
  hustles: CalcHustle[];
  zeroCapital: Array<{ slug: string; nameTl: string; legitimacyScore: number }>;
  presetSlug?: string;
}) {
  const initialSlug = presetSlug && hustles.some((h) => h.slug === presetSlug) ? presetSlug : hustles[0]?.slug ?? "";
  const [slug, setSlug] = useState(initialSlug);

  const hustle = hustles.find((h) => h.slug === slug) ?? hustles[0];

  const maxTarget = Math.max(5000, hustle?.incomeMaxPhp ?? 50000);
  const minTarget = 2000;
  const defaultTarget = Math.min(
    Math.max(hustle?.incomeMinPhp || 10000, minTarget),
    maxTarget
  );
  const [target, setTarget] = useState(defaultTarget);

  const calc = useMemo(() => {
    if (!hustle) return null;

    const hasUnit = Boolean(hustle.unitLabel && hustle.avgPhpPerUnit && hustle.avgPhpPerUnit > 0);

    const unitsNeeded = hasUnit ? Math.ceil(target / (hustle.avgPhpPerUnit as number)) : null;
    const unitsPerWeek = unitsNeeded != null ? Math.ceil(unitsNeeded / 4) : null;

    // First-month realistic ramp: 30%–60% of the low-end estimate
    const rampLow = Math.round(hustle.incomeMinPhp * 0.3);
    const rampHigh = Math.max(rampLow, Math.round(hustle.incomeMinPhp * 0.6));

    // Break-even
    const monthlyNet = Math.max(1, Math.round(hustle.incomeMinPhp * 0.6));
    const breakeven =
      hustle.capitalMinPhp === 0
        ? 0
        : hustle.breakevenMonths ?? Math.max(1, Math.ceil(hustle.capitalMaxPhp / monthlyNet));

    return { hasUnit, unitsNeeded, unitsPerWeek, rampLow, rampHigh, breakeven };
  }, [hustle, target]);

  if (!hustle) {
    return <p className="text-sm text-ink-500">Walang naka-load na hustles pa.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <section className="surface animate-fade-up space-y-4 rounded-2xl p-4">
        <div className="space-y-1.5">
          <label htmlFor="hustle" className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
            1) Piliin ang raket
          </label>
          <select
            id="hustle"
            value={slug}
            onChange={(e) => {
              const next = hustles.find((h) => h.slug === e.target.value);
              setSlug(e.target.value);
              if (next) {
                setTarget(Math.min(Math.max(next.incomeMinPhp || 10000, 2000), Math.max(5000, next.incomeMaxPhp)));
              }
            }}
            className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {hustles.map((h) => (
              <option key={h.slug} value={h.slug}>
                {h.nameTl} — {h.category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="target" className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
              2) Target na kita / buwan
            </label>
            <span className="tabular rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
              {formatPhp(target)}
            </span>
          </div>
          <input
            id="target"
            type="range"
            min={minTarget}
            max={maxTarget}
            step={1000}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="tabular flex justify-between text-[10px] font-bold text-ink-400">
            <span>{formatPhp(minTarget)}</span>
            <span>{formatPhp(maxTarget)}</span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="animate-pop-in grid grid-cols-2 gap-2.5" key={`${slug}-${target}`}>
        <ResultCard
          icon={PiggyBank}
          label="Puhunan na kakailanganin"
          value={
            hustle.capitalMinPhp === hustle.capitalMaxPhp
              ? formatPhp(hustle.capitalMinPhp)
              : `${formatPhp(hustle.capitalMinPhp)}–${formatPhp(hustle.capitalMaxPhp)}`
          }
          sub={hustle.capitalMinPhp === 0 ? "Pwede sa ₱0" : "Simulan sa pinakamaliit na batch"}
        />
        <ResultCard
          icon={Repeat}
          label={calc?.hasUnit ? "Dapat ma-hit kada buwan" : "Volume strategy"}
          value={
            calc?.hasUnit
              ? `≈ ${calc.unitsNeeded?.toLocaleString()} ${hustle.unitLabel}`
              : "Walang fixed per-unit"
          }
          sub={
            calc?.hasUnit
              ? `≈ ${calc.unitsPerWeek?.toLocaleString()} kada linggo`
              : "Content/long-term play ito — consistency ang susi"
          }
        />
        <ResultCard
          icon={CalendarClock}
          label="Break-even estimate"
          value={calc?.breakeven === 0 ? "Kaagad (₱0 puhunan)" : `~${calc?.breakeven} buwan`}
          sub="Base sa 60% ng low-end kita"
        />
        <ResultCard
          icon={TrendingUp}
          label="Realistic first month"
          value={`${formatPhp(Math.min(calc?.rampLow ?? 0, target))}–${formatPhp(Math.min(calc?.rampHigh ?? 0, target))}`}
          sub="Habang nagra-ramp pa lang"
        />
      </section>

      <section className="surface animate-fade-up flex items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50">
            <Timer className="h-5 w-5 text-brand-600" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Unang kita</p>
            <p className="tabular text-sm font-extrabold text-ink-900">
              ~
              {hustle.timeToFirstPesoDays <= 7
                ? `${hustle.timeToFirstPesoDays} araw`
                : hustle.timeToFirstPesoDays >= 90
                  ? `${Math.round(hustle.timeToFirstPesoDays / 30)} buwan`
                  : `${Math.ceil(hustle.timeToFirstPesoDays / 7)} linggo`}
            </p>
          </div>
        </div>
        <Link
          href={`/hustles/${hustle.slug}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white shadow-sm shadow-brand-600/25 active:scale-95"
        >
          Buong guide <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </section>

      {/* ₱0 alternatives */}
      <section className="animate-fade-up space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-araw-500" strokeWidth={2.25} />
          <h2 className="text-sm font-extrabold tracking-tight text-ink-950">
            Pwede bang ₱0 puhunan?
          </h2>
        </div>
        {hustle.capitalMinPhp === 0 ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-800">
              Oo! Ang "{hustle.nameTl}" mismo ay ₱0 ang minimum na puhunan.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {zeroCapital.map((z) => (
              <Link key={z.slug} href={`/calculator?hustle=${z.slug}`}>
                <Badge
                  tone="brand"
                  className={cn("cursor-pointer px-3 py-1.5 text-xs", slug === z.slug && "ring-2 ring-brand-500")}
                >
                  {z.nameTl}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Disclaimer variant="estimates" />
    </div>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50">
        <Icon className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
      </div>
      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="tabular mt-1 text-[15px] font-extrabold leading-snug tracking-tight text-ink-950">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-ink-500">{sub}</p>
    </div>
  );
}
