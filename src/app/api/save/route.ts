import { db } from "@/db";
import { savedHustles } from "@/db/schema";
import { requireUserId } from "@/lib/identity";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  hustleId: z.number().int().positive(),
});

export async function GET() {
  const userId = await requireUserId();
  const rows = await db
    .select({ hustleId: savedHustles.hustleId })
    .from(savedHustles)
    .where(eq(savedHustles.userId, userId));
  return Response.json({ ok: true, ids: rows.map((r) => r.hustleId) });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const hustleId = parsed.data.hustleId;

  const existing = await db
    .select({ hustleId: savedHustles.hustleId })
    .from(savedHustles)
    .where(and(eq(savedHustles.userId, userId), eq(savedHustles.hustleId, hustleId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(savedHustles)
      .where(and(eq(savedHustles.userId, userId), eq(savedHustles.hustleId, hustleId)));
    return Response.json({ ok: true, saved: false });
  }

  await db.insert(savedHustles).values({ userId, hustleId }).onConflictDoNothing();
  return Response.json({ ok: true, saved: true });
}
