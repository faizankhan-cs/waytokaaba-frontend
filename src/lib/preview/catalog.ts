/**
 * Preview-mode catalogue: serves the bundled sample data (exported from the API's demo seed) with the
 * same filtering, sorting and paging rules as the backend (HotelService / PackageService), so the site can be
 * reviewed without a running API. Used only when NEXT_PUBLIC_PREVIEW_MODE=true.
 */
import data from "./catalog.json";
import transportData from "./transport.json";
import tripSettingsData from "./trip-settings.json";
import visaData from "./visas.json";
import type {
  City,
  HotelDetail,
  HotelSummary,
  PackageDetail,
  PackageSummary,
  PackageType,
  PagedResult,
  TransportCatalog,
  TripSettings,
  VisaDetail,
  VisaSummary,
} from "@/lib/types";

// JSON imports type enums (e.g. city) as plain strings; the data was exported from the API so the shapes match.
const hotels = data.hotels as unknown as HotelDetail[];
const packages = data.packages as unknown as PackageDetail[];

type Param = string | string[] | undefined;

const num = (v: Param): number | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  if (s === undefined || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const list = (v: Param): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);
const text = (v: Param) => (Array.isArray(v) ? v[0] : v)?.trim().toLowerCase() ?? "";

function page<T>(items: T[], pageParam: Param, pageSize: number): PagedResult<T> {
  const size = Math.min(Math.max(Math.trunc(pageSize) || 12, 1), 50);
  const p = Math.max(Math.trunc(num(pageParam) ?? 1), 1);
  const totalPages = Math.ceil(items.length / size);
  return {
    items: items.slice((p - 1) * size, p * size),
    page: p,
    pageSize: size,
    totalCount: items.length,
    totalPages,
    hasNextPage: p < totalPages,
    hasPreviousPage: p > 1,
  };
}

// ---------------- Hotels ----------------

function toHotelSummary(h: HotelDetail): HotelSummary {
  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    city: h.city,
    address: h.address,
    starRating: h.starRating,
    distanceFromHolyMosqueMeters: h.distanceFromHolyMosqueMeters,
    shortDescription: h.shortDescription,
    imageUrl: h.imageUrl,
    pricePerNight: h.pricePerNight,
    currency: h.currency,
    maxRoomCapacity: h.rooms.reduce((m, r) => Math.max(m, r.capacity), 0),
    isFeatured: h.isFeatured,
    isActive: h.isActive,
    isDemoContent: h.isDemoContent,
  };
}

export interface HotelFilterParams {
  q?: Param;
  minPrice?: Param;
  maxPrice?: Param;
  stars?: Param;
  guests?: Param;
  sort?: Param;
  page?: Param;
}

export function previewSearchHotels(
  city: City | undefined,
  f: HotelFilterParams,
  pageSize = 12,
  featured?: boolean,
): PagedResult<HotelSummary> {
  const q = text(f.q);
  const min = num(f.minPrice);
  const max = num(f.maxPrice);
  const stars = list(f.stars).map(Number).filter((n) => n >= 1 && n <= 5);
  const guests = num(f.guests);

  let result = hotels.filter((h) => h.isActive);
  if (city) result = result.filter((h) => h.city === city);
  if (q) result = result.filter((h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
  if (min !== undefined) result = result.filter((h) => h.pricePerNight >= min);
  if (max !== undefined) result = result.filter((h) => h.pricePerNight <= max);
  if (stars.length) result = result.filter((h) => stars.includes(h.starRating));
  if (guests !== undefined) result = result.filter((h) => h.rooms.some((r) => r.capacity >= guests));
  if (featured !== undefined) result = result.filter((h) => h.isFeatured === featured);

  const sort = (Array.isArray(f.sort) ? f.sort[0] : f.sort) ?? "recommended";
  const byId = (a: HotelDetail, b: HotelDetail) => a.id - b.id;
  const comparators: Record<string, (a: HotelDetail, b: HotelDetail) => number> = {
    price_asc: (a, b) => a.pricePerNight - b.pricePerNight || byId(a, b),
    price_desc: (a, b) => b.pricePerNight - a.pricePerNight || byId(a, b),
    stars_desc: (a, b) => b.starRating - a.starRating || a.pricePerNight - b.pricePerNight || byId(a, b),
    distance_asc: (a, b) =>
      (a.distanceFromHolyMosqueMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceFromHolyMosqueMeters ?? Number.MAX_SAFE_INTEGER) ||
      byId(a, b),
    recommended: (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) || b.starRating - a.starRating || a.pricePerNight - b.pricePerNight || byId(a, b),
  };
  result = [...result].sort(comparators[sort] ?? comparators.recommended);

  return page(result.map(toHotelSummary), f.page, pageSize);
}

export function previewGetHotel(idOrSlug: string): HotelDetail | null {
  const key = idOrSlug.toLowerCase();
  return hotels.find((h) => h.isActive && (h.slug === key || String(h.id) === key)) ?? null;
}

// ---------------- Packages ----------------

function toPackageSummary(p: PackageDetail): PackageSummary {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    packageType: p.packageType,
    durationInDays: p.durationInDays,
    makkahDays: p.makkahDays,
    madinahDays: p.madinahDays,
    price: p.price,
    currency: p.currency,
    shortDescription: p.shortDescription,
    imageUrl: p.imageUrl,
    hotels: p.hotels.map((h) => ({
      hotelId: h.hotelId,
      hotelSlug: h.hotelSlug,
      hotelName: h.hotelName,
      city: h.city,
      starRating: h.starRating,
      nights: h.nights,
    })),
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    isDemoContent: p.isDemoContent,
  };
}

export interface PackageFilterParams {
  q?: Param;
  minPrice?: Param;
  maxPrice?: Param;
  minDays?: Param;
  maxDays?: Param;
  type?: Param;
  sort?: Param;
  page?: Param;
}

export function previewSearchPackages(f: PackageFilterParams, pageSize = 12, featured?: boolean): PagedResult<PackageSummary> {
  const q = text(f.q);
  const minPrice = num(f.minPrice);
  const maxPrice = num(f.maxPrice);
  const minDays = num(f.minDays);
  const maxDays = num(f.maxDays);
  const types = list(f.type) as PackageType[];

  let result = packages.filter((p) => p.isActive);
  if (q) result = result.filter((p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
  if (minPrice !== undefined) result = result.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) result = result.filter((p) => p.price <= maxPrice);
  if (minDays !== undefined) result = result.filter((p) => p.durationInDays >= minDays);
  if (maxDays !== undefined) result = result.filter((p) => p.durationInDays <= maxDays);
  if (types.length) result = result.filter((p) => types.includes(p.packageType));
  if (featured !== undefined) result = result.filter((p) => p.isFeatured === featured);

  const sort = (Array.isArray(f.sort) ? f.sort[0] : f.sort) ?? "recommended";
  const byId = (a: PackageDetail, b: PackageDetail) => a.id - b.id;
  const comparators: Record<string, (a: PackageDetail, b: PackageDetail) => number> = {
    price_asc: (a, b) => a.price - b.price || byId(a, b),
    price_desc: (a, b) => b.price - a.price || byId(a, b),
    duration_asc: (a, b) => a.durationInDays - b.durationInDays || a.price - b.price || byId(a, b),
    duration_desc: (a, b) => b.durationInDays - a.durationInDays || a.price - b.price || byId(a, b),
    recommended: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.price - b.price || byId(a, b),
  };
  result = [...result].sort(comparators[sort] ?? comparators.recommended);

  return page(result.map(toPackageSummary), f.page, pageSize);
}

export function previewGetPackage(idOrSlug: string): PackageDetail | null {
  const key = idOrSlug.toLowerCase();
  return packages.find((p) => p.isActive && (p.slug === key || String(p.id) === key)) ?? null;
}

// ---------------- Visas ----------------

const visas = visaData.visas as unknown as VisaDetail[];

function toVisaSummary(v: VisaDetail): VisaSummary {
  return {
    id: v.id,
    slug: v.slug,
    country: v.country,
    countryCode: v.countryCode,
    imageUrl: v.imageUrl,
    visaFormat: v.visaFormat,
    summary: v.summary,
    processingTime: v.processingTime,
    startingPrice: v.startingPrice,
    currency: v.currency,
    isFeatured: v.isFeatured,
    isActive: v.isActive,
    isDemoContent: v.isDemoContent,
  };
}

export function previewSearchVisas(q?: Param, limit = 50, featuredOnly = false): VisaSummary[] {
  const term = text(q);
  return visas
    .filter((v) => v.isActive && (!featuredOnly || v.isFeatured) && (!term || v.country.toLowerCase().includes(term)))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.country.localeCompare(b.country))
    .slice(0, limit)
    .map(toVisaSummary);
}

export function previewGetVisa(idOrSlug: string): VisaDetail | null {
  const key = idOrSlug.toLowerCase();
  return visas.find((v) => v.isActive && (v.slug === key || String(v.id) === key)) ?? null;
}

// ---------------- Private transport ----------------

export function previewGetTransport(): TransportCatalog {
  const catalog = transportData as unknown as TransportCatalog;
  return {
    vehicles: catalog.vehicles.filter((v) => v.isActive),
    routes: catalog.routes.filter((r) => r.isActive && r.rates.length > 0),
    currency: catalog.currency,
  };
}

export function previewGetTripSettings(): TripSettings {
  return tripSettingsData as TripSettings;
}
