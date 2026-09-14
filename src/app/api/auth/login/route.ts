import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Kailangan ng password"),
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

  const { email, password } = parsed.data;

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user || !user.passwordHash) {
    return Response.json({ ok: false, error: "Mali ang email o password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return Response.json({ ok: false, error: "Mali ang email o password." }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
