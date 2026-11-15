import { Suspense } from "react";
import { TripSettingsForm } from "@/components/admin/TripSettingsForm";
import { getTripSettings } from "@/lib/api";

export const metadata = { title: "Round trip settings" };

export default function TripSettingsPage() {
  return (
    <>
      <h1 className="font-display text-3xl text-brand-900">Round trip settings</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-ink-500">
        Prices used by the Round Trip planner on the website. Changes show on the site straight away.
      </p>
      <Suspense fallback={<div className="card h-56 max-w-xl animate-pulse" />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const settings = await getTripSettings();
  return <TripSettingsForm settings={settings} />;
}
