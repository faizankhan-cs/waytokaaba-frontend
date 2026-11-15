"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { City } from "@/lib/types";
import {
  DEFAULT_GUESTS,
  clampGuests,
  defaultLegs,
  findHotel,
  findRoom,
  legMinRooms,
  newLeg,
  roomOptions,
  type Guests,
  type PlannerHotel,
  type TripLeg,
} from "@/lib/trip";

const STORAGE_KEY = "wtk-trip-v2";
const OLD_STORAGE_KEY = "wtk-trip-v1";

export interface TripState {
  legs: TripLeg[];
  guests: Guests;
  /** The customer ticked "Add Visa & transport". */
  visaTransport: boolean;
}

type Action =
  | { type: "hydrate"; state: TripState }
  | { type: "add"; city: City }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; dir: -1 | 1 }
  | { type: "patch"; id: string; patch: Partial<TripLeg>; hotels: PlannerHotel[] }
  | { type: "guests"; guests: Guests; hotels: PlannerHotel[] }
  | { type: "visaTransport"; on: boolean }
  | { type: "reset" };

function initialState(): TripState {
  return { legs: defaultLegs(), guests: DEFAULT_GUESTS, visaTransport: false };
}

/** Sets a leg's rooms to the fewest that fit the guests (used when the guests or the room type change). */
function fitRooms(leg: TripLeg, hotels: PlannerHotel[], guests: Guests): TripLeg {
  if (leg.roomId === null) return leg;
  return { ...leg, rooms: legMinRooms(leg, hotels, guests) };
}

function reducer(state: TripState, action: Action): TripState {
  const { legs } = state;
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add": {
      // A new stay starts where the previous one ends.
      const last = legs[legs.length - 1];
      return { ...state, legs: [...legs, newLeg(action.city, last?.checkOut ?? "")] };
    }
    case "remove":
      return legs.length > 1 ? { ...state, legs: legs.filter((l) => l.id !== action.id) } : state;
    case "move": {
      const i = legs.findIndex((l) => l.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= legs.length) return state;
      const next = [...legs];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...state, legs: next };
    }
    case "patch": {
      const i = legs.findIndex((l) => l.id === action.id);
      if (i < 0) return state;
      const next = [...legs];
      next[i] = { ...legs[i], ...action.patch };
      // A new hotel or room type: start from the fewest rooms that fit everyone (the customer can add more).
      if (action.patch.hotelId !== undefined || action.patch.roomId !== undefined) {
        next[i] = fitRooms(next[i], action.hotels, state.guests);
      }
      // Chain dates: when a stay's check-out changes, the next stay can't start before it.
      const following = next[i + 1];
      const checkOut = next[i].checkOut;
      if (action.patch.checkOut !== undefined && following && checkOut && (!following.checkIn || following.checkIn < checkOut)) {
        next[i + 1] = { ...following, checkIn: checkOut };
      }
      return { ...state, legs: next };
    }
    case "guests": {
      const guests = clampGuests(action.guests);
      return { ...state, guests, legs: legs.map((l) => fitRooms(l, action.hotels, guests)) };
    }
    case "visaTransport":
      return { ...state, visaTransport: action.on };
    case "reset":
      return initialState();
  }
}

/** Keeps only saved legs that still match the live catalogue (hotels/rooms may have been edited or removed). */
function sanitizeLegs(raw: unknown, hotels: PlannerHotel[], guests: Guests): TripLeg[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const legs: TripLeg[] = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== "object") return null;
    const l = item as Record<string, unknown>;
    if (l.city !== "Makkah" && l.city !== "Madinah") return null;
    const hotel = typeof l.hotelId === "number" ? findHotel(hotels, l.hotelId) : undefined;
    const hotelOk = hotel && hotel.city === l.city;
    const roomOk = hotelOk && typeof l.roomId === "number" && findRoom(hotel, l.roomId);
    const leg: TripLeg = {
      ...newLeg(l.city),
      hotelId: hotelOk ? hotel.id : null,
      roomId: hotelOk ? (roomOk ? (l.roomId as number) : roomOptions(hotel)[0].id) : null,
      checkIn: typeof l.checkIn === "string" ? l.checkIn : "",
      checkOut: typeof l.checkOut === "string" ? l.checkOut : "",
      rooms: typeof l.rooms === "number" && l.rooms >= 1 ? Math.floor(l.rooms) : 1,
    };
    // Never restore fewer rooms than the guests need.
    legs.push({ ...leg, rooms: Math.max(leg.rooms, legMinRooms(leg, hotels, guests)) });
  }
  return legs;
}

function readSaved(hotels: PlannerHotel[]): TripState | null {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Record<string, unknown> | null;
  if (saved && typeof saved === "object") {
    const guests = clampGuests((saved.guests ?? {}) as Partial<Guests>);
    const legs = sanitizeLegs(saved.legs, hotels, guests);
    if (legs) return { legs, guests, visaTransport: saved.visaTransport === true };
  }
  // Trips planned before guests existed were stored as a bare list of stays.
  const old = sanitizeLegs(JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) ?? "null"), hotels, DEFAULT_GUESTS);
  return old ? { legs: old, guests: DEFAULT_GUESTS, visaTransport: false } : null;
}

export function useTrip(hotels: PlannerHotel[]) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Restore a previously planned trip (browser storage may be unavailable, so every access is guarded).
  useEffect(() => {
    try {
      const saved = readSaved(hotels);
      if (saved) dispatch({ type: "hydrate", state: saved });
    } catch {
      /* ignore: fall back to the default trip */
    }
  }, [hotels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  return {
    ...state,
    add: useCallback((city: City) => dispatch({ type: "add", city }), []),
    remove: useCallback((id: string) => dispatch({ type: "remove", id }), []),
    move: useCallback((id: string, dir: -1 | 1) => dispatch({ type: "move", id, dir }), []),
    patch: useCallback((id: string, patch: Partial<TripLeg>) => dispatch({ type: "patch", id, patch, hotels }), [hotels]),
    setGuests: useCallback((guests: Guests) => dispatch({ type: "guests", guests, hotels }), [hotels]),
    setVisaTransport: useCallback((on: boolean) => dispatch({ type: "visaTransport", on }), []),
    reset: useCallback(() => dispatch({ type: "reset" }), []),
  };
}
