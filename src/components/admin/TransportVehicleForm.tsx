"use client";

import { useActionState } from "react";
import { saveTransportVehicleAction } from "@/app/admin/actions";
import type { TransportVehicle } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { Checkbox, FormMessage, SubmitButton, TextAreaField, TextField } from "./FormParts";

export function TransportVehicleForm({ vehicle }: { vehicle?: TransportVehicle }) {
  const [state, action] = useActionState(saveTransportVehicleAction, {});
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-6 p-6">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <FormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="name" label="Vehicle name *" defaultValue={vehicle?.name} error={e.name} hint='e.g. "Sedan", "GMC", "Coaster"' required maxLength={100} />
        <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={vehicle?.sortOrder ?? 0} error={e.sortOrder} hint="Lower numbers show first." />
        <TextField name="seats" label="Seats *" type="number" min={1} max={60} defaultValue={vehicle?.seats ?? 4} error={e.seats} required />
        <TextField name="bags" label="Bags *" type="number" min={0} max={60} defaultValue={vehicle?.bags ?? 2} error={e.bags} required />
        <ImageUpload name="imageUrl" label="Vehicle photo *" defaultValue={vehicle?.imageUrl} error={e.imageUrl} required className="md:col-span-2" />
      </div>

      <TextAreaField name="description" label="Short description" rows={2} maxLength={500} defaultValue={vehicle?.description ?? ""} error={e.description} />

      <div className="flex flex-wrap gap-6">
        <Checkbox name="isActive" label="Show on website" defaultChecked={vehicle?.isActive ?? true} />
        <Checkbox name="isDemoContent" label="Sample listing (shows a badge)" defaultChecked={vehicle?.isDemoContent ?? false} />
      </div>

      <SubmitButton>{vehicle ? "Save changes" : "Create vehicle"}</SubmitButton>
    </form>
  );
}
