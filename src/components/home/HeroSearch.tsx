"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { ErrorDialog } from "@/components/ui/Modal";
import type { City } from "@/lib/types";

function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState<City>("Makkah");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  // The date that needs fixing; explained in a popup, and focused when it closes.
  const [error, setError] = useState<{ field: "checkIn" | "checkOut"; message: string } | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (checkIn && checkIn < todayIso()) return setError({ field: "checkIn", message: "Check-in date can't be in the past." });
    if (checkIn && checkOut && checkOut <= checkIn) return setError({ field: "checkOut", message: "Check-out must be after check-in." });
    setError(null);

    const params = new URLSearchParams({ guests: String(guests) });
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/hotels/${city.toLowerCase()}?${params}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-3 shadow-[var(--shadow-search)] ring-1 ring-black/5 sm:p-4"
      aria-label="Search hotels"
    >
      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_1fr_0.9fr_auto] md:items-end">
        <fieldset>
          <legend className="label flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden /> Destination
          </legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-sand-100 p-1">
            {(["Makkah", "Madinah"] as City[]).map((c) => (
              <label
                key={c}
                className="cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold text-ink-700 transition-colors has-[:checked]:bg-brand-700 has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600"
              >
                <input type="radio" name="city" value={c} checked={city === c} onChange={() => setCity(c)} className="sr-only" />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="checkIn" className="label flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden /> Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            className="input"
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value && checkOut <= e.target.value) setCheckOut("");
            }}
          />
        </div>

        <div>
          <label htmlFor="checkOut" className="label flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden /> Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            className="input"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div>
          <span className="label flex items-center gap-1.5" id="guests-label">
            <Users className="h-3.5 w-3.5 text-brand-600" aria-hidden /> Guests
          </span>
          <div className="flex items-center justify-between rounded-lg border border-sand-200 px-1.5 py-1" role="group" aria-labelledby="guests-label">
            <button type="button" className="btn-ghost p-1.5" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests((g) => g - 1)}>
              <Minus className="h-4 w-4" />
            </button>
            <output className="min-w-6 text-center text-sm font-semibold" aria-live="polite">
              {guests}
            </output>
            <button type="button" className="btn-ghost p-1.5" aria-label="More guests" disabled={guests >= 20} onClick={() => setGuests((g) => g + 1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button type="submit" className="btn-gold h-[46px] px-6 text-base">
          <Search className="h-5 w-5" aria-hidden /> Search
        </button>
      </div>
      <ErrorDialog
        open={error !== null}
        title="Please check your dates"
        message={error?.message}
        onClose={() => {
          const field = error?.field;
          setError(null);
          if (field) setTimeout(() => document.getElementById(field)?.focus(), 50);
        }}
      />
    </form>
  );
}
