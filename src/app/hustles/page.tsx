import { db } from "@/db";
import { hustles, savedHustles } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { getUserId } from "@/lib/identity";
import { HustleCard, type HustleCardData } from "@/components/HustleCard";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, SearchX } from "lucide-react";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hustle Database",
  description: "Mga legit na raket sa Pilipinas — may peso amounts, puhunan, at difficulty.",
};

export default async function HustlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = (sp.category ?? "").trim();
  const difficulty = (sp.difficulty ?? "").trim();
  const capitalMax = sp.capitalMax ? Number(sp.capitalMax) : undefined;
  const savedOnly = sp.saved === "1";

  const userId = await getUserId();

  let savedIds: number[] = [];
  if (userId && savedOnly) {
    const saved = await db
      .select({ hustleId: savedHustles.hustleId })
      .from(savedHustles)
      .where(eq(savedHustles.userId, userId));
    savedIds = saved.map((s) => s.hustleId);
  }

  const where = and(
    q
      ? sql`(${hustles.nameTl} ilike ${"%" + q + "%"} or ${hustles.nameEn} ilike ${"%" + q + "%"} or ${hustles.descriptionTl} ilike ${"%" + q + "%"})`
      : undefined,
    category ? eq(hustles.category, category) : undefined,
    difficulty ? eq(hustles.difficulty, difficulty as never) : undefined,
    typeof capitalMax === "number" && Number.isFinite(capitalMax)
      ? lte(hustles.capitalMinPhp, capitalMax)
      : undefined,
    savedOnly ? (savedIds.length ? inArray(hustles.id, savedIds) : sql`false`) : undefined
  );

  const rows: HustleCardData[] = await db
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
    .where(where)
    .orderBy(asc(hustles.category), asc(hustles.nameTl))
    .limit(200);

  const categories = await db
    .selectDistinct({ category: hustles.category })
    .from(hustles)
    .orderBy(asc(hustles.category));

  const mkHref = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    const current: Record<string, string> = {
      q,
      category,
      difficulty,
      capitalMax: sp.capitalMax ?? "",
      saved: savedOnly ? "1" : "",
    };
    const merged = { ...current, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/hustles?${s}` : "/hustles";
  };

  return (
    <main className="space-y-4">
      <PageHeader
        icon={<Briefcase className="h-5 w-5" strokeWidth={2.25} />}
        title="Hustle Database"
        description={`${rows.length} raket na PH-contextualized`}
      />

      {/* Search + filters */}
      <form action="/hustles" method="get" className="surface space-y-3 rounded-2xl p-4">
        {savedOnly ? <input type="hidden" name="saved" value="1" /> : null}
        <div className="relative">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search: VA, reseller, tutor, baking..."
            className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <FilterChip href={mkHref({ category: "" })} active={!category} label="Lahat" />
          {categories.map((c) => (
            <FilterChip
              key={c.category}
              href={mkHref({ category: c.category })}
              active={category === c.category}
              label={c.category}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 space-y-1">
            <label htmlFor="difficulty" className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={difficulty}
              className="h-10 w-full min-w-0 truncate rounded-xl border border-ink-200 bg-white px-2.5 text-[12px] font-semibold text-ink-800 outline-none focus:border-brand-500"
            >
              <option value="">Lahat</option>
              <option value="easy">Madali</option>
              <option value="medium">Katamtaman</option>
              <option value="hard">Mahirap</option>
            </select>
          </div>
          <div className="min-w-0 space-y-1">
            <label htmlFor="capitalMax" className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">
              Puhunan
            </label>
            <select
              id="capitalMax"
              name="capitalMax"
              defaultValue={sp.capitalMax ?? ""}
              className="h-10 w-full min-w-0 truncate rounded-xl border border-ink-200 bg-white px-2.5 text-[12px] font-semibold text-ink-800 outline-none focus:border-brand-500"
            >
              <option value="">Lahat</option>
              <option value="0">₱0</option>
              <option value="1000">≤ ₱1,000</option>
              <option value="5000">≤ ₱5,000</option>
              <option value="20000">≤ ₱20,000</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="h-10 w-full rounded-xl bg-brand-600 text-[13px] font-extrabold text-white transition-colors hover:bg-brand-700 active:scale-95"
        >
          Apply filters
        </button>
      </form>

      {/* Saved toggle */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href={mkHref({ saved: "" })} active={!savedOnly} label="Lahat ng raket" />
        <FilterChip href={mkHref({ saved: "1" })} active={savedOnly} label="Naka-save" />
      </div>

      {/* Results */}
      {rows.length === 0 ? (
        <div className="surface animate-fade-up flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100">
            <SearchX className="h-7 w-7 text-ink-400" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-ink-900">Walang match</p>
            <p className="mt-1 text-xs text-ink-500">
              {savedOnly
                ? "Wala ka pang naka-save. Buksan ang isang raket at i-tap ang Save."
                : "Subukan ang ibang keyword o i-loosen ang filters."}
            </p>
          </div>
        </div>
      ) : (
        <section className="space-y-3">
          {rows.map((h, i) => (
            <HustleCard key={h.id} hustle={h} delay={Math.min(i, 6) * 40} />
          ))}
        </section>
      )}
    </main>
  );
}

import Link from "next/link";
import { cn } from "@/lib/cn";

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all active:scale-95",
        active
          ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
          : "bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-300"
      )}
    >
      {label}
    </Link>
  );
}
