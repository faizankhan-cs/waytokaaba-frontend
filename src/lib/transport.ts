import type { TransportRoute, TransportVehicle } from "./types";

/** "Jeddah → Makkah", or just the name for a round tour such as "Madinah Ziyarat". */
export function routeLabel(route: Pick<TransportRoute, "from" | "to">): string {
  return route.to ? `${route.from} → ${route.to}` : route.from;
}

/** Price of a vehicle on a route, or null when that vehicle is not offered there. */
export function priceFor(route: TransportRoute, vehicleId: number): number | null {
  return route.rates.find((r) => r.vehicleId === vehicleId)?.price ?? null;
}

/** Pre-filled WhatsApp message for booking a vehicle on a route. */
export function transportMessage(route: Pick<TransportRoute, "from" | "to">, vehicle: Pick<TransportVehicle, "name">): string {
  return `Assalam-o-Alaikum, I want to book private transport: ${routeLabel(route)} by ${vehicle.name}.`;
}

/** Booking terms shown under the rates. */
export const TRANSPORT_NOTES = [
  "Prices are per vehicle, one way, in PKR.",
  "Please share your arrival details at least 24 hours in advance.",
  "30% of the fare is charged for a no-show.",
  "An extra charge applies for pick-ups from the Hajj Terminal at Jeddah airport.",
  "Rates can change during peak season. Our team confirms the final price before you pay.",
] as const;
