import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "wtk_admin";

/** Stores the API access token in an httpOnly cookie (never readable by browser JavaScript). */
export async function setAdminSession(token: string, expiresAt: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** Returns the admin token or redirects to the login page. */
export async function requireAdminToken(): Promise<string> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  return token;
}
