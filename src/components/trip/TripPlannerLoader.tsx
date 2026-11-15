import { ErrorState } from "@/components/ui/primitives";
import { getHotel, getTripSettings, searchHotels } from "@/lib/api";
import type { PlannerHotel } from "@/lib/trip";
import type { City } from "@/lib/types";
import { TripPlanner } from "./TripPlanner";

const CITY_LIST: City[] = ["Makkah", "Madinah"];

/** Loads active hotels with their room types for both cities, trimmed to what the planner needs. */
async function loadCatalogue(): Promise<PlannerHotel[]> {
  const pages = await Promise.all(CITY_LIST.map((city) => searchHotels(city, {}, 50)));
  const details = await Promise.all(pages.flatMap((p) => p.items).map((h) => getHotel(h.slug)));

  return details
    .filter((h) => h !== null)
    .map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      starRating: h.starRating,
      pricePerNight: h.pricePerNight,
      currency: h.currency,
      rooms: h.rooms.map((r) => ({ id: r.id, name: r.name, capacity: r.capacity, pricePerNight: r.pricePerNight })),
    }));
}

/** The admin-set visa & transport price; if it cannot be loaded the planner still works, just without that option. */
async function loadVisaTransportRate(): Promise<number | null> {
  try {
    return (await getTripSettings()).visaTransportPricePerPerson;
  } catch {
    return null;
  }
}

export async function TripPlannerLoader() {
  let hotels: PlannerHotel[];
  let visaTransportRate: number | null;
  try {
    [hotels, visaTransportRate] = await Promise.all([loadCatalogue(), loadVisaTransportRate()]);
  } catch {
    return (
      <div className="container-page py-12">
        <ErrorState description="We couldn't load hotel prices right now. Please try again in a moment, or WhatsApp us and we'll build your quote." />
      </div>
    );
  }
  return <TripPlanner hotels={hotels} visaTransportRate={visaTransportRate} />;
}
