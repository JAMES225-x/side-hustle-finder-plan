import { db } from "@/db";
import { users } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { VISITOR_COOKIE } from "@/lib/identity";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  const userId = existing ?? crypto.randomUUID();

  if (!existing) {
    cookieStore.set(VISITOR_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const found = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (found.length === 0) {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  }

  // Best-effort seeding (idempotent). If tables aren't pushed yet, ignore.
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  return Response.json({ ok: true, userId });
}
