/**
 * Base URL of the Waytokaaba API (no trailing slash).
 *
 * - NEXT_PUBLIC_API_BASE_URL is inlined at build time and used by the browser (e.g. inquiry form).
 * - API_BASE_URL (optional, server-only) lets server-side requests use a different/internal URL.
 *
 * Both must point to the deployed API in production — never localhost.
 */
/**
 * Preview mode (NEXT_PUBLIC_PREVIEW_MODE=true): the site serves bundled sample data instead of calling the API,
 * inquiries open WhatsApp, and the admin area is unavailable. Used for client reviews before the backend is deployed.
 */
export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export function getApiBaseUrl(): string {
  const isServer = typeof window === "undefined";
  const url = (isServer ? process.env.API_BASE_URL : undefined) ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!url) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL (and optionally API_BASE_URL) — see frontend/.env.example.",
    );
  }
  return url.replace(/\/+$/, "");
}

export const SITE = {
  name: "Way To Kaaba",
  legalName: "Way To Kaaba Travel & Tours",
  tagline: "Umrah packages and hotels in Makkah & Madinah",
  description:
    "Discover carefully selected Umrah packages and comfortable hotels in Makkah and Madinah. Send an inquiry and our team will get back to you with availability and pricing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** Official contact details — used by the footer, contact page and structured data. */
const ADDRESS_LINES = [
  "Office No. 4, Floor 2, Allay Plaza",
  "Near PIA Building, Fazal-e-Haq Road",
  "Blue Area, Islamabad 44000, Pakistan",
] as const;

export const CONTACT = {
  email: "waytokaaba786@gmail.com",
  phoneDisplay: "+92 344 5010005",
  phoneE164: "+923445010005",
  /** Same number is on WhatsApp. Opens a chat with a friendly pre-filled message. */
  whatsappUrl: `https://wa.me/923445010005?text=${encodeURIComponent("Assalam o Alaikum, I would like information about Umrah packages / hotels.")}`,
  facebookUrl: "https://www.facebook.com/p/Way-To-Kaaba-61590258233283/",
  addressLines: ADDRESS_LINES,
  address: ADDRESS_LINES.join(", "),
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Allay Plaza, Fazal-e-Haq Road, Blue Area, Islamabad")}`,
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent("Allay Plaza, Fazal-e-Haq Road, Blue Area, Islamabad, Pakistan")}&output=embed`,
} as const;
