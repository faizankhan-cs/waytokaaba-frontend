import "server-only";
import { redirect } from "next/navigation";
import { ApiError, apiGet, readProblem } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config";
import type { ProblemDetails } from "@/lib/types";
import { clearAdminSession, requireAdminToken } from "./session";

/** Authenticated GET for admin pages. Expired/invalid sessions are sent back to the login page. */
export async function adminGet<T>(path: string): Promise<T> {
  const token = await requireAdminToken();
  try {
    return await apiGet<T>(path, { token });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/admin/login?expired=1");
    }
    throw error;
  }
}

export type MutationResult<T> =
  | { ok: true; data: T | null }
  | { ok: false; status: number; problem: ProblemDetails | null };

/** Authenticated POST/PUT/PATCH/DELETE used by server actions. */
export async function adminSend<T>(method: "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<MutationResult<T>> {
  const token = await requireAdminToken();
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    // Timeout or connection failure: report it to the form instead of crashing the page.
    return { ok: false, status: 0, problem: null };
  }

  if (res.status === 401) {
    await clearAdminSession();
    redirect("/admin/login?expired=1");
  }
  if (!res.ok) return { ok: false, status: res.status, problem: await readProblem(res) };
  if (res.status === 204) return { ok: true, data: null };
  return { ok: true, data: (await res.json()) as T };
}

/** Flattens a failed mutation into form state for display. */
export function toFormError(result: { status: number; problem: ProblemDetails | null }) {
  const fieldErrors = Object.fromEntries(Object.entries(result.problem?.errors ?? {}).map(([k, v]) => [k, v.join(" ")]));
  const message =
    result.status === 0
      ? "The server didn't respond. Please try again in a moment."
      : result.status === 400
      ? "Please fix the highlighted fields."
      : result.problem?.detail ?? result.problem?.title ?? `The request failed (HTTP ${result.status}).`;
  return { message, fieldErrors, warning: result.status === 409 };
}
