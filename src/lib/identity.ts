import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const VISITOR_COOKIE = "shfph_vid";

/** Read-only identity for Server Components (never sets cookies). */
export async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value ?? null;
}

export async function requireUserId() {
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

  // Ensure row exists (idempotent)
  const found = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (found.length === 0) {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  }

  return userId;
}
