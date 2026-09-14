import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { VISITOR_COOKIE } from "@/lib/identity";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  region: string | null;
  city: string | null;
  isGuest: boolean;
};

/** Sets the session cookie to point at a given (already-existing) user id. */
export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(VISITOR_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Clears the session, effectively logging out (a fresh guest id is issued next visit). */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(VISITOR_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!id) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      region: users.region,
      city: users.city,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return { ...row, isGuest: !row.email };
}
