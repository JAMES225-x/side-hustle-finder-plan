import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { hustles, quizProfiles } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { computeMatch } from "@/lib/matching";
import { Check, ChevronRight, ListChecks, RotateCcw, ShieldCheck } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { formatPhp, formatPhpRange } from "@/lib/format";
import { categoryStyle, hustleIcon } from "@/lib/hustleIcon";
import { cn } from "@/lib/cn";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  const { id } = await params;
  const profileId = Number(id);
  if (!Number.isFinite(profileId)) notFound();

  const profileRows = await db.select().from(quizProfiles).where(eq(quizProfiles.id, profileId)).limit(1);
  const profile = profileRows[0];
  if (!profile) notFound();

  const hustleRows = await db.select().from(hustles).limit(200);

  const scored = hustleRows
    .map((h) => {
      const { score, reasons } = computeMatch(profile, h);
      return { hustle: h, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <main className="space-y-4">
      {/* Summary hero */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-950 p-5 text-white shadow-xl shadow-brand-900/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-araw-400/20 blur-2xl"
        />
        <p className="text-xs font-extrabold uppercase tracking-wider text-araw-300">
          Ang raket mo
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Narito ang top matches mo</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-100">
          Base sa oras, puhunan, device, internet, at skills mo — naka-rank sila mula pinaka-bagay.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            `${profile.hoursPerWeek} hrs/linggo`,
            `₱${profile.capitalPhp.toLocaleString()} puhunan`,
            profile.region,
            profile.urgency,
            profile.goal,
          ].map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Matches */}
      <section className="space-y-3">
        {scored.map(({ hustle, score, reasons }, i) => {
          const Icon = hustleIcon(hustle.slug, hustle.category);
          const cs = categoryStyle(hustle.category);
          const color = score >= 70 ? "#188052" : score >= 40 ? "#f59e0b" : "#6c7684";
          return (
            <Link key={hustle.id} href={`/hustles/${hustle.slug}`} className="block">
              <article
                className="surface surface-hover animate-fade-up rounded-2xl p-4"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <ProgressRing percent={score} size={64} stroke={7} color={color}>
                    <span className="tabular text-sm font-extrabold" style={{ color }}>
                      {score}%
                    </span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-extrabold tracking-tight text-ink-950">
                          {hustle.nameTl}
                        </p>
                        <p className="text-xs font-medium text-ink-500">{hustle.category}</p>
                      </div>
                      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", cs.bg)}>
                        <Icon className={cn("h-4 w-4", cs.text)} strokeWidth={2.25} />
                      </div>
                    </div>
                    <p className="tabular mt-1 text-sm font-extrabold text-brand-700">
                      {formatPhpRange(hustle.incomeMinPhp, hustle.incomeMaxPhp, hustle.incomePeriod)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-400">
                    Bakit bagay sa'yo
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {reasons.slice(0, 3).map((r, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-ink-700">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" strokeWidth={3} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-ink-500">
                  <span className="tabular">
                    Puhunan: {formatPhp(hustle.capitalMinPhp)} · Unang kita: ~
                    {hustle.timeToFirstPesoDays <= 7
                      ? `${hustle.timeToFirstPesoDays} araw`
                      : `${Math.ceil(hustle.timeToFirstPesoDays / 7)} linggo`}
                  </span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-brand-700">
                    Tingnan <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </section>

      {/* Next steps */}
      <section className="surface animate-fade-up space-y-3 rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
          <ListChecks className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
          Susunod na hakbang
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink-700">
          <li>Pumili ng ISANG raket lang muna — iwasang ma-overwhelm.</li>
          <li>Basahin ang buong guide, kasama ang "karaniwang pagkakamali".</li>
          <li>Kung may job offer o "opportunity", i-check muna sa Scam Shield.</li>
        </ol>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/scam-shield"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-xs font-extrabold text-ink-800 ring-1 ring-ink-200 active:scale-95"
          >
            <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
            Scam Shield
          </Link>
          <Link
            href="/quiz"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-xs font-extrabold text-ink-800 ring-1 ring-ink-200 active:scale-95"
          >
            <RotateCcw className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
            Retake quiz
          </Link>
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl bg-ink-100/70 p-3 text-[11px] leading-relaxed text-ink-500">
        <Badge tone="araw" className="mt-0.5 shrink-0">Note</Badge>
        <p>
          Ang % match ay base sa inputs mo — hindi ito guarantee ng kita. Lahat ng figures ay
          TANTIYA LAMANG.
        </p>
      </div>
    </main>
  );
}
