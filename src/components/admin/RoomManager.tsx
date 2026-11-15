"use client";

import { useActionState } from "react";
import { deleteRoomAction, saveRoomAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Room } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { DeleteForm, FormMessage, SubmitButton, TextField } from "./FormParts";

export function RoomManager({ hotelId, currency, rooms }: { hotelId: number; currency: string; rooms: Room[] }) {
  return (
    <div className="space-y-4">
      {rooms.length === 0 && <p className="text-sm text-ink-500">No rooms yet. Add the first room type below.</p>}
      {rooms.map((room) => (
        <details key={room.id} className="card group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="font-semibold text-ink-900">{room.name}</span>
              <span className="ml-2 text-sm text-ink-500">
                up to {room.capacity} guests · {formatPrice(room.pricePerNight, currency)}/night
              </span>
            </span>
            <span className="text-sm text-brand-700 group-open:hidden">Edit</span>
          </summary>
          <div className="border-t border-sand-200 p-4">
            <RoomForm hotelId={hotelId} room={room} />
            <div className="mt-3 flex justify-end">
              <DeleteForm
                action={deleteRoomAction}
                fields={{ hotelId, roomId: room.id }}
                label="Delete room"
                confirmText={`Delete the room "${room.name}"?`}
              />
            </div>
          </div>
        </details>
      ))}

      <div className="card border-dashed p-4">
        <h3 className="mb-3 font-semibold text-ink-900">Add a room type</h3>
        <RoomForm hotelId={hotelId} />
      </div>
    </div>
  );
}

function RoomForm({ hotelId, room }: { hotelId: number; room?: Room }) {
  const [state, action] = useActionState(saveRoomAction, {});
  const e = state.fieldErrors ?? {};
  const prefix = room ? `room-${room.id}` : "room-new";
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="hotelId" value={hotelId} />
      {room && <input type="hidden" name="roomId" value={room.id} />}
      <FormMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField id={`${prefix}-name`} name="name" label="Room name *" defaultValue={room?.name} error={e.name} required maxLength={120} />
        <TextField id={`${prefix}-capacity`} name="capacity" label="Max guests *" type="number" min={1} max={20} defaultValue={room?.capacity ?? 2} error={e.capacity} required />
        <TextField id={`${prefix}-price`} name="pricePerNight" label="Price per night *" type="number" min={1} step="0.01" defaultValue={room?.pricePerNight} error={e.pricePerNight} required />
        <TextField id={`${prefix}-beds`} name="bedConfiguration" label="Beds" defaultValue={room?.bedConfiguration ?? ""} error={e.bedConfiguration} maxLength={120} />
        <TextField id={`${prefix}-desc`} name="description" label="Description" defaultValue={room?.description ?? ""} error={e.description} className="sm:col-span-2" maxLength={2000} />
        <ImageUpload id={`${prefix}-img`} name="imageUrl" label="Room photo" defaultValue={room?.imageUrl} error={e.imageUrl} className="sm:col-span-2 lg:col-span-4" />
      </div>
      <SubmitButton className="btn-outline">{room ? "Save room" : "Add room"}</SubmitButton>
    </form>
  );
}
