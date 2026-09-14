import { db } from "@/db";
import { hustles } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { PageHeader } from "@/components/PageHeader";
import { Calculator } from "lucide-react";
import { CalculatorClient, type CalcHustle } from "@/app/calculator/CalculatorClient";
import { asc, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Puhunan Calculator",
  description:
    "Ilang units ang kailangan ibenta o ilang oras ang kailangan magtrabaho para maabot ang target mong kita?",
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ hustle?: string }>;
}) {
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  const { hustle: preset } = await searchParams;

  const rows: CalcHustle[] = await db
    .select({
      slug: hustles.slug,
      nameTl: hustles.nameTl,
      category: hustles.category,
      incomeMinPhp: hustles.incomeMinPhp,
      incomeMaxPhp: hustles.incomeMaxPhp,
      capitalMinPhp: hustles.capitalMinPhp,
      capitalMaxPhp: hustles.capitalMaxPhp,
      breakevenMonths: hustles.breakevenMonths,
      timeToFirstPesoDays: hustles.timeToFirstPesoDays,
      unitLabel: hustles.unitLabel,
      avgPhpPerUnit: hustles.avgPhpPerUnit,
    })
    .from(hustles)
    .orderBy(asc(hustles.category), asc(hustles.nameTl))
    .limit(200);

  const zeroCapital: Array<{ slug: string; nameTl: string; legitimacyScore: number }> = await db
    .select({
      slug: hustles.slug,
      nameTl: hustles.nameTl,
      legitimacyScore: hustles.legitimacyScore,
    })
    .from(hustles)
    .where(eq(hustles.capitalMinPhp, 0))
    .orderBy(desc(hustles.legitimacyScore))
    .limit(5);

  return (
    <main className="space-y-4">
      <PageHeader
        icon={<Calculator className="h-5 w-5" strokeWidth={2.25} />}
        title="Puhunan Calculator"
        description="Ilang units or oras ang kailangan para sa target mong kita?"
      />
      <CalculatorClient hustles={rows} zeroCapital={zeroCapital} presetSlug={preset} />
    </main>
  );
}
