"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { saveVisaAction } from "@/app/admin/actions";
import { VISA_FORMATS, type VisaDetail } from "@/lib/types";
import { VISA_ENTRY_LABEL, VISA_FORMAT_LABEL } from "@/lib/visa";
import { ImageUpload } from "./ImageUpload";
import { Checkbox, FormMessage, SelectField, SubmitButton, TextAreaField, TextField } from "./FormParts";

type TierRow = { key: number; name: string; description: string; price: string };

export function VisaForm({ visa }: { visa?: VisaDetail }) {
  const [state, action] = useActionState(saveVisaAction, {});
  const e = state.fieldErrors ?? {};
  const [rows, setRows] = useState<TierRow[]>(
    visa?.tiers.map((t, i) => ({ key: i, name: t.name, description: t.description ?? "", price: String(t.price) })) ?? [
      { key: 0, name: "", description: "", price: "" },
    ],
  );
  const patch = (key: number, change: Partial<TierRow>) =>
    setRows((r) => r.map((x) => (x.key === key ? { ...x, ...change } : x)));

  return (
    <form action={action} className="card space-y-6 p-6">
      {visa && <input type="hidden" name="id" value={visa.id} />}
      <FormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="country" label="Country *" defaultValue={visa?.country} error={e.country} required maxLength={100} />
        <TextField name="countryCode" label="Country code *" defaultValue={visa?.countryCode} error={e.countryCode} hint="2 letters, for the flag. e.g. AE, TR, MY." required maxLength={2} />
        <TextField name="slug" label="URL slug" defaultValue={visa?.slug} error={e.slug} hint="Leave empty to generate from the country." maxLength={160} />
        <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={visa?.sortOrder ?? 0} error={e.sortOrder} hint="Lower numbers show first." />
        <SelectField
          name="visaFormat"
          label="Visa format *"
          defaultValue={visa?.visaFormat ?? "EVisa"}
          options={VISA_FORMATS.map((f) => ({ value: f, label: VISA_FORMAT_LABEL[f] }))}
          error={e.visaFormat}
        />
        <SelectField
          name="entryType"
          label="Entry type *"
          defaultValue={visa?.entryType ?? "SingleEntry"}
          options={(Object.keys(VISA_ENTRY_LABEL) as (keyof typeof VISA_ENTRY_LABEL)[]).map((t) => ({ value: t, label: VISA_ENTRY_LABEL[t] }))}
          error={e.entryType}
        />
        <TextField name="processingTime" label="Processing time *" defaultValue={visa?.processingTime} error={e.processingTime} hint='e.g. "3–5 Working Days"' required maxLength={80} />
        <TextField name="validity" label="Visa validity *" defaultValue={visa?.validity} error={e.validity} hint='e.g. "60 days to enter"' required maxLength={80} />
        <TextField name="allowedStay" label="Allowed stay *" defaultValue={visa?.allowedStay} error={e.allowedStay} hint='e.g. "30 days"' required maxLength={80} />
        <ImageUpload name="imageUrl" label="Landmark photo *" defaultValue={visa?.imageUrl} error={e.imageUrl} required className="md:col-span-2" />
      </div>

      <TextAreaField name="summary" label="Short summary *" rows={2} maxLength={500} defaultValue={visa?.summary} error={e.summary} required />

      <fieldset>
        <legend className="label">Visa options and prices (PKR) *</legend>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.key} className="grid gap-2 sm:grid-cols-[1.2fr_1.5fr_8rem_auto]">
              <label className="sr-only" htmlFor={`tier-name-${row.key}`}>Option {i + 1} name</label>
              <input
                id={`tier-name-${row.key}`}
                name="tierName"
                className="input"
                placeholder="e.g. 30-Day Tourist Visa"
                maxLength={150}
                value={row.name}
                onChange={(ev) => patch(row.key, { name: ev.target.value })}
              />
              <label className="sr-only" htmlFor={`tier-desc-${row.key}`}>Option {i + 1} note</label>
              <input
                id={`tier-desc-${row.key}`}
                name="tierDescription"
                className="input"
                placeholder="Short note (optional)"
                maxLength={500}
                value={row.description}
                onChange={(ev) => patch(row.key, { description: ev.target.value })}
              />
              <label className="sr-only" htmlFor={`tier-price-${row.key}`}>Option {i + 1} price</label>
              <input
                id={`tier-price-${row.key}`}
                name="tierPrice"
                type="number"
                min={1}
                step="0.01"
                placeholder="Price"
                className="input"
                value={row.price}
                onChange={(ev) => patch(row.key, { price: ev.target.value })}
              />
              <button type="button" className="btn-ghost px-2" aria-label="Remove option" onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-ghost mt-2 text-brand-700"
          onClick={() => setRows((r) => [...r, { key: Math.max(0, ...r.map((x) => x.key)) + 1, name: "", description: "", price: "" }])}
        >
          <Plus className="h-4 w-4" /> Add option
        </button>
      </fieldset>

      <TextAreaField
        name="requiredDocuments"
        label="Required documents"
        rows={6}
        defaultValue={visa?.requiredDocuments.join("\n")}
        hint="One per line."
        error={e.requiredDocuments}
      />
      <TextAreaField
        name="disclaimer"
        label="Custom disclaimer"
        rows={3}
        maxLength={1000}
        defaultValue={visa?.disclaimer ?? ""}
        hint="Leave empty to show the standard notice about prices and embassy approval."
        error={e.disclaimer}
      />

      <fieldset>
        <legend className="label">The price includes</legend>
        <div className="flex flex-wrap gap-6">
          <Checkbox name="includesEmbassyFee" label="Embassy / visa fee" defaultChecked={visa?.includesEmbassyFee} />
          <Checkbox name="includesInsurance" label="Travel or medical insurance" defaultChecked={visa?.includesInsurance} />
          <Checkbox name="includesServiceCharge" label="Agency service charges" defaultChecked={visa?.includesServiceCharge ?? true} />
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6 border-t border-sand-200 pt-5">
        <Checkbox name="isActive" label="Active (visible on website)" defaultChecked={visa?.isActive ?? true} />
        <Checkbox name="isFeatured" label="Show in homepage slider" defaultChecked={visa?.isFeatured} />
        <Checkbox name="isDemoContent" label="Sample / demo listing" defaultChecked={visa?.isDemoContent ?? false} />
      </div>

      <SubmitButton>{visa ? "Save changes" : "Create visa"}</SubmitButton>
    </form>
  );
}
