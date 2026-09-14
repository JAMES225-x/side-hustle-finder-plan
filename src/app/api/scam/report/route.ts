import { db } from "@/db";
import { scamReports } from "@/db/schema";
import { requireUserId } from "@/lib/identity";
import { analyzeScamText } from "@/lib/scamShield";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  entityName: z.string().min(2).max(300),
  platform: z.string().min(1).max(80).default("unknown"),
  description: z.string().min(10).max(20_000),
  evidenceUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const riskScore = analyzeScamText(
    `${parsed.data.entityName}\n\n${parsed.data.description}`
  ).riskScore;

  const [row] = await db
    .insert(scamReports)
    .values({
      reporterId: userId,
      entityName: parsed.data.entityName,
      platform: parsed.data.platform,
      description: parsed.data.description,
      evidenceUrl: parsed.data.evidenceUrl,
      riskScore,
    })
    .returning({ id: scamReports.id });

  return Response.json({ ok: true, reportId: row?.id });
}
