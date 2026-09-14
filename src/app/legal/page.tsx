import Link from "next/link";
import { db } from "@/db";
import { legalGuides } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { Badge } from "@/components/ui/Badge";
import { BookOpenCheck, Building2, ChevronRight, FileText, HeartPulse, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { asc } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legal Starter Kit",
  description: "Plain-Taglish guides sa DTI, BIR, at benefits para sa side hustlers.",
};

const GUIDE_ICONS: Record<string, LucideIcon> = {
  "kailangan-ko-ba-mag-register": FileText,
  "dti-business-name": Landmark,
  "bir-freelancer-basics": Building2,
  "sss-philhealth-pagibig": HeartPulse,
  "online-seller-rules": BookOpenCheck,
};

export default async function LegalIndexPage() {
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  const guides = await db
    .select({
      slug: legalGuides.slug,
      titleTl: legalGuides.titleTl,
      agency: legalGuides.agency,
      lastVerifiedAt: legalGuides.lastVerifiedAt,
    })
    .from(legalGuides)
    .orderBy(asc(legalGuides.slug))
    .limit(50);

  return (
    <main className="space-y-4">
      <PageHeader
        icon={<BookOpenCheck className="h-5 w-5" strokeWidth={2.25} />}
        title="Legal Starter Kit"
        description="DTI, BIR, permits, at benefits — plain Taglish."
      />

      <Disclaimer variant="legal" />

      <section className="space-y-2.5">
        {guides.map((g, i) => {
          const Icon = GUIDE_ICONS[g.slug] ?? FileText;
          return (
            <Link key={g.slug} href={`/legal/${g.slug}`} className="block">
              <article
                className="surface surface-hover animate-fade-up flex items-center gap-3 rounded-2xl p-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold tracking-tight text-ink-950">{g.titleTl}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {g.agency ? <Badge tone="blue">{g.agency}</Badge> : null}
                    <Badge>
                      Verified {new Date(g.lastVerifiedAt).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" strokeWidth={2.5} />
              </article>
            </Link>
          );
        })}
      </section>

      <div className="surface rounded-2xl bg-gradient-to-br from-sky-50 to-white p-4">
        <p className="text-sm font-extrabold text-ink-950">Gintong tuntunin</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
          Hindi mo kailangang mag-register para sa unang bente mo. Pero kapag consistent na ang
          kita (≈ ₱5K–₱10K/buwan pataas), simulan mo nang ayusin ang BIR at DTI — mas madali ito
          nang maaga kaysa habulin sa late fees.
        </p>
      </div>
    </main>
  );
}
