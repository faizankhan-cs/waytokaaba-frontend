import "server-only";
import { connection } from "next/server";
import { getApiBaseUrl } from "./config";
import type {
  City,
  HotelDetail,
  HotelSummary,
  PackageDetail,
  PackageSummary,
  PagedResult,
  ProblemDetails,
} from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails | null,
  ) {
    super(problem?.detail ?? problem?.title ?? `API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | undefined | null | (string | number)[];

export function toQueryString(params: Record<string, QueryValue>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, String(v)));
    else qs.append(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * GET from the API at request time (never during the build), without caching,
 * so admin edits are visible immediately. Free-tier API hosts may cold-start, hence the generous timeout.
 */
export async function apiGet<T>(path: string, init?: { token?: string }): Promise<T> {
  await connection();
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new ApiError(res.status, await readProblem(res));
  return (await res.json()) as T;
}

export async function readProblem(res: Response): Promise<ProblemDetails | null> {
  try {
    return (await res.json()) as ProblemDetails;
  } catch {
    return null;
  }
}

async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ---------------- Public catalogue ----------------

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

/** Whitelists hotel filter parameters from the page URL. */
export function hotelFilters(sp: SearchParams) {
  return {
    q: first(sp.q),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
    stars: all(sp.stars),
    guests: first(sp.guests),
    sort: first(sp.sort),
    page: first(sp.page),
  };
}

/** Whitelists package filter parameters from the page URL. */
export function packageFilters(sp: SearchParams) {
  return {
    q: first(sp.q),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
    minDays: first(sp.minDays),
    maxDays: first(sp.maxDays),
    type: all(sp.type),
    sort: first(sp.sort),
    page: first(sp.page),
  };
}

export function searchHotels(city: City | undefined, sp: SearchParams, pageSize = 12) {
  return apiGet<PagedResult<HotelSummary>>(`/api/hotels/search${toQueryString({ city, pageSize, ...hotelFilters(sp) })}`);
}

export function getFeaturedHotels(city: City, limit = 4) {
  return apiGet<HotelSummary[]>(`/api/hotels/featured${toQueryString({ city, limit })}`);
}

export function getHotel(slug: string) {
  return orNull(apiGet<HotelDetail>(`/api/hotels/${encodeURIComponent(slug)}`));
}

export function searchPackages(sp: SearchParams, pageSize = 12) {
  return apiGet<PagedResult<PackageSummary>>(`/api/packages/search${toQueryString({ pageSize, ...packageFilters(sp) })}`);
}

export function getFeaturedPackages(limit = 6) {
  return apiGet<PackageSummary[]>(`/api/packages/featured${toQueryString({ limit })}`);
}

export function getPackage(slug: string) {
  return orNull(apiGet<PackageDetail>(`/api/packages/${encodeURIComponent(slug)}`));
}
