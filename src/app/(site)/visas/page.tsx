import type { Metadata } from "next";
import { Suspense } from "react";
import { VisaCard } from "@/components/visas/VisaCard";
import { CardGridSkeleton, EmptyState, ErrorState, PageHero } from "@/components/ui/primitives";
import { getVisas } from "@/lib/api";

export const metadata: Metadata = {
  title: "Visas",
  description:
    "Tourist and Umrah visa services for popular destinations. See the visa type, starting price and processing time, then message us on WhatsApp.",
};

export default function VisasPage() {
  return (
    <>
      <PageHero
        eyebrow="Visa Services"
        title="Visas for Popular Destinations"
        description="Pick a country to see the visa type, starting price, processing time and required documents. Message us on WhatsApp to get started."
      />
      <div className="container-page py-10">
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <VisaResults />
        </Suspense>
        <p className="mt-8 text-xs text-ink-500">
          Prices are indicative starting rates in PKR and can change with exchange rates and embassy fees. Approval is decided by the embassy or immigration authority.
        </p>
      </div>
    </>
  );
}

async function VisaResults() {
  const visas = await getVisas().catch(() => null);
  if (!visas) return <ErrorState />;
  if (visas.length === 0) {
    return <EmptyState title="No visas listed yet" description="Please check back soon, or message us on WhatsApp and we will help directly." />;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visas.map((visa) => (
        <VisaCard key={visa.id} visa={visa} />
      ))}
    </div>
  );
}
