import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { PackageCard } from "@/components/packages/PackageCard";
import { PackageFilters } from "@/components/packages/PackageFilters";
import { SortSelect } from "@/components/search/FilterControls";
import { Pagination } from "@/components/search/Pagination";
import { CardGridSkeleton, EmptyState, ErrorState, PageHero } from "@/components/ui/primitives";
import { ApiError, searchPackages, type SearchParams } from "@/lib/api";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Umrah Packages",
  description: "Compare Umrah packages by price, duration and package type, with hotels in Makkah and Madinah included.",
};

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "duration_asc", label: "Duration: shortest" },
  { value: "duration_desc", label: "Duration: longest" },
];

export default function PackagesPage({ searchParams }: PageProps<"/packages">) {
  return (
    <>
      <PageHero
        eyebrow="Umrah Packages"
        title="Find the Right Umrah Package"
        description="From economy to luxury — every package includes hotels in Makkah and Madinah, visa support and ground transport. Send an inquiry to confirm dates and pricing."
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[290px_1fr]">
        <Suspense fallback={<div className="card hidden h-[32rem] animate-pulse lg:block" />}>
          <PackageFilters />
        </Suspense>
        <Suspense fallback={<CardGridSkeleton count={6} cols="sm:grid-cols-2 xl:grid-cols-3" />}>
          <PackageResults searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function PackageResults({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  let result;
  try {
    result = await searchPackages(sp);
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

  return (
    <section aria-labelledby="results-heading">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="results-heading" className="text-lg font-semibold text-ink-900">
          {pluralize(result.totalCount, "package")} available
        </h2>
        <SortSelect options={SORT_OPTIONS} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState title="No packages match your filters" description="Try a different duration, package type or price range." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}

      <Pagination basePath="/packages" searchParams={sp} page={result.page} totalPages={result.totalPages} />

      <p className="mt-8 flex items-start gap-2 text-xs text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Prices are indicative per-person rates and vary by travel dates, room sharing and airline. Packages marked &quot;Sample listing&quot; are demonstration content.
      </p>
    </section>
  );
}
