"use client";

import { useActionState } from "react";
import { saveHotelAction } from "@/app/admin/actions";
import type { HotelDetail } from "@/lib/types";
import { Checkbox, FormMessage, SelectField, SubmitButton, TextAreaField, TextField } from "./FormParts";

export function HotelForm({ hotel }: { hotel?: HotelDetail }) {
  const [state, action] = useActionState(saveHotelAction, {});
  const e = state.fieldErrors ?? {};
  const gallery = hotel?.images.map((i) => i.url).join("\n") ?? "";

  return (
    <form action={action} className="card space-y-6 p-6">
      {hotel && <input type="hidden" name="id" value={hotel.id} />}
      <FormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="name" label="Hotel name *" defaultValue={hotel?.name} error={e.name} required maxLength={150} />
        <TextField name="slug" label="URL slug" defaultValue={hotel?.slug} error={e.slug} hint="Leave empty to generate from the name." maxLength={160} />
        <SelectField
          name="city"
          label="City *"
          defaultValue={hotel?.city ?? "Makkah"}
          options={[
            { value: "Makkah", label: "Makkah" },
            { value: "Madinah", label: "Madinah" },
          ]}
          error={e.city}
        />
        <TextField name="address" label="Address *" defaultValue={hotel?.address} error={e.address} required maxLength={300} />
        <SelectField
          name="starRating"
          label="Star rating *"
          defaultValue={String(hotel?.starRating ?? 4)}
          options={[5, 4, 3, 2, 1].map((s) => ({ value: String(s), label: `${s} stars` }))}
          error={e.starRating}
        />
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <TextField name="pricePerNight" label="From price per night *" type="number" min={1} step="0.01" defaultValue={hotel?.pricePerNight} error={e.pricePerNight} required />
          <TextField name="currency" label="Currency" defaultValue={hotel?.currency ?? "PKR"} error={e.currency} maxLength={3} className="w-24" />
        </div>
        <div>
          <TextField
            name="distanceFromHolyMosqueMeters"
            label="Distance to Haram (meters)"
            type="number"
            min={0}
            defaultValue={hotel?.distanceFromHolyMosqueMeters ?? ""}
            error={e.distanceFromHolyMosqueMeters}
          />
          <div className="mt-2">
            <Checkbox name="isDistanceVerified" label="Distance is verified (show publicly)" defaultChecked={hotel?.isDistanceVerified} />
            {e.isDistanceVerified && <p className="field-error">{e.isDistanceVerified}</p>}
          </div>
        </div>
        <TextField name="imageUrl" label="Main image URL *" type="url" defaultValue={hotel?.imageUrl} error={e.imageUrl} required />
      </div>

      <TextAreaField name="shortDescription" label="Short description *" rows={2} maxLength={300} defaultValue={hotel?.shortDescription} error={e.shortDescription} required />
      <TextAreaField name="description" label="Full description *" rows={6} maxLength={5000} defaultValue={hotel?.description} error={e.description} required />

      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField name="amenities" label="Facilities" rows={6} defaultValue={hotel?.amenities.join("\n")} hint="One facility per line." error={e.amenities} />
        <TextAreaField name="images" label="Gallery image URLs" rows={6} defaultValue={gallery} hint="One image URL per line, in display order." error={e.images} />
      </div>

      <div className="flex flex-wrap gap-6 border-t border-sand-200 pt-5">
        <Checkbox name="isActive" label="Active (visible on website)" defaultChecked={hotel?.isActive ?? true} />
        <Checkbox name="isFeatured" label="Featured on homepage" defaultChecked={hotel?.isFeatured} />
        <Checkbox name="isDemoContent" label="Sample / demo listing" defaultChecked={hotel?.isDemoContent ?? false} />
      </div>

      <SubmitButton>{hotel ? "Save changes" : "Create hotel"}</SubmitButton>
    </form>
  );
}
