import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { hustles } from "@/db/schema";
import {
  AlertTriangle,
  Banknote,
  Bike,
  Calculator,
  Car,
  Check,
  ExternalLink,
  Laptop,
  ListOrdered,
  MapPin,
  Quote,
  Scale,
  Smartphone,
  Star,
  Timer,
  Wallet,
  Wifi,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPhp, formatPhpRange } from "@/lib/format";
import { labelDevice, labelDifficulty, labelInternet, labelSkill } from "@/lib/labels";
import { categoryStyle, hustleIcon } from "@/lib/hustleIcon";
import { Badge } from "@/components/ui/Badge";
import { SaveButton } from "@/components/SaveButton";
import { Disclaimer } from "@/components/Disclaimer";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DIFF_TONE = { easy: "green", medium: "araw", hard: "red" } as const;
const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  phone: Smartphone,
  laptop: Laptop,
  motor: Bike,
  car: Car,
};

type StepBlock = { title: string; items: string[] };
type SupplierBlock = { title: string; links: Array<{ label: string; url: string }> };

export default async function HustleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rows = await db.select().from(hustles).where(eq(hustles.slug, slug)).limit(1);
  const hustle = rows[0];
  if (!hustle) notFound();

  const Icon = hustleIcon(hustle.slug, hustle.category);
  const cs = categoryStyle(hustle.category);
  const steps = (hustle.steps ?? []) as StepBlock[];
  const suppliers = (hustle.suppliers ?? []) as SupplierBlock[];

  const stats = [
    {
      icon: Banknote,
      label: "Tantiyang kita",
      value: formatPhpRange(hustle.incomeMinPhp, hustle.incomeMaxPhp, hustle.incomePeriod),
    },
    {
      icon: Wallet,
      label: "Puhunan",
      value:
        hustle.capitalMinPhp === hustle.capitalMaxPhp
          ? formatPhp(hustle.capitalMinPhp)
          : `${formatPhp(hustle.capitalMinPhp)} – ${formatPhp(hustle.capitalMaxPhp)}`,
    },
    {
      icon: Timer,
      label: "Unang kita",
      value:
        hustle.timeToFirstPesoDays <= 7
          ? `~${hustle.timeToFirstPesoDays} araw`
          : hustle.timeToFirstPesoDays >= 90
            ? `~${Math.round(hustle.timeToFirstPesoDays / 30)} buwan`
            : `~${Math.ceil(hustle.timeToFirstPesoDays / 7)} linggo`,
    },
    {
      icon: Calculator,
      label: "Break-even",
      value:
        hustle.breakevenMonths === 0 || hustle.breakevenMonths == null
          ? hustle.capitalMinPhp === 0
            ? "Wala (₱0 puhunan)"
            : "Depende sa bilis"
          : `~${hustle.breakevenMonths} buwan`,
    },
  ];

  return (
    <main className="space-y-4">
      {/* Header */}
      <section className="animate-fade-up surface flex items-start gap-3.5 rounded-2xl p-4">
        <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", cs.bg)}>
          <Icon className={cn("h-7 w-7", cs.text)} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge>{hustle.category}</Badge>
            <Badge tone={DIFF_TONE[hustle.difficulty]}>{labelDifficulty(hustle.difficulty)}</Badge>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-ink-500">
              <Star className="h-3 w-3 fill-araw-400 text-araw-400" />
              {hustle.legitimacyScore}.0 legit
            </span>
          </div>
          <h1 className="mt-1.5 text-lg font-extrabold leading-tight tracking-tight text-ink-950">
            {hustle.nameTl}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{hustle.descriptionTl}</p>
        </div>
      </section>

      <Disclaimer variant="estimates" />

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="surface animate-fade-up rounded-2xl p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
              <s.icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              {s.label}
            </div>
            <p className="tabular mt-1.5 text-[15px] font-extrabold leading-snug tracking-tight text-ink-950">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* Where & requirements */}
      <section className="surface animate-fade-up space-y-4 rounded-2xl p-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            <MapPin className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.25} />
            Saan ito pasok
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hustle.regions.length ? (
              hustle.regions.map((r) => <Badge key={r} tone="brand">{r}</Badge>)
            ) : (
              <Badge tone="brand">Nationwide</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">Devices</p>
            <div className="mt-2 space-y-1.5">
              {hustle.requiresDevices.length ? (
                hustle.requiresDevices.map((d) => {
                  const DI = DEVICE_ICONS[d] ?? Smartphone;
                  return (
                    <p key={d} className="flex items-center gap-2 text-[13px] font-semibold text-ink-800">
                      <DI className="h-4 w-4 text-ink-500" strokeWidth={2.25} />
                      {labelDevice(d)}
                    </p>
                  );
                })
              ) : (
                <p className="text-[13px] font-semibold text-ink-500">Walang requirement</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">Internet</p>
            <p className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-ink-800">
              <Wifi className="h-4 w-4 text-ink-500" strokeWidth={2.25} />
              {labelInternet(hustle.requiresInternet)}
            </p>
          </div>
        </div>

        {hustle.skillsRequired.length ? (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">Skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hustle.skillsRequired.map((s) => (
                <Badge key={s}>{labelSkill(s)}</Badge>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Pros & cons */}
      {(hustle.prosTl.length > 0 || hustle.consTl.length > 0) && (
        <section className="grid grid-cols-1 gap-2.5">
          {hustle.prosTl.length > 0 && (
            <div className="surface animate-fade-up rounded-2xl border-l-4 border-l-emerald-400 p-4">
              <p className="text-sm font-extrabold text-emerald-700">Ang maganda</p>
              <ul className="mt-2 space-y-1.5">
                {hustle.prosTl.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hustle.consTl.length > 0 && (
            <div className="surface animate-fade-up rounded-2xl border-l-4 border-l-rose-400 p-4">
              <p className="text-sm font-extrabold text-rose-700">Ang mahirap</p>
              <ul className="mt-2 space-y-1.5">
                {hustle.consTl.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <section className="surface animate-fade-up rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <ListOrdered className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
            Paano magsimula
          </p>
          <div className="mt-3 space-y-4">
            {steps.map((block, idx) => (
              <div key={idx} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 ? <div className="mt-1 w-px flex-1 bg-ink-200" /> : null}
                </div>
                <div className="pb-1">
                  <p className="text-[13px] font-extrabold text-ink-900">{block.title}</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink-600">
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common mistakes */}
      {hustle.commonMistakesTl.length > 0 && (
        <section className="surface animate-fade-up rounded-2xl bg-amber-50/60 p-4 ring-1 ring-amber-100">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-amber-800">
            <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
            Karaniwang pagkakamali
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-amber-900/90">
            {hustle.commonMistakesTl.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Suppliers */}
      {suppliers.length > 0 && (
        <section className="surface animate-fade-up space-y-3 rounded-2xl p-4">
          <p className="text-sm font-extrabold text-ink-950">Platforms at suppliers</p>
          {suppliers.map((block, idx) => (
            <div key={idx}>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{block.title}</p>
              <ul className="mt-1.5 space-y-1.5">
                {block.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500"
                    >
                      {l.label}
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Success story */}
      {hustle.successStoryTl ? (
        <section className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-4 text-white">
          <Quote className="absolute -right-2 -top-2 h-16 w-16 text-white/10" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-araw-300">
            Kwento ng raket
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-brand-50">{hustle.successStoryTl}</p>
        </section>
      ) : null}

      {/* Legal */}
      <section className="surface animate-fade-up space-y-2 rounded-2xl p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
          <Scale className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
          Legal requirements
        </p>
        {hustle.legalRequirements.length ? (
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-ink-700">
            {hustle.legalRequirements.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-ink-700">Wala sa simula — pero basahin pa rin ang Legal Starter Kit.</p>
        )}
        <Link href="/legal" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
          Basahin ang Legal Starter Kit
          <ExternalLink className="h-3 w-3" strokeWidth={2.5} />
        </Link>
      </section>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5 pb-2">
        <SaveButton hustleId={hustle.id} />
        <Link
          href={`/calculator?hustle=${hustle.slug}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white shadow-sm shadow-brand-600/25 transition-all hover:bg-brand-700 active:scale-[0.97]"
        >
          <Calculator className="h-4 w-4" strokeWidth={2.25} />
          Kalkulahin
        </Link>
      </div>

      <Disclaimer variant="legal" />
    </main>
  );
}
