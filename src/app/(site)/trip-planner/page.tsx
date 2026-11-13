import type { Metadata } from "next";
import { Suspense } from "react";
import { TripPlannerLoader } from "@/components/trip/TripPlannerLoader";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Round Trip",
  description:
    "Plan your Umrah stay hotel by hotel — for example Makkah, then Madinah, then Makkah again — see the estimated total, and share a PDF slip on WhatsApp.",
};

export default function TripPlannerPage() {
  return (
    <>
      <PageHero
        eyebrow="Round Trip"
        title="Plan your round trip"
        description="Build your itinerary hotel by hotel, see your estimated total, then send the slip on WhatsApp."
      />
      <Suspense fallback={<div className="container-page py-10"><div className="card h-96 animate-pulse" /></div>}>
        <TripPlannerLoader />
      </Suspense>
    </>
  );
}
