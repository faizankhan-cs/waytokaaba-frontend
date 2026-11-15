"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { StarRating } from "@/components/ui/primitives";
import { formatPrice, pluralize } from "@/lib/format";
import { GuestPicker } from "./GuestPicker";
import {
  MAX_ROOMS,
  findHotel,
  guestSummary,
  legMinRooms,
  roomGuests,
  legNights,
  legProblem,
  legTotal,
  roomOptions,
  type Guests,
  type PlannerHotel,
  type TripLeg,
} from "@/lib/trip";
import type { City } from "@/lib/types";

interface Props {
  leg: TripLeg;
  index: number;
  hotels: PlannerHotel[];
  guests: Guests;
  /** Guests are only edited in the first stay; the others show them read-only. */
  onGuestsChange: (guests: Guests) => void;
  showProblem: boolean;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onPatch: (patch: Partial<TripLeg>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export function LegCard({ leg, index, hotels, guests, onGuestsChange, showProblem, isFirst, isLast, canRemove, onPatch, onMove, onRemove }: Props) {
  const cityHotels = hotels.filter((h) => h.city === leg.city);
  const hotel = findHotel(hotels, leg.hotelId);
  const rooms = hotel ? roomOptions(hotel) : [];
  const nights = legNights(leg);
  const total = legTotal(leg, hotels);
  const problem = showProblem ? legProblem(leg, hotels, guests) : null;
  const fewestRooms = legMinRooms(leg, hotels, guests);
  const id = `leg-${index}`;

  function changeCity(city: City) {
    onPatch({ city, hotelId: null, roomId: null });
  }

  function changeHotel(value: string) {
    const next = hotels.find((h) => h.id === Number(value));
    onPatch({ hotelId: next?.id ?? null, roomId: next ? roomOptions(next)[0].id : null });
  }

  return (
    <li className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{index + 1}</span>
          <div className="inline-flex rounded-lg border border-sand-200 p-0.5" role="group" aria-label={`Stay ${index + 1} city`}>
            {(["Makkah", "Madinah"] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={leg.city === c}
                onClick={() => leg.city !== c && changeCity(c)}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-ink-700 transition-colors aria-pressed:bg-brand-700 aria-pressed:text-white"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="btn-ghost px-2" onClick={() => onMove(-1)} disabled={isFirst} aria-label={`Move stay ${index + 1} up`}>
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost px-2" onClick={() => onMove(1)} disabled={isLast} aria-label={`Move stay ${index + 1} down`}>
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost px-2 text-red-600" onClick={onRemove} disabled={!canRemove} aria-label={`Remove stay ${index + 1}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {isFirst ? (
            <>
              <p className="label" id={`${id}-guests`}>Guests</p>
              <div className="max-w-sm" aria-labelledby={`${id}-guests`} role="group">
                <GuestPicker guests={guests} onChange={onGuestsChange} />
              </div>
              <p className="mt-1.5 text-xs text-ink-500">The same guests apply to every stay. Infants (under 2) don&apos;t need a bed.</p>
            </>
          ) : (
            <p className="rounded-lg bg-sand-50 px-3 py-2 text-sm text-ink-700" data-testid="guests-readonly">
              <span className="font-semibold">Guests:</span> {guestSummary(guests)}
              <span className="text-ink-500"> · change in stay 1</span>
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-hotel`} className="label">Hotel in {leg.city}</label>
          <select id={`${id}-hotel`} className="input" value={leg.hotelId ?? ""} onChange={(e) => changeHotel(e.target.value)}>
            <option value="">Select a hotel…</option>
            {cityHotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.starRating}★ — from {formatPrice(h.pricePerNight, h.currency)}/night
              </option>
            ))}
          </select>
          {hotel && <div className="mt-1.5"><StarRating rating={hotel.starRating} /></div>}
        </div>

        <div>
          <label htmlFor={`${id}-room`} className="label">Room type</label>
          <select
            id={`${id}-room`}
            className="input"
            value={leg.roomId ?? ""}
            disabled={!hotel}
            onChange={(e) => onPatch({ roomId: Number(e.target.value) })}
          >
            {!hotel && <option value="">Choose a hotel first</option>}
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (sleeps {r.capacity}) — {formatPrice(r.pricePerNight, hotel!.currency)}/night
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-count`} className="label">Number of rooms</label>
          <input
            id={`${id}-count`}
            type="number"
            inputMode="numeric"
            min={fewestRooms}
            max={MAX_ROOMS}
            aria-describedby={hotel ? `${id}-count-hint` : undefined}
            className="input"
            value={Number.isFinite(leg.rooms) ? leg.rooms : ""}
            onChange={(e) => onPatch({ rooms: e.target.value === "" ? NaN : Math.floor(Number(e.target.value)) })}
          />
          {hotel && (
            <p id={`${id}-count-hint`} className="mt-1 text-xs text-ink-500">
              Min. {fewestRooms} for {pluralize(roomGuests(guests), "guest")}. You can add more.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-in`} className="label">Check-in</label>
          <input id={`${id}-in`} type="date" className="input" value={leg.checkIn} onChange={(e) => onPatch({ checkIn: e.target.value })} />
        </div>
        <div>
          <label htmlFor={`${id}-out`} className="label">Check-out</label>
          <input
            id={`${id}-out`}
            type="date"
            className="input"
            min={leg.checkIn || undefined}
            value={leg.checkOut}
            onChange={(e) => onPatch({ checkOut: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-sand-200 pt-4 text-sm">
        <span className="text-ink-500">
          {nights > 0 ? pluralize(nights, "night") : "Pick your dates"}
          {nights > 0 && Number.isFinite(leg.rooms) && leg.rooms > 0 ? ` × ${pluralize(leg.rooms, "room")}` : ""}
        </span>
        <span className="font-semibold text-brand-900">Stay total: {total > 0 ? formatPrice(total, hotel?.currency) : "—"}</span>
      </div>
      {problem && <p role="alert" className="field-error mt-2">{problem}</p>}
    </li>
  );
}
