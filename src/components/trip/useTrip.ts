"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { City } from "@/lib/types";
import { defaultLegs, findHotel, findRoom, newLeg, roomOptions, type PlannerHotel, type TripLeg } from "@/lib/trip";

const STORAGE_KEY = "wtk-trip-v1";

type Action =
  | { type: "hydrate"; legs: TripLeg[] }
  | { type: "add"; city: City }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; dir: -1 | 1 }
  | { type: "patch"; id: string; patch: Partial<TripLeg> }
  | { type: "reset" };

function reducer(legs: TripLeg[], action: Action): TripLeg[] {
  switch (action.type) {
    case "hydrate":
      return action.legs;
    case "add": {
      // A new stay starts where the previous one ends.
      const last = legs[legs.length - 1];
      return [...legs, newLeg(action.city, last?.checkOut ?? "")];
    }
    case "remove":
      return legs.length > 1 ? legs.filter((l) => l.id !== action.id) : legs;
    case "move": {
      const i = legs.findIndex((l) => l.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= legs.length) return legs;
      const next = [...legs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }
    case "patch": {
      const i = legs.findIndex((l) => l.id === action.id);
      if (i < 0) return legs;
      const next = legs.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l));
      // Chain dates: when a stay's check-out changes, the next stay can't start before it.
      const following = next[i + 1];
      const checkOut = next[i].checkOut;
      if (action.patch.checkOut !== undefined && following && checkOut && (!following.checkIn || following.checkIn < checkOut)) {
        next[i + 1] = { ...following, checkIn: checkOut };
      }
      return next;
    }
    case "reset":
      return defaultLegs();
  }
}

/** Keeps only saved legs that still match the live catalogue (hotels/rooms may have been edited or removed). */
function sanitize(raw: unknown, hotels: PlannerHotel[]): TripLeg[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const legs: TripLeg[] = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== "object") return null;
    const l = item as Record<string, unknown>;
    if (l.city !== "Makkah" && l.city !== "Madinah") return null;
    const hotel = typeof l.hotelId === "number" ? findHotel(hotels, l.hotelId) : undefined;
    const hotelOk = hotel && hotel.city === l.city;
    const roomOk = hotelOk && typeof l.roomId === "number" && findRoom(hotel, l.roomId);
    const base = newLeg(l.city);
    legs.push({
      ...base,
      hotelId: hotelOk ? hotel.id : null,
      roomId: hotelOk ? (roomOk ? (l.roomId as number) : roomOptions(hotel)[0].id) : null,
      checkIn: typeof l.checkIn === "string" ? l.checkIn : "",
      checkOut: typeof l.checkOut === "string" ? l.checkOut : "",
      rooms: typeof l.rooms === "number" && l.rooms >= 1 ? Math.floor(l.rooms) : 1,
    });
  }
  return legs;
}

export function useTrip(hotels: PlannerHotel[]) {
  const [legs, dispatch] = useReducer(reducer, undefined, defaultLegs);

  // Restore a previously planned trip (browser storage may be unavailable, so every access is guarded).
  useEffect(() => {
    try {
      const saved = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"), hotels);
      if (saved) dispatch({ type: "hydrate", legs: saved });
    } catch {
      /* ignore: fall back to the default trip */
    }
  }, [hotels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legs));
    } catch {
      /* ignore */
    }
  }, [legs]);

  return {
    legs,
    add: useCallback((city: City) => dispatch({ type: "add", city }), []),
    remove: useCallback((id: string) => dispatch({ type: "remove", id }), []),
    move: useCallback((id: string, dir: -1 | 1) => dispatch({ type: "move", id, dir }), []),
    patch: useCallback((id: string, patch: Partial<TripLeg>) => dispatch({ type: "patch", id, patch }), []),
    reset: useCallback(() => dispatch({ type: "reset" }), []),
  };
}
