// ============================================================================
// Helpers de sesión sin contraseña: cookie con el token del usuario y cookie
// de administrador. También el control de cierre de porras (LOCK_AT).
// ============================================================================

import { cookies } from "next/headers";
import { getUser, type User } from "@/lib/db";

const USER_COOKIE = "porra_uid";
const ADMIN_COOKIE = "porra_admin";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 año
};

export function setUserCookie(id: string): void {
  cookies().set(USER_COOKIE, id, COOKIE_OPTS);
}

export async function getCurrentUser(): Promise<User | null> {
  const id = cookies().get(USER_COOKIE)?.value;
  if (!id) return null;
  return (await getUser(id)) ?? null;
}

export function clearUserCookie(): void {
  cookies().delete(USER_COOKIE);
}

// ---------- Admin ----------

export function isAdmin(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return cookies().get(ADMIN_COOKIE)?.value === expected;
}

export function setAdminCookie(): void {
  const expected = process.env.ADMIN_PASSWORD || "";
  cookies().set(ADMIN_COOKIE, expected, { ...COOKIE_OPTS, maxAge: 60 * 60 * 8 });
}

export function clearAdminCookie(): void {
  cookies().delete(ADMIN_COOKIE);
}

// ---------- Cierre de porras ----------

export function lockAt(): Date | null {
  const raw = process.env.LOCK_AT;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function isLocked(): boolean {
  const d = lockAt();
  return d ? Date.now() >= d.getTime() : false;
}
