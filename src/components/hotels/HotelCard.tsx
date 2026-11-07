import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { DemoBadge, StarRating } from "@/components/ui/primitives";
import { HOLY_MOSQUE, formatDistance, formatPrice, hotelHref } from "@/lib/format";
import type { HotelSummary } from "@/lib/types";

export function HotelCard({ hotel, query = "" }: { hotel: HotelSummary; query?: string }) {
  const href = `${hotelHref(hotel)}${query}`;
  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-sand-100" tabIndex={-1} aria-hidden>
        <Image
          src={hotel.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hotel.isDemoContent && <DemoBadge className="absolute top-3 left-3" />}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={hotel.starRating} />
          <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{hotel.city}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-ink-900">
          <Link href={href} className="hover:text-brand-700">
            {hotel.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {hotel.distanceFromHolyMosqueMeters != null
            ? `${formatDistance(hotel.distanceFromHolyMosqueMeters)} from ${HOLY_MOSQUE[hotel.city]}`
            : hotel.address}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-ink-700">{hotel.shortDescription}</p>
        {hotel.maxRoomCapacity > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
            <Users className="h-3.5 w-3.5" aria-hidden /> Rooms for up to {hotel.maxRoomCapacity} guests
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="text-xs text-ink-500">From</p>
            <p className="text-xl font-bold whitespace-nowrap text-brand-800">{formatPrice(hotel.pricePerNight, hotel.currency)}</p>
            <p className="text-xs text-ink-500">per night</p>
          </div>
          <Link href={href} className="btn-primary shrink-0 px-3.5 whitespace-nowrap">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
