import { pluralize } from "./format";
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

/** Travellers on the trip. Set once (in the first stay) and shared by every stay. */
export interface Guests {
  adults: number;
  children: number;
  infants: number;
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

export interface SlipVisaTransport {
  rate: number;
  people: number;
  total: number;
}

export interface Slip {
  reference: string;
  createdAt: string;
  customer: TripCustomer;
  guests: Guests;
  /** Present when the customer ticked "Add Visa & transport". */
  visaTransport: SlipVisaTransport | null;
  legs: SlipLeg[];
  totalNights: number;
  accommodationTotal: number;
  /** Grand total: accommodation plus visa & transport (when added). */
  total: number;
  currency: string;
}

export const MAX_ROOMS = 20;
export const MAX_ADULTS = 20;
export const MAX_CHILDREN = 20;
export const DEFAULT_GUESTS: Guests = { adults: 1, children: 0, infants: 0 };
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

// ---------------- guests ----------------

/** Keeps guest counts whole and in range; infants can't outnumber adults (one infant per adult, as airlines do). */
export function clampGuests(g: Partial<Guests>): Guests {
  const whole = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.floor(v))) : min;
  const adults = whole(g.adults, 1, MAX_ADULTS);
  return { adults, children: whole(g.children, 0, MAX_CHILDREN), infants: whole(g.infants, 0, adults) };
}

/** Guests who need a bed: adults and children. Infants share a bed. */
export function roomGuests(g: Guests): number {
  return g.adults + g.children;
}

export function totalGuests(g: Guests): number {
  return g.adults + g.children + g.infants;
}

/** "2 adults, 1 child, 1 infant" (zero counts are left out; adults are always shown). */
export function guestSummary(g: Guests): string {
  const parts = [pluralize(g.adults, "adult")];
  if (g.children > 0) parts.push(pluralize(g.children, "child", "children"));
  if (g.infants > 0) parts.push(pluralize(g.infants, "infant"));
  return parts.join(", ");
}

// ---------------- hotels & rooms ----------------

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

/** Fewest rooms of this type that fit every adult and child. */
export function minRooms(room: PlannerRoom | undefined, guests: Guests): number {
  if (!room || room.capacity < 1) return 1;
  return Math.max(1, Math.ceil(roomGuests(guests) / room.capacity));
}

export function legMinRooms(leg: TripLeg, hotels: PlannerHotel[], guests: Guests): number {
  return minRooms(findRoom(findHotel(hotels, leg.hotelId), leg.roomId), guests);
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
export function legProblem(leg: TripLeg, hotels: PlannerHotel[], guests: Guests): string | null {
  const hotel = findHotel(hotels, leg.hotelId);
  if (!hotel) return "Choose a hotel.";
  const room = findRoom(hotel, leg.roomId);
  if (!room) return "Choose a room type.";
  if (!leg.checkIn || !leg.checkOut) return "Choose check-in and check-out dates.";
  if (legNights(leg) < 1) return "Check-out must be after check-in.";
  if (!Number.isInteger(leg.rooms) || leg.rooms < 1 || leg.rooms > MAX_ROOMS) return `Rooms must be between 1 and ${MAX_ROOMS}.`;
  const needed = minRooms(room, guests);
  const people = pluralize(roomGuests(guests), "guest");
  if (needed > MAX_ROOMS) return `A ${room.name} sleeps ${room.capacity}; choose a larger room type for ${people}.`;
  if (leg.rooms < needed) return `At least ${pluralize(needed, "room")} needed for ${people} (a ${room.name} sleeps ${room.capacity}).`;
  return null;
}

export function tripTotal(legs: TripLeg[], hotels: PlannerHotel[]): number {
  return legs.reduce((sum, leg) => sum + legTotal(leg, hotels), 0);
}

export function tripNights(legs: TripLeg[]): number {
  return legs.reduce((sum, leg) => sum + legNights(leg), 0);
}

/** Visa & transport for every guest, infants included (null when no price is set). */
export function visaTransportFor(guests: Guests, rate: number | null): SlipVisaTransport | null {
  if (rate === null || !(rate > 0)) return null;
  const people = totalGuests(guests);
  return { rate, people, total: rate * people };
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

/** `visaTransportRate` is the per-guest price when the customer ticked "Add Visa & transport", otherwise null. */
export function buildSlip(
  legs: TripLeg[],
  hotels: PlannerHotel[],
  guests: Guests,
  visaTransportRate: number | null,
  customer: TripCustomer,
  reference: string,
): Slip {
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
  const accommodationTotal = slipLegs.reduce((s, l) => s + l.subtotal, 0);
  const visaTransport = visaTransportFor(guests, visaTransportRate);
  return {
    reference,
    createdAt: new Date().toISOString(),
    customer: { name: customer.name.trim(), phone: customer.phone.trim() },
    guests,
    visaTransport,
    legs: slipLegs,
    totalNights: slipLegs.reduce((s, l) => s + l.nights, 0),
    accommodationTotal,
    total: accommodationTotal + (visaTransport?.total ?? 0),
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
  lines.push(`Guests: ${guestSummary(slip.guests)}`, "");

  const v = slip.visaTransport;
  if (v) {
    lines.push(
      "*1. Visa & transport*",
      `   ${money(v.rate, slip.currency)} × ${pluralize(v.people, "guest")} = ${money(v.total, slip.currency)}`,
      "",
      "*2. Accommodation*",
    );
  }
  slip.legs.forEach((leg, i) => {
    lines.push(
      `${i + 1}) *${leg.city}* — ${leg.hotelName} (${leg.starRating}★)`,
      `   ${leg.roomName} × ${leg.rooms} ${leg.rooms === 1 ? "room" : "rooms"}`,
      `   ${formatStayDate(leg.checkIn)} → ${formatStayDate(leg.checkOut)} · ${leg.nights} ${leg.nights === 1 ? "night" : "nights"}`,
      `   ${money(leg.rate, slip.currency)} × ${leg.nights} × ${leg.rooms} = ${money(leg.subtotal, slip.currency)}`,
      "",
    );
  });

  if (v) {
    lines.push(
      `Accommodation total: ${money(slip.accommodationTotal, slip.currency)} (${pluralize(slip.totalNights, "night")})`,
      "",
      `Visa & transport: ${money(v.total, slip.currency)}`,
      `Accommodation: ${money(slip.accommodationTotal, slip.currency)}`,
      `*Grand total: ${money(slip.total, slip.currency)}*`,
    );
  } else {
    lines.push(`*Total: ${money(slip.total, slip.currency)}* (${pluralize(slip.totalNights, "night")})`);
  }
  lines.push("", `_${DISCLAIMER}_`);
  return lines.join("\n");
}
