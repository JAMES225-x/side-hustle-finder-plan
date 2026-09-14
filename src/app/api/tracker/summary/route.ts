import { db } from "@/db";
import { incomeLogs } from "@/db/schema";
import { requireUserId } from "@/lib/identity";
import { and, eq, gte, lt, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export async function GET() {
  const userId = await requireUserId();
  const { start, end } = monthRange();

  const rows = await db
    .select({
      income: sql<number>`coalesce(sum(case when ${incomeLogs.type} = 'income' then ${incomeLogs.amountPhp} else 0 end), 0)::int`,
      expense: sql<number>`coalesce(sum(case when ${incomeLogs.type} = 'expense' then ${incomeLogs.amountPhp} else 0 end), 0)::int`,
    })
    .from(incomeLogs)
    .where(and(eq(incomeLogs.userId, userId), gte(incomeLogs.loggedAt, start), lt(incomeLogs.loggedAt, end)));

  const income = rows[0]?.income ?? 0;
  const expense = rows[0]?.expense ?? 0;

  return Response.json({ ok: true, monthStart: start.toISOString(), income, expense, net: income - expense });
}
