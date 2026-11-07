import { Suspense } from "react";
import { CalendarDays, Info } from "lucide-react";
import { HotelCard } from "./HotelCard";
import { HotelFilters } from "./HotelFilters";
import { Pagination } from "@/components/search/Pagination";
import { SortSelect } from "@/components/search/FilterControls";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/primitives";
import { ApiError, searchHotels, type SearchParams } from "@/lib/api";
import { cityFromSlug, formatDate, pluralize } from "@/lib/format";
import type { City } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "stars_desc", label: "Star rating" },
  { value: "distance_asc", label: "Distance to Haram" },
];

export function HotelListing({
  city,
  basePath,
  searchParams,
}: {
  city?: City;
  basePath: string;
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[290px_1fr]">
      <Suspense fallback={<div className="card hidden h-[32rem] animate-pulse lg:block" />}>
        <HotelFilters showCity={!city} />
      </Suspense>
      <Suspense fallback={<CardGridSkeleton count={6} cols="sm:grid-cols-2 xl:grid-cols-3" />}>
        <HotelResults city={city} basePath={basePath} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function HotelResults({
  city,
  basePath,
  searchParams,
}: {
  city?: City;
  basePath: string;
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cityParam = typeof sp.city === "string" ? cityFromSlug(sp.city) : null;
  const effectiveCity = city ?? cityParam ?? undefined;

  let result;
  try {
    result = await searchHotels(effectiveCity, sp);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return (
        <EmptyState
          title="Some filters look invalid"
          description={Object.values(error.problem?.errors ?? {}).flat().join(" ") || "Please adjust your filters and try again."}
        />
      );
    }
    return <ErrorState />;
  }

  // Carry the visitor's dates/guests through to the hotel page so the inquiry form is pre-filled.
  const carry = new URLSearchParams();
  for (const key of ["checkIn", "checkOut", "guests"] as const) {
    const v = sp[key];
    if (typeof v === "string" && v) carry.set(key, v);
  }
  const carryQuery = carry.size ? `?${carry}` : "";
  const checkIn = typeof sp.checkIn === "string" ? sp.checkIn : null;
  const checkOut = typeof sp.checkOut === "string" ? sp.checkOut : null;
  const guests = typeof sp.guests === "string" ? sp.guests : null;

  return (
    <section aria-labelledby="results-heading">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="results-heading" className="text-lg font-semibold text-ink-900">
          {pluralize(result.totalCount, "hotel")} found{effectiveCity ? ` in ${effectiveCity}` : ""}
        </h2>
        <SortSelect options={SORT_OPTIONS} />
      </div>

      {(checkIn || guests) && (
        <p className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {checkIn && <span>{formatDate(checkIn)}{checkOut ? ` – ${formatDate(checkOut)}` : ""}</span>}
          {checkIn && guests && <span aria-hidden>·</span>}
          {guests && <span>{pluralize(Number(guests), "guest")}</span>}
          <span className="text-brand-700">— availability is confirmed by our team after you send an inquiry.</span>
        </p>
      )}

      {result.items.length === 0 ? (
        <EmptyState
          title="No hotels match your filters"
          description="Try widening your price range, choosing more star ratings or reducing the number of guests."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((h) => (
            <HotelCard key={h.id} hotel={h} query={carryQuery} />
          ))}
        </div>
      )}

      <Pagination basePath={basePath} searchParams={sp} page={result.page} totalPages={result.totalPages} />

      <p className="mt-8 flex items-start gap-2 text-xs text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Prices are indicative &quot;from&quot; rates per room per night and may vary by season. Listings marked &quot;Sample listing&quot; are demonstration content.
      </p>
    </section>
  );
}
