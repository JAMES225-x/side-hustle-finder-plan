import { db } from "@/db";
import { scamRegistry, scamReports } from "@/db/schema";
import { analyzeScamText } from "@/lib/scamShield";
import { ilike, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  text: z.string().max(20_000).default(""),
  entityName: z.string().max(300).optional(),
});

function registryRiskScore(level: "low" | "medium" | "high") {
  if (level === "high") return 90;
  if (level === "medium") return 55;
  return 20;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const text = parsed.data.text ?? "";
  const entityName = (parsed.data.entityName ?? "").trim();

  const rule = analyzeScamText([entityName, text].filter(Boolean).join("\n\n"));

  // Simple registry lookup: exact/partial match on entity_name
  const registryHits = entityName
    ? await db
        .select({
          id: scamRegistry.id,
          entityName: scamRegistry.entityName,
          riskLevel: scamRegistry.riskLevel,
          source: scamRegistry.source,
          notes: scamRegistry.notes,
        })
        .from(scamRegistry)
        .where(ilike(scamRegistry.entityName, `%${entityName}%`))
        .limit(10)
    : [];

  const registryMax = registryHits.reduce((max, h) => {
    const s = registryRiskScore(h.riskLevel);
    return Math.max(max, s);
  }, 0);

  // Community reports count (approximate match)
  const reportsCountRow = entityName
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(scamReports)
        .where(ilike(scamReports.entityName, `%${entityName}%`))
    : [{ count: 0 }];

  const communityReportsCount = reportsCountRow[0]?.count ?? 0;

  const blendedScore = Math.max(rule.riskScore, registryMax);
  const riskLevel = blendedScore >= 70 ? "red" : blendedScore >= 35 ? "yellow" : "green";

  return Response.json({
    ok: true,
    input: { entityName, hasText: Boolean(text.trim()) },
    result: {
      ...rule,
      riskScore: blendedScore,
      riskLevel,
      registryHits,
      communityReportsCount,
      disclaimerTl:
        "Gabay lang ito at community signal. Hindi ito legal determination. I-check pa rin ang official advisories.",
    },
  });
}
