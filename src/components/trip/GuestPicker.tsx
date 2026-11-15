"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, UserRound } from "lucide-react";
import { pluralize } from "@/lib/format";
import { MAX_ADULTS, MAX_CHILDREN, guestSummary, totalGuests, type Guests } from "@/lib/trip";

interface Row {
  key: keyof Guests;
  label: string;
  hint: string;
  one: string;
  min: number;
  max: number;
  /** A sub-option of the row above (indented, smaller). */
  sub?: boolean;
}

/** Guest selection in the style of airline booking forms: one button that opens adults / children / infants steppers. */
export function GuestPicker({ guests, onChange }: { guests: Guests; onChange: (guests: Guests) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const rows: Row[] = [
    { key: "adults", label: "Adults", hint: "12 years and up", one: "adult", min: 1, max: MAX_ADULTS },
    { key: "children", label: "Children", hint: "2 to 11 years", one: "child", min: 0, max: MAX_CHILDREN },
    // Children who share an adult's bed: they don't need room space and aren't charged for accommodation.
    ...(guests.children > 0
      ? [{ key: "childrenNoBed" as const, label: "Without a bed", hint: "Shares with an adult · no room charge", one: "child without a bed", min: 0, max: guests.children, sub: true }]
      : []),
    // One infant per adult, as airlines allow.
    { key: "infants", label: "Infants", hint: "Under 2 · no bed needed", one: "infant", min: 0, max: guests.adults },
  ];

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function change(key: keyof Guests, delta: number) {
    const next = { ...guests, [key]: guests[key] + delta };
    // Fewer adults than infants isn't allowed, so infants follow the adults down.
    if (key === "adults") next.infants = Math.min(next.infants, next.adults);
    // Likewise, children without a bed can't outnumber the children.
    if (key === "children") next.childrenNoBed = Math.min(next.childrenNoBed, next.children);
    onChange(next);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="input flex w-full items-center gap-3 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <UserRound className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink-900">{pluralize(totalGuests(guests), "guest")}</span>
          <span className="block truncate text-xs text-ink-500">{guestSummary(guests)}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Guest selection"
          className="absolute top-full left-0 z-30 mt-2 w-full min-w-[17rem] overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-xl sm:w-80"
        >
          <p className="px-5 pt-4 text-center font-semibold text-brand-900">Guest selection</p>
          <ul className="space-y-4 px-5 py-4">
            {rows.map((r) => {
              const value = guests[r.key];
              return (
                <li
                  key={r.key}
                  className={`flex items-center justify-between gap-4 ${r.sub ? "-mt-1 ml-3 border-l-2 border-gold-500/50 pl-3" : ""}`}
                >
                  <div>
                    <p className={r.sub ? "text-sm font-semibold text-ink-700" : "font-semibold text-ink-900"}>{r.label}</p>
                    <p className="text-xs text-ink-500">{r.hint}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-gold-500/60 bg-sand-50 p-1">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-gold-400 transition-opacity hover:bg-brand-800 disabled:opacity-30"
                      aria-label={`Remove ${r.one}`}
                      disabled={value <= r.min}
                      onClick={() => change(r.key, -1)}
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <output className="w-8 text-center text-lg font-semibold text-ink-900" aria-live="polite" aria-label={`${r.label}: ${value}`}>
                      {value}
                    </output>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-gold-400 transition-opacity hover:bg-brand-800 disabled:opacity-30"
                      aria-label={`Add ${r.one}`}
                      disabled={value >= r.max}
                      onClick={() => change(r.key, 1)}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {guests.infants >= guests.adults && (
            <p className="px-5 pb-3 text-xs text-ink-500">Each infant must travel with an adult, so infants can&apos;t outnumber adults.</p>
          )}
          <button
            type="button"
            className="block w-full bg-gold-500 py-3 text-center font-semibold text-brand-950 hover:bg-gold-400"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
