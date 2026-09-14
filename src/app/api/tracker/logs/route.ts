import { db } from "@/db";
import { incomeLogs } from "@/db/schema";
import { requireUserId } from "@/lib/identity";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  type: z.enum(["income", "expense"]),
  amountPhp: z.number().int().min(1).max(10_000_000),
  note: z.string().max(2000).optional(),
  hustleId: z.number().int().positive().optional(),
  loggedAt: z.string().datetime().optional(),
});

export async function GET() {
  const userId = await requireUserId();

  const rows = await db
    .select({
      id: incomeLogs.id,
      type: incomeLogs.type,
      amountPhp: incomeLogs.amountPhp,
      note: incomeLogs.note,
      hustleId: incomeLogs.hustleId,
      loggedAt: incomeLogs.loggedAt,
    })
    .from(incomeLogs)
    .where(eq(incomeLogs.userId, userId))
    .orderBy(desc(incomeLogs.loggedAt))
    .limit(50);

  return Response.json({ ok: true, logs: rows });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const loggedAt = parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : undefined;

  const [row] = await db
    .insert(incomeLogs)
    .values({
      userId,
      type: parsed.data.type,
      amountPhp: parsed.data.amountPhp,
      note: parsed.data.note,
      hustleId: parsed.data.hustleId,
      ...(loggedAt ? { loggedAt } : null),
    })
    .returning({ id: incomeLogs.id });

  return Response.json({ ok: true, id: row?.id });
}
