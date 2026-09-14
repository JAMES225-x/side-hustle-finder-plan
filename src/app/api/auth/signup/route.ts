import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { requireUserId } from "@/lib/identity";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().trim().min(1, "Kailangan ng pangalan").max(120),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters ang password"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return Response.json(
      { ok: false, error: "May account na gamit ang email na ito. Mag-sign in na lang." },
      { status: 409 }
    );
  }

  // Upgrade the current guest row into a full account (keeps saved hustles / logs / quiz history).
  const userId = await requireUserId();
  const passwordHash = await hashPassword(password);

  await db.update(users).set({ name, email, passwordHash }).where(eq(users.id, userId));
  await setSessionCookie(userId);

  return Response.json({ ok: true, user: { id: userId, name, email } });
}
