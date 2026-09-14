import { db } from "@/db";
import { users } from "@/db/schema";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "Walang active session." }, { status: 401 });
  }

  // Cascades to saved_hustles, income_logs, quiz_profiles, scam_reports via FK onDelete rules.
  await db.delete(users).where(eq(users.id, user.id));
  await clearSessionCookie();

  return Response.json({ ok: true });
}
