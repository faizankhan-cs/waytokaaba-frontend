"use client";

import { useActionState } from "react";
import { saveTransportRouteAction } from "@/app/admin/actions";
import type { TransportRoute, TransportVehicle } from "@/lib/types";
import { Checkbox, FormMessage, SubmitButton, TextField } from "./FormParts";

/** Route details plus one price input per vehicle. Leave a price empty when that vehicle is not offered. */
export function TransportRouteForm({ route, vehicles }: { route?: TransportRoute; vehicles: TransportVehicle[] }) {
  const [state, action] = useActionState(saveTransportRouteAction, {});
  const e = state.fieldErrors ?? {};
  const priceOf = (vehicleId: number) => route?.rates.find((r) => r.vehicleId === vehicleId)?.price;

  return (
    <form action={action} className="card space-y-6 p-6">
      {route && <input type="hidden" name="id" value={route.id} />}
      <FormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="from" label="From *" defaultValue={route?.from} error={e.from} hint='e.g. "Jeddah", or a tour name like "Madinah Ziyarat"' required maxLength={100} />
        <TextField name="to" label="To" defaultValue={route?.to ?? ""} error={e.to} hint="Leave empty for a tour (Ziyarat)." maxLength={100} />
        <TextField name="note" label="Note" defaultValue={route?.note ?? ""} error={e.note} hint="Optional short line shown under the route." maxLength={300} />
        <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={route?.sortOrder ?? 0} error={e.sortOrder} hint="Lower numbers show first." />
      </div>

      <fieldset>
        <legend className="label">Price per vehicle, one way (PKR) *</legend>
        <p className="mb-3 text-xs text-ink-500">Leave a box empty if that vehicle is not offered on this route.</p>
        {vehicles.length === 0 ? (
          <p className="text-sm text-ink-500">Add a vehicle first.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {vehicles.map((v) => (
              <TextField
                key={v.id}
                name={`price_${v.id}`}
                label={`${v.name} price${v.isActive ? "" : " (hidden)"}`}
                type="number"
                min={1}
                step={1}
                defaultValue={priceOf(v.id) ?? ""}
              />
            ))}
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <Checkbox name="isActive" label="Show on website" defaultChecked={route?.isActive ?? true} />
        <Checkbox name="isDemoContent" label="Sample data" defaultChecked={route?.isDemoContent ?? false} />
      </div>

      <SubmitButton>{route ? "Save changes" : "Create route"}</SubmitButton>
    </form>
  );
}
