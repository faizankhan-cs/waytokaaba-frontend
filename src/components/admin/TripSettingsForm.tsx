"use client";

import { useActionState } from "react";
import { saveTripSettingsAction } from "@/app/admin/actions";
import type { TripSettings } from "@/lib/types";
import { FormMessage, SubmitButton, TextField } from "./FormParts";

export function TripSettingsForm({ settings }: { settings: TripSettings }) {
  const [state, action] = useActionState(saveTripSettingsAction, {});
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card max-w-xl space-y-6 p-6">
      <FormMessage state={state} />
      <TextField
        name="visaTransportPricePerPerson"
        label="Visa & transport price per person (PKR) *"
        type="number"
        min={1}
        step={1}
        required
        defaultValue={settings.visaTransportPricePerPerson}
        error={e.visaTransportPricePerPerson ?? e.VisaTransportPricePerPerson}
        hint="One combined price for the Umrah visa and transport. In the Round Trip it is charged for every guest, infants included, when the customer ticks “Add Visa & transport”."
      />
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
