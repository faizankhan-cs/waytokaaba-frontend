import type { City } from "./types";

/** Hotel + room data the trip planner needs (trimmed from HotelDetail so it is cheap to ship to the browser). */
export interface PlannerRoom {
  id: number;
  name: string;
  capacity: number;
  pricePerNight: number;
}

export interface PlannerHotel {
  id: number;
  name: string;
  city: City;
  starRating: number;
  pricePerNight: number;
  currency: string;
  rooms: PlannerRoom[];
}

/** One stay in the itinerary. Dates are `YYYY-MM-DD` strings (empty until chosen). */
export interface TripLeg {
  id: string;
  city: City;
  hotelId: number | null;
  roomId: number | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
}

export interface TripCustomer {
  name: string;
  phone: string;
}

export interface SlipLeg {
  city: City;
  hotelName: string;
  starRating: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  rate: number;
  subtotal: number;
}

export interface Slip {
  reference: string;
  createdAt: string;
  customer: TripCustomer;
  legs: SlipLeg[];
  totalNights: number;
  total: number;
  currency: string;
}

export const MAX_ROOMS = 20;
export const DISCLAIMER =
  "This is an estimate based on indicative nightly rates, not a confirmed booking. Availability and final prices are confirmed by our team.";

const DAY_MS = 86_400_000;

function parseDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const t = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(t) ? null : t;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseDay(checkIn);
  const b = parseDay(checkOut);
  if (a === null || b === null) return 0;
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

/** "12 Dec 2026" — formatted in UTC so a date-only string never shifts a day with the viewer's time zone. */
export function formatStayDate(value: string): string {
  const t = parseDay(value);
  if (t === null) return "—";
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Room types of a hotel; a hotel with no room types is offered as a single "Standard room" at its nightly price. */
export function roomOptions(hotel: PlannerHotel): PlannerRoom[] {
  return hotel.rooms.length > 0
    ? hotel.rooms
    : [{ id: 0, name: "Standard room", capacity: 2, pricePerNight: hotel.pricePerNight }];
}

export function findHotel(hotels: PlannerHotel[], hotelId: number | null) {
  return hotelId === null ? undefined : hotels.find((h) => h.id === hotelId);
}

export function findRoom(hotel: PlannerHotel | undefined, roomId: number | null) {
  return hotel ? roomOptions(hotel).find((r) => r.id === roomId) : undefined;
}

export function legNights(leg: TripLeg): number {
  return nightsBetween(leg.checkIn, leg.checkOut);
}

/** room price x nights x number of rooms (0 until the leg is complete). */
export function legTotal(leg: TripLeg, hotels: PlannerHotel[]): number {
  const room = findRoom(findHotel(hotels, leg.hotelId), leg.roomId);
  if (!room || !Number.isInteger(leg.rooms) || leg.rooms < 1) return 0;
  return room.pricePerNight * legNights(leg) * leg.rooms;
}

/** Returns the first problem with a leg, or null when it is ready to be quoted. */
export function legProblem(leg: TripLeg, hotels: PlannerHotel[]): string | null {
  const hotel = findHotel(hotels, leg.hotelId);
  if (!hotel) return "Choose a hotel.";
  if (!findRoom(hotel, leg.roomId)) return "Choose a room type.";
  if (!leg.checkIn || !leg.checkOut) return "Choose check-in and check-out dates.";
  if (legNights(leg) < 1) return "Check-out must be after check-in.";
  if (!Number.isInteger(leg.rooms) || leg.rooms < 1 || leg.rooms > MAX_ROOMS) return `Rooms must be between 1 and ${MAX_ROOMS}.`;
  return null;
}

export function tripTotal(legs: TripLeg[], hotels: PlannerHotel[]): number {
  return legs.reduce((sum, leg) => sum + legTotal(leg, hotels), 0);
}

export function tripNights(legs: TripLeg[]): number {
  return legs.reduce((sum, leg) => sum + legNights(leg), 0);
}

/** Currency of the chosen hotels (the catalogue is single-currency, PKR). */
export function tripCurrency(legs: TripLeg[], hotels: PlannerHotel[]): string {
  return findHotel(hotels, legs.find((l) => l.hotelId !== null)?.hotelId ?? null)?.currency ?? hotels[0]?.currency ?? "PKR";
}

let legCounter = 0;
export function newLegId(): string {
  legCounter += 1;
  return `leg-${Date.now().toString(36)}-${legCounter}`;
}

export function newLeg(city: City, checkIn = ""): TripLeg {
  return { id: newLegId(), city, hotelId: null, roomId: null, checkIn, checkOut: "", rooms: 1 };
}

/** The round trip the client described: Makkah, then Madinah, then back to Makkah. */
export function defaultLegs(): TripLeg[] {
  return [newLeg("Makkah"), newLeg("Madinah"), newLeg("Makkah")];
}

/** Human-friendly slip number, e.g. WTK-261112-7KQ2. */
export function slipReference(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X");
  return `WTK-${yy}${mm}${dd}-${rand}`;
}

export function buildSlip(legs: TripLeg[], hotels: PlannerHotel[], customer: TripCustomer, reference: string): Slip {
  const slipLegs: SlipLeg[] = legs.map((leg) => {
    const hotel = findHotel(hotels, leg.hotelId)!;
    const room = findRoom(hotel, leg.roomId)!;
    const nights = legNights(leg);
    return {
      city: leg.city,
      hotelName: hotel.name,
      starRating: hotel.starRating,
      roomName: room.name,
      checkIn: leg.checkIn,
      checkOut: leg.checkOut,
      nights,
      rooms: leg.rooms,
      rate: room.pricePerNight,
      subtotal: room.pricePerNight * nights * leg.rooms,
    };
  });
  return {
    reference,
    createdAt: new Date().toISOString(),
    customer: { name: customer.name.trim(), phone: customer.phone.trim() },
    legs: slipLegs,
    totalNights: slipLegs.reduce((s, l) => s + l.nights, 0),
    total: slipLegs.reduce((s, l) => s + l.subtotal, 0),
    currency: tripCurrency(legs, hotels),
  };
}

/** Plain "PKR 20,000" — used in the PDF and WhatsApp text, where Intl currency symbols and fonts are unreliable. */
export function money(amount: number, currency: string): string {
  return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
}

export function buildWhatsAppText(slip: Slip): string {
  const lines: string[] = ["*Way To Kaaba — Trip Estimate*", `Ref: ${slip.reference}`];
  if (slip.customer.name) lines.push(`Name: ${slip.customer.name}`);
  if (slip.customer.phone) lines.push(`Phone: ${slip.customer.phone}`);
  lines.push("");
  slip.legs.forEach((leg, i) => {
    lines.push(
      `${i + 1}) *${leg.city}* — ${leg.hotelName} (${leg.starRating}★)`,
      `   ${leg.roomName} × ${leg.rooms} ${leg.rooms === 1 ? "room" : "rooms"}`,
      `   ${formatStayDate(leg.checkIn)} → ${formatStayDate(leg.checkOut)} · ${leg.nights} ${leg.nights === 1 ? "night" : "nights"}`,
      `   ${money(leg.rate, slip.currency)} × ${leg.nights} × ${leg.rooms} = ${money(leg.subtotal, slip.currency)}`,
      "",
    );
  });
  lines.push(`*Total: ${money(slip.total, slip.currency)}* (${slip.totalNights} nights)`, "", `_${DISCLAIMER}_`);
  return lines.join("\n");
}
