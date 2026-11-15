import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { TransportExplorer } from "@/components/transport/TransportExplorer";
import { CardGridSkeleton, EmptyState, ErrorState, PageHero } from "@/components/ui/primitives";
import { getTransport } from "@/lib/api";
import { TRANSPORT_NOTES } from "@/lib/transport";

export const metadata: Metadata = {
  title: "Private Transport",
  description:
    "Private transport between Jeddah, Makkah and Madinah: sedans, family vans, GMC and coasters. See the rates for every route and book on WhatsApp.",
};

export default function TransportPage() {
  return (
    <>
      <PageHero
        eyebrow="Private Transport"
        title="Comfortable Rides Between Jeddah, Makkah & Madinah"
        description="Airport pick-ups, city-to-city transfers and Ziyarat tours in a private vehicle. Choose a vehicle to see its rates, then book on WhatsApp."
      />
      <div className="container-page space-y-10 py-10">
        <Suspense fallback={<CardGridSkeleton count={5} />}>
          <TransportResults />
        </Suspense>
        <TransportNotes />
      </div>
    </>
  );
}

async function TransportResults() {
  const catalog = await getTransport().catch(() => null);
  if (!catalog) return <ErrorState />;
  if (catalog.vehicles.length === 0 || catalog.routes.length === 0) {
    return <EmptyState title="Transport rates coming soon" description="Message us on WhatsApp and we will share the current rates." />;
  }
  return <TransportExplorer catalog={catalog} />;
}

function TransportNotes() {
  return (
    <aside className="flex gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-5 text-sm text-ink-700" aria-label="Booking notes">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
      <div>
        <p className="font-semibold text-ink-900">Good to know</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {TRANSPORT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
