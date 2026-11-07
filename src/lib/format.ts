import type { City } from "./types";

export function formatPrice(amount: number, currency = "PKR"): string {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-PK")}`;
  }
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1).replace(/\.0$/, "")} km`;
}

export const HOLY_MOSQUE: Record<City, string> = {
  Makkah: "Masjid al-Haram",
  Madinah: "Masjid an-Nabawi",
};

export function citySlug(city: City): "makkah" | "madinah" {
  return city.toLowerCase() as "makkah" | "madinah";
}

export function cityFromSlug(slug: string): City | null {
  const s = slug.toLowerCase();
  return s === "makkah" ? "Makkah" : s === "madinah" ? "Madinah" : null;
}

export function hotelHref(hotel: { city: City; slug: string }): string {
  return `/hotels/${citySlug(hotel.city)}/${hotel.slug}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
