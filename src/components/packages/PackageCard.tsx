import Image from "next/image";
import Link from "next/link";
import { BedDouble, CalendarDays } from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/format";
import type { PackageSummary } from "@/lib/types";

export function PackageCard({ pkg }: { pkg: PackageSummary }) {
  const href = `/packages/${pkg.slug}`;
  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-sand-100" tabIndex={-1} aria-hidden>
        <Image
          src={pkg.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-950/70 to-transparent" />
        <span className="absolute bottom-3 left-4 flex items-center gap-1.5 text-sm font-semibold text-white">
          <CalendarDays className="h-4 w-4" aria-hidden /> {pkg.durationInDays} days
        </span>
        {pkg.isDemoContent && <DemoBadge className="absolute top-3 left-3" />}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge tone={pkg.packageType === "Luxury" || pkg.packageType === "Premium" ? "gold" : "brand"}>{pkg.packageType}</Badge>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-ink-900">
          <Link href={href} className="hover:text-brand-700">
            {pkg.name}
          </Link>
        </h3>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-brand-50 px-3 py-2">
            <dt className="text-xs text-ink-500">Makkah</dt>
            <dd className="font-semibold text-brand-800">{pkg.makkahDays} nights</dd>
          </div>
          <div className="rounded-lg bg-brand-50 px-3 py-2">
            <dt className="text-xs text-ink-500">Madinah</dt>
            <dd className="font-semibold text-brand-800">{pkg.madinahDays} nights</dd>
          </div>
        </dl>

        {pkg.hotels.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ink-700">
            {pkg.hotels.map((h) => (
              <li key={h.hotelId} className="flex items-start gap-1.5">
                <BedDouble className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden />
                <span>
                  {h.hotelName} <span className="text-ink-500">({h.starRating}★, {h.city})</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 line-clamp-2 text-sm text-ink-500">{pkg.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-ink-500">From, per person</p>
            <p className="text-xl font-bold whitespace-nowrap text-brand-800">{formatPrice(pkg.price, pkg.currency)}</p>
          </div>
          <Link href={href} className="btn-primary shrink-0 px-3.5 whitespace-nowrap">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
