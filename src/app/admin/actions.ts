"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { adminSend, adminUpload, toFormError } from "@/lib/admin/api";
import { clearAdminSession, setAdminSession } from "@/lib/admin/session";
import { readProblem } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config";
import type { HotelDetail, InquiryStatus, PackageDetail, Room, TransportRoute, TransportVehicle, TripSettings, VisaDetail } from "@/lib/types";

export type FormState = {
  message?: string;
  success?: string;
  /** True when the API refused an action that isn't allowed (HTTP 409), as opposed to a failure. */
  warning?: boolean;
  fieldErrors?: Record<string, string>;
};

// ---------------- helpers ----------------

const text = (fd: FormData, key: string) => fd.get(key)?.toString().trim() ?? "";
const optionalText = (fd: FormData, key: string) => text(fd, key) || null;
const num = (fd: FormData, key: string) => {
  const v = text(fd, key);
  return v === "" ? null : Number(v);
};
const bool = (fd: FormData, key: string) => fd.get(key) === "on";
const lines = (fd: FormData, key: string) =>
  text(fd, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

function safeAdminPath(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

// ---------------- auth ----------------

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email");
  const password = fd.get("password")?.toString() ?? "";
  if (!email || !password) return { message: "Please enter your email and password." };

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return { message: "Could not reach the API. It may be starting up — please try again in a few seconds." };
  }

  if (res.status === 401) return { message: "Invalid email or password." };
  if (res.status === 429) return { message: "Too many login attempts. Please wait a few minutes." };
  if (!res.ok) return { message: (await readProblem(res))?.title ?? "Login failed." };

  const { accessToken, expiresAt } = (await res.json()) as { accessToken: string; expiresAt: string };
  await setAdminSession(accessToken, expiresAt);
  redirect(safeAdminPath(text(fd, "next")));
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

// ---------------- inquiries ----------------

export async function updateInquiryStatusAction(fd: FormData) {
  const id = Number(text(fd, "id"));
  const status = text(fd, "status") as InquiryStatus;
  await adminSend("PATCH", `/api/inquiries/${id}/status`, { status });
  refresh();
}

// ---------------- hotels ----------------

function hotelPayload(fd: FormData) {
  return {
    name: text(fd, "name"),
    slug: optionalText(fd, "slug"),
    city: text(fd, "city"),
    address: text(fd, "address"),
    starRating: num(fd, "starRating"),
    distanceFromHolyMosqueMeters: num(fd, "distanceFromHolyMosqueMeters"),
    isDistanceVerified: bool(fd, "isDistanceVerified"),
    pricePerNight: num(fd, "pricePerNight"),
    currency: text(fd, "currency").toUpperCase() || "PKR",
    shortDescription: text(fd, "shortDescription"),
    description: text(fd, "description"),
    imageUrl: text(fd, "imageUrl"),
    amenities: lines(fd, "amenities"),
    images: lines(fd, "images").map((url) => ({ url, caption: null })),
    isFeatured: bool(fd, "isFeatured"),
    isActive: bool(fd, "isActive"),
    isDemoContent: bool(fd, "isDemoContent"),
  };
}

export async function saveHotelAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = num(fd, "id");
  const result = id
    ? await adminSend<HotelDetail>("PUT", `/api/hotels/${id}`, hotelPayload(fd))
    : await adminSend<HotelDetail>("POST", "/api/hotels", hotelPayload(fd));

  if (!result.ok) return toFormError(result);
  if (!id) redirect(`/admin/hotels/${result.data!.id}?created=1`);
  refresh();
  return { success: "Hotel saved." };
}

export async function deleteHotelAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/hotels/${num(fd, "id")}`);
  if (!result.ok) return toFormError(result);
  redirect("/admin/hotels?deleted=1");
}

export async function saveRoomAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const hotelId = num(fd, "hotelId");
  const roomId = num(fd, "roomId");
  const payload = {
    name: text(fd, "name"),
    description: optionalText(fd, "description"),
    capacity: num(fd, "capacity"),
    bedConfiguration: optionalText(fd, "bedConfiguration"),
    pricePerNight: num(fd, "pricePerNight"),
    imageUrl: optionalText(fd, "imageUrl"),
  };
  const result = roomId
    ? await adminSend<Room>("PUT", `/api/hotels/${hotelId}/rooms/${roomId}`, payload)
    : await adminSend<Room>("POST", `/api/hotels/${hotelId}/rooms`, payload);

  if (!result.ok) return toFormError(result);
  refresh();
  return { success: roomId ? "Room updated." : "Room added." };
}

export async function deleteRoomAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/hotels/${num(fd, "hotelId")}/rooms/${num(fd, "roomId")}`);
  if (!result.ok) return toFormError(result);
  refresh();
  return { success: "Room deleted." };
}

// ---------------- packages ----------------

function packagePayload(fd: FormData) {
  const hotelIds = fd.getAll("hotelId").map(String);
  const nights = fd.getAll("hotelNights").map(String);
  return {
    name: text(fd, "name"),
    slug: optionalText(fd, "slug"),
    packageType: text(fd, "packageType"),
    durationInDays: num(fd, "durationInDays"),
    makkahDays: num(fd, "makkahDays"),
    madinahDays: num(fd, "madinahDays"),
    price: num(fd, "price"),
    currency: text(fd, "currency").toUpperCase() || "PKR",
    shortDescription: text(fd, "shortDescription"),
    description: text(fd, "description"),
    imageUrl: text(fd, "imageUrl"),
    isFeatured: bool(fd, "isFeatured"),
    isActive: bool(fd, "isActive"),
    isDemoContent: bool(fd, "isDemoContent"),
    hotels: hotelIds
      .map((h, i) => ({ hotelId: Number(h), nights: Number(nights[i]) }))
      .filter((h) => h.hotelId > 0),
    // One service per line: "Service name | optional description"
    services: lines(fd, "services").map((line) => {
      const [name, ...rest] = line.split("|");
      return { serviceName: name.trim(), description: rest.join("|").trim() || null };
    }),
    images: lines(fd, "images").map((url) => ({ url, caption: null })),
  };
}

export async function savePackageAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = num(fd, "id");
  const result = id
    ? await adminSend<PackageDetail>("PUT", `/api/packages/${id}`, packagePayload(fd))
    : await adminSend<PackageDetail>("POST", "/api/packages", packagePayload(fd));

  if (!result.ok) return toFormError(result);
  if (!id) redirect(`/admin/packages/${result.data!.id}?created=1`);
  refresh();
  return { success: "Package saved." };
}

export async function deletePackageAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/packages/${num(fd, "id")}`);
  if (!result.ok) return toFormError(result);
  redirect("/admin/packages?deleted=1");
}

// ---------------- visas ----------------

function visaPayload(fd: FormData) {
  const tierNames = fd.getAll("tierName").map(String);
  const tierDescriptions = fd.getAll("tierDescription").map(String);
  const tierPrices = fd.getAll("tierPrice").map(String);
  return {
    country: text(fd, "country"),
    slug: optionalText(fd, "slug"),
    countryCode: text(fd, "countryCode").toUpperCase(),
    imageUrl: text(fd, "imageUrl"),
    visaFormat: text(fd, "visaFormat"),
    summary: text(fd, "summary"),
    processingTime: text(fd, "processingTime"),
    validity: text(fd, "validity"),
    allowedStay: text(fd, "allowedStay"),
    entryType: text(fd, "entryType"),
    includesEmbassyFee: bool(fd, "includesEmbassyFee"),
    includesInsurance: bool(fd, "includesInsurance"),
    includesServiceCharge: bool(fd, "includesServiceCharge"),
    requiredDocuments: lines(fd, "requiredDocuments"),
    disclaimer: optionalText(fd, "disclaimer"),
    sortOrder: num(fd, "sortOrder") ?? 0,
    isFeatured: bool(fd, "isFeatured"),
    isActive: bool(fd, "isActive"),
    isDemoContent: bool(fd, "isDemoContent"),
    // Rows left completely empty are ignored.
    tiers: tierNames
      .map((name, i) => ({ name: name.trim(), description: tierDescriptions[i]?.trim() || null, priceText: tierPrices[i]?.trim() ?? "" }))
      .filter((t) => t.name !== "" || t.priceText !== "")
      .map((t) => ({ name: t.name, description: t.description, price: Number(t.priceText) })),
  };
}

export async function saveVisaAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = num(fd, "id");
  const result = id
    ? await adminSend<VisaDetail>("PUT", `/api/visas/${id}`, visaPayload(fd))
    : await adminSend<VisaDetail>("POST", "/api/visas", visaPayload(fd));

  if (!result.ok) return toFormError(result);
  if (!id) redirect(`/admin/visas/${result.data!.id}?created=1`);
  refresh();
  return { success: "Visa saved." };
}

export async function deleteVisaAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/visas/${num(fd, "id")}`);
  if (!result.ok) return toFormError(result);
  redirect("/admin/visas?deleted=1");
}

// ---------------- transport ----------------

function vehiclePayload(fd: FormData) {
  return {
    name: text(fd, "name"),
    imageUrl: text(fd, "imageUrl"),
    seats: num(fd, "seats") ?? 0,
    bags: num(fd, "bags") ?? 0,
    description: optionalText(fd, "description"),
    sortOrder: num(fd, "sortOrder") ?? 0,
    isActive: bool(fd, "isActive"),
    isDemoContent: bool(fd, "isDemoContent"),
  };
}

/** Route prices come from one input per vehicle named "price_<vehicleId>"; an empty input means "not offered". */
function routePayload(fd: FormData) {
  const prices = [...fd.keys()]
    .filter((k) => k.startsWith("price_"))
    .map((k) => ({ vehicleId: Number(k.slice("price_".length)), price: num(fd, k) }))
    .filter((p): p is { vehicleId: number; price: number } => p.price !== null);
  return {
    from: text(fd, "from"),
    to: optionalText(fd, "to"),
    note: optionalText(fd, "note"),
    sortOrder: num(fd, "sortOrder") ?? 0,
    isActive: bool(fd, "isActive"),
    isDemoContent: bool(fd, "isDemoContent"),
    prices,
  };
}

export async function saveTransportVehicleAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = num(fd, "id");
  const result = id
    ? await adminSend<TransportVehicle>("PUT", `/api/transport/vehicles/${id}`, vehiclePayload(fd))
    : await adminSend<TransportVehicle>("POST", "/api/transport/vehicles", vehiclePayload(fd));

  if (!result.ok) return toFormError(result);
  if (!id) redirect(`/admin/transport/vehicles/${result.data!.id}?created=1`);
  refresh();
  return { success: "Vehicle saved." };
}

export async function deleteTransportVehicleAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/transport/vehicles/${num(fd, "id")}`);
  if (!result.ok) return toFormError(result);
  redirect("/admin/transport?deleted=vehicle");
}

export async function saveTransportRouteAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = num(fd, "id");
  const result = id
    ? await adminSend<TransportRoute>("PUT", `/api/transport/routes/${id}`, routePayload(fd))
    : await adminSend<TransportRoute>("POST", "/api/transport/routes", routePayload(fd));

  if (!result.ok) return toFormError(result);
  if (!id) redirect(`/admin/transport/routes/${result.data!.id}?created=1`);
  refresh();
  return { success: "Route saved." };
}

export async function deleteTransportRouteAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend("DELETE", `/api/transport/routes/${num(fd, "id")}`);
  if (!result.ok) return toFormError(result);
  redirect("/admin/transport?deleted=route");
}

// ---------------- photo upload ----------------

const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Uploads one photo for an admin image field and returns its URL (or a short error to show next to the field). */
export async function uploadImageAction(fd: FormData): Promise<{ url?: string; error?: string }> {
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a photo." };
  if (file.type && !UPLOAD_TYPES.includes(file.type)) return { error: "Please choose a JPG, PNG or WebP photo." };
  if (file.size > UPLOAD_MAX_BYTES) return { error: "This photo is larger than 10 MB. Please choose a smaller one." };

  const result = await adminUpload(file);
  if (result.ok) return { url: result.data!.url };
  if (result.status === 0) return { error: "The upload took too long. Please check your connection and try again." };
  const fieldError = result.problem?.errors?.file?.join(" ") ?? result.problem?.errors?.File?.join(" ");
  return { error: fieldError ?? result.problem?.detail ?? "Upload failed. Please try again." };
}

// ---------------- round trip settings ----------------

export async function saveTripSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await adminSend<TripSettings>("PUT", "/api/trip-settings", {
    visaTransportPricePerPerson: num(fd, "visaTransportPricePerPerson"),
  });
  if (!result.ok) return toFormError(result);
  refresh();
  return { success: "Settings saved." };
}
