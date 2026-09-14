import Link from "next/link";
import { db } from "@/db";
import { hustles, legalGuides, scamRegistry } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { HustleCard, type HustleCardData } from "@/components/HustleCard";
import { Disclaimer } from "@/components/Disclaimer";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    href: "/calculator",
    icon: Calculator,
    title: "Puhunan Calculator",
    desc: "Ilang units ang kailangan ibenta para sa target mo?",
    bg: "bg-brand-50",
    text: "text-brand-700",
  },
  {
    href: "/scam-shield",
    icon: ShieldCheck,
    title: "Scam Shield",
    desc: "I-check ang job offer bago ka mahulog sa scam.",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    href: "/legal",
    icon: Scale,
    title: "Legal Starter Kit",
    desc: "DTI, BIR, at permits — plain Taglish guides.",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
  {
    href: "/tracker",
    icon: Wallet,
    title: "Kita Tracker",
    desc: "I-log ang kita at gastos. Alamin ang net mo.",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
];

const DIFFERENTIATORS = [
  { icon: MapPin, text: "100% Philippine-contextualized — peso amounts, local platforms, local suppliers" },
  { icon: ShieldCheck, text: "Scam Shield — red-flag checker at community scam registry" },
  { icon: Scale, text: "Legal Starter Kit — DTI, BIR, at barangay guides na plain Taglish" },
  { icon: Smartphone, text: "Data-light at guest-friendly — walang required na sign-up" },
  { icon: Sparkles, text: "Taglish-first na UX — kung paano tayo talaga mag-usap" },
];

export default async function HomePage() {
  let hustleCount = 0;
  let guideCount = 0;
  let redFlagCount = 0;
  let trending: HustleCardData[] = [];

  try {
    await seedCoreData();

    const [hc] = await db.select({ count: sql<number>`count(*)::int` }).from(hustles);
    const [gc] = await db.select({ count: sql<number>`count(*)::int` }).from(legalGuides);
    const [sc] = await db.select({ count: sql<number>`count(*)::int` }).from(scamRegistry);
    hustleCount = hc?.count ?? 0;
    guideCount = gc?.count ?? 0;
    redFlagCount = sc?.count ?? 0;

    trending = await db
      .select({
        id: hustles.id,
        slug: hustles.slug,
        nameTl: hustles.nameTl,
        category: hustles.category,
        difficulty: hustles.difficulty,
        incomeMinPhp: hustles.incomeMinPhp,
        incomeMaxPhp: hustles.incomeMaxPhp,
        incomePeriod: hustles.incomePeriod,
        capitalMinPhp: hustles.capitalMinPhp,
        legitimacyScore: hustles.legitimacyScore,
        isTrending: hustles.isTrending,
        timeToFirstPesoDays: hustles.timeToFirstPesoDays,
      })
      .from(hustles)
      .where(sql`${hustles.isTrending} = true`)
      .orderBy(desc(hustles.legitimacyScore))
      .limit(3);
  } catch {
    // Tables may not exist yet — page still renders.
  }

  return (
    <main className="space-y-5">
      {/* HERO */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-950 p-6 text-white shadow-xl shadow-brand-900/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-araw-400/20 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl"
        />
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold leading-none text-white ring-1 ring-white/20 backdrop-blur">
          <MapPin className="h-3 w-3" strokeWidth={2.5} />
          Gawa para sa Pinoy
        </span>
        <h1 className="mt-3 text-[28px] font-extrabold leading-[1.12] tracking-tight">
          Hanap tayo ng raket mo.
        </h1>
        <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-brand-100">
          Legit, ligtas, at bagay sa oras, puhunan, at lugar mo. Hindi US advice — PH realities.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Link
            href="/quiz"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-brand-800 shadow-lg shadow-brand-950/20 transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Mag-Quiz na
          </Link>
          <Link
            href="/hustles"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-extrabold text-white ring-1 ring-white/25 backdrop-blur transition-transform active:scale-[0.98]"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
            I-browse ({hustleCount}+)
          </Link>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
          {[
            { n: `${hustleCount}+`, l: "Legit na raket" },
            { n: `${redFlagCount}+`, l: "Red-flag patterns" },
            { n: `${guideCount}`, l: "Legal guides" },
          ].map((s) => (
            <div key={s.l}>
              <dt className="sr-only">{s.l}</dt>
              <dd className="tabular text-lg font-extrabold tracking-tight">{s.n}</dd>
              <dd className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* HOW IT WORKS */}
      <section className="animate-fade-up space-y-3" style={{ animationDelay: "60ms" }}>
        <h2 className="text-base font-extrabold tracking-tight text-ink-950">
          Paano gumagana
        </h2>
        <div className="surface divide-y divide-ink-100 rounded-2xl">
          {[
            {
              n: "1",
              icon: ClipboardCheck,
              title: "Sagutin ang 8-tanong quiz",
              desc: "Under 90 seconds. Oras, puhunan, lugar, device, skills.",
            },
            {
              n: "2",
              icon: Sparkles,
              title: "Makita ang matches mo",
              desc: "Ranked list na may % match at 'bakit bagay sa'yo'.",
            },
            {
              n: "3",
              icon: ShieldCheck,
              title: "I-verify bago mag-commit",
              desc: "Scam Shield check + Legal Starter Kit bago ka gumastos.",
            },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 font-extrabold text-white">
                {s.n}
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink-950">{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="animate-fade-up space-y-3" style={{ animationDelay: "120ms" }}>
        <h2 className="text-base font-extrabold tracking-tight text-ink-950">Mga tools</h2>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="surface surface-hover rounded-2xl p-4">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${t.bg}`}>
                <t.icon className={`h-5 w-5 ${t.text}`} strokeWidth={2.25} />
              </div>
              <p className="mt-2.5 text-sm font-extrabold tracking-tight text-ink-950">{t.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{t.desc}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700">
                Bukasin <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 ? (
        <section className="animate-fade-up space-y-3" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">
              Trending na raket
            </h2>
            <Link
              href="/hustles"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700"
            >
              Lahat <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
          <div className="space-y-3">
            {trending.map((h, i) => (
              <HustleCard key={h.id} hustle={h} delay={i * 60} />
            ))}
          </div>
        </section>
      ) : null}

      {/* WHY US */}
      <section className="animate-fade-up surface rounded-2xl p-4" style={{ animationDelay: "240ms" }}>
        <h2 className="text-base font-extrabold tracking-tight text-ink-950">
          Bakit hindi na lang mag-Google?
        </h2>
        <ul className="mt-3 space-y-3">
          {DIFFERENTIATORS.map((d) => (
            <li key={d.text} className="flex items-start gap-2.5">
              <d.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.25} />
              <p className="text-[13px] leading-relaxed text-ink-700">{d.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer variant="estimates" />
    </main>
  );
}
