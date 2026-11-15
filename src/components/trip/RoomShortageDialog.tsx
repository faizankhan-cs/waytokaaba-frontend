"use client";

import { BedDouble } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { pluralize } from "@/lib/format";
import { MAX_ROOMS, guestsPerRoom, type RoomShortage } from "@/lib/trip";

interface Props {
  shortage: RoomShortage | null;
  /** Rooms the customer currently has for this stay. */
  currentRooms: number;
  /** Some guests (infants, children without a bed) share with an adult. */
  sharesBed: boolean;
  onUseRooms: (rooms: number) => void;
  onPickRoom: () => void;
  onClose: () => void;
}

/** Friendly popup when the chosen rooms can't fit the guests, with a picture of how they'd be split and a one-click fix. */
export function RoomShortageDialog({ shortage, currentRooms, sharesBed, onUseRooms, onPickRoom, onClose }: Props) {
  const s = shortage;
  const roomName = s ? s.room.name : "";
  const plural = (n: number) => (n === 1 ? roomName : `${roomName}s`);

  return (
    <Modal
      open={s !== null}
      onClose={onClose}
      title={s?.tooBig ? "Choose a bigger room" : "Not enough rooms"}
      icon={
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-950 text-gold-400 ring-4 ring-gold-500/30">
          <BedDouble className="h-6 w-6" aria-hidden />
        </span>
      }
      actions={
        s && (
          <>
            <button type="button" className="btn-outline" onClick={onPickRoom}>
              Pick a bigger room
            </button>
            {!s.tooBig && (
              <button type="button" className="btn-gold" onClick={() => onUseRooms(s.needed)} autoFocus data-autofocus>
                Use {pluralize(s.needed, "room")}
              </button>
            )}
          </>
        )
      }
    >
      {s && (
        <>
          {s.tooBig ? (
            <p>
              <strong>{pluralize(s.people, "guest")}</strong>{sharesBed ? " needing a bed" : ""} would need {s.needed} {plural(s.needed)}, more than the {MAX_ROOMS} we can quote at once.
              Please pick a larger room type, such as a Quad Room or Family Suite.
            </p>
          ) : (
            <p>
              <strong>{pluralize(s.people, "guest")}</strong>{sharesBed ? " needing a bed" : ""} won&apos;t fit in {Number.isFinite(currentRooms) && currentRooms > 0 ? currentRooms : "so few"}{" "}
              {plural(currentRooms)}. Each {roomName} sleeps {s.room.capacity}, so you need at least <strong>{pluralize(s.needed, "room")}</strong>.
            </p>
          )}

          {!s.tooBig && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Suggested: ${pluralize(s.needed, "room")}`}>
              {guestsPerRoom(s.people, s.room.capacity, s.needed).map((n, i) => (
                <li key={i} className="flex w-[4.5rem] flex-col items-center gap-1 rounded-xl border border-gold-500/40 bg-gold-50 px-2 py-2.5">
                  <BedDouble className="h-5 w-5 text-gold-700" aria-hidden />
                  <span className="text-xs font-semibold text-ink-900">Room {i + 1}</span>
                  <span className="text-[11px] text-ink-500">{pluralize(n, "guest")}</span>
                </li>
              ))}
            </ul>
          )}

          {sharesBed && <p className="mt-3 text-xs text-ink-500">Infants and children without a bed share with an adult, so they aren&apos;t counted here.</p>}
        </>
      )}
    </Modal>
  );
}
