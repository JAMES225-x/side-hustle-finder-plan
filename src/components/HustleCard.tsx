import Link from "next/link";
import { Flame, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPhp, formatPhpRange } from "@/lib/format";
import { labelDifficulty } from "@/lib/labels";
import { categoryStyle, hustleIcon } from "@/lib/hustleIcon";
import { Badge } from "@/components/ui/Badge";

export type HustleCardData = {
  id: number;
  slug: string;
  nameTl: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  incomeMinPhp: number;
  incomeMaxPhp: number;
  incomePeriod: string;
  capitalMinPhp: number;
  legitimacyScore: number;
  isTrending: boolean;
  timeToFirstPesoDays: number;
};

const DIFF_TONE = { easy: "green", medium: "araw", hard: "red" } as const;

export function HustleCard({ hustle, delay = 0 }: { hustle: HustleCardData; delay?: number }) {
  const Icon = hustleIcon(hustle.slug, hustle.category);
  const cs = categoryStyle(hustle.category);

  return (
    <Link href={`/hustles/${hustle.slug}`} className="block">
      <article
        className="surface surface-hover animate-fade-up rounded-2xl p-4"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start gap-3">
          <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", cs.bg)}>
            <Icon className={cn("h-6 w-6", cs.text)} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-extrabold tracking-tight text-ink-950">
                  {hustle.nameTl}
                </h3>
                <p className="text-xs font-medium text-ink-500">{hustle.category}</p>
              </div>
              {hustle.isTrending ? (
                <Badge tone="araw" className="shrink-0">
                  <Flame className="h-3 w-3" strokeWidth={2.5} />
                  Trending
                </Badge>
              ) : null}
            </div>

            <p className="tabular mt-2 text-sm font-extrabold tracking-tight text-brand-700">
              {formatPhpRange(hustle.incomeMinPhp, hustle.incomeMaxPhp, hustle.incomePeriod)}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-ink-500">
              <span className="inline-flex items-center gap-1">
                Puhunan: <span className="tabular text-ink-800">{formatPhp(hustle.capitalMinPhp)}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-araw-400 text-araw-400" />
                <span className="text-ink-800">{hustle.legitimacyScore}.0</span>
                <span className="text-ink-400">legit</span>
              </span>
              <Badge tone={DIFF_TONE[hustle.difficulty]} className="px-2 py-0.5">
                {labelDifficulty(hustle.difficulty)}
              </Badge>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
