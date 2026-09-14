import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUserId } from "@/lib/identity";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().trim().max(120).optional(),
  region: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
});

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.region !== undefined) patch.region = parsed.data.region;
  if (parsed.data.city !== undefined) patch.city = parsed.data.city;

  if (Object.keys(patch).length > 0) {
    await db.update(users).set(patch).where(eq(users.id, userId));
  }

  return Response.json({ ok: true });
}
