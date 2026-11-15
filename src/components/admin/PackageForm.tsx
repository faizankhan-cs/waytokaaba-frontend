"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { savePackageAction } from "@/app/admin/actions";
import { PACKAGE_TYPES, type HotelSummary, type PackageDetail } from "@/lib/types";
import { GalleryUpload } from "./GalleryUpload";
import { ImageUpload } from "./ImageUpload";
import { Checkbox, FormMessage, SelectField, SubmitButton, TextAreaField, TextField } from "./FormParts";

type StayRow = { key: number; hotelId: string; nights: string };

export function PackageForm({ pkg, hotels }: { pkg?: PackageDetail; hotels: HotelSummary[] }) {
  const [state, action] = useActionState(savePackageAction, {});
  const e = state.fieldErrors ?? {};
  const [rows, setRows] = useState<StayRow[]>(
    pkg?.hotels.map((h, i) => ({ key: i, hotelId: String(h.hotelId), nights: String(h.nights) })) ?? [
      { key: 0, hotelId: "", nights: "" },
    ],
  );

  const services = pkg?.services.map((s) => (s.description ? `${s.serviceName} | ${s.description}` : s.serviceName)).join("\n") ?? "";

  return (
    <form action={action} className="card space-y-6 p-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <FormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="name" label="Package name *" defaultValue={pkg?.name} error={e.name} required maxLength={150} />
        <TextField name="slug" label="URL slug" defaultValue={pkg?.slug} error={e.slug} hint="Leave empty to generate from the name." maxLength={160} />
        <SelectField
          name="packageType"
          label="Package type *"
          defaultValue={pkg?.packageType ?? "Standard"}
          options={PACKAGE_TYPES.map((t) => ({ value: t, label: t }))}
          error={e.packageType}
        />
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <TextField name="price" label="Price per person *" type="number" min={1} step="0.01" defaultValue={pkg?.price} error={e.price} required />
          <TextField name="currency" label="Currency" defaultValue={pkg?.currency ?? "PKR"} error={e.currency} maxLength={3} className="w-24" />
        </div>
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <TextField name="durationInDays" label="Total days *" type="number" min={1} max={90} defaultValue={pkg?.durationInDays} error={e.durationInDays} required />
          <TextField name="makkahDays" label="Makkah nights *" type="number" min={0} max={90} defaultValue={pkg?.makkahDays} error={e.makkahDays} required />
          <TextField name="madinahDays" label="Madinah nights *" type="number" min={0} max={90} defaultValue={pkg?.madinahDays} error={e.madinahDays} required />
        </div>
        <ImageUpload name="imageUrl" label="Main photo *" defaultValue={pkg?.imageUrl} error={e.imageUrl} required className="md:col-span-2" />
      </div>

      <TextAreaField name="shortDescription" label="Short description *" rows={2} maxLength={300} defaultValue={pkg?.shortDescription} error={e.shortDescription} required />
      <TextAreaField name="description" label="Full description *" rows={6} maxLength={5000} defaultValue={pkg?.description} error={e.description} required />

      <fieldset>
        <legend className="label">Included hotels</legend>
        {e.hotels && <p className="field-error mb-2">{e.hotels}</p>}
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.key} className="flex gap-2">
              <label className="sr-only" htmlFor={`hotel-${row.key}`}>Hotel {i + 1}</label>
              <select
                id={`hotel-${row.key}`}
                name="hotelId"
                className="input"
                value={row.hotelId}
                onChange={(ev) => setRows((r) => r.map((x) => (x.key === row.key ? { ...x, hotelId: ev.target.value } : x)))}
              >
                <option value="">— Select hotel —</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city}, {h.starRating}★)
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor={`nights-${row.key}`}>Nights</label>
              <input
                id={`nights-${row.key}`}
                name="hotelNights"
                type="number"
                min={1}
                max={90}
                placeholder="Nights"
                className="input w-28"
                value={row.nights}
                onChange={(ev) => setRows((r) => r.map((x) => (x.key === row.key ? { ...x, nights: ev.target.value } : x)))}
              />
              <button type="button" className="btn-ghost px-2" aria-label="Remove hotel" onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-ghost mt-2 text-brand-700"
          onClick={() => setRows((r) => [...r, { key: Math.max(0, ...r.map((x) => x.key)) + 1, hotelId: "", nights: "" }])}
        >
          <Plus className="h-4 w-4" /> Add hotel
        </button>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField name="services" label="Included services" rows={6} defaultValue={services} hint='One per line. Optional description after a "|", e.g. "Visa processing | Handled by our team".' error={e.services} />
        <GalleryUpload label="Gallery photos" defaultUrls={pkg?.images.map((i) => i.url)} error={e.images} />
      </div>

      <div className="flex flex-wrap gap-6 border-t border-sand-200 pt-5">
        <Checkbox name="isActive" label="Active (visible on website)" defaultChecked={pkg?.isActive ?? true} />
        <Checkbox name="isFeatured" label="Featured on homepage" defaultChecked={pkg?.isFeatured} />
        <Checkbox name="isDemoContent" label="Sample / demo listing" defaultChecked={pkg?.isDemoContent ?? false} />
      </div>

      <SubmitButton>{pkg ? "Save changes" : "Create package"}</SubmitButton>
    </form>
  );
}
