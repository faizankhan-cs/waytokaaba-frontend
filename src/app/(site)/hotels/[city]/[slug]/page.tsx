import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BedDouble, Check, ChevronRight, ExternalLink, MapPin, Users } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { DemoBadge, StarRating } from "@/components/ui/primitives";
import { getHotel } from "@/lib/api";
import { HOLY_MOSQUE, citySlug, cityFromSlug, formatDistance, formatPrice } from "@/lib/format";
import type { HotelDetail } from "@/lib/types";

type Props = PageProps<"/hotels/[city]/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotel(slug).catch(() => null);
  if (!hotel) return { title: "Hotel not found" };
  return {
    title: `${hotel.name}, ${hotel.city}`,
    description: hotel.shortDescription,
    openGraph: { images: [{ url: hotel.imageUrl }] },
  };
}

export default function HotelDetailPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <HotelDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function HotelDetailContent({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const [{ city: citySegment, slug }, sp] = await Promise.all([params, searchParams]);
  const hotel = await getHotel(slug);
  if (!hotel || cityFromSlug(citySegment) !== hotel.city) notFound();

  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const gallery = hotel.images.length > 0 ? hotel.images : [{ url: hotel.imageUrl, caption: hotel.name }];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs hotel={hotel} />

      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StarRating rating={hotel.starRating} size="md" />
            {hotel.isDemoContent && <DemoBadge />}
          </div>
          <h1 className="mt-2 font-display text-3xl text-brand-900 sm:text-4xl">{hotel.name}</h1>
          <p className="mt-2 flex items-start gap-1.5 text-ink-500">
            <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden /> {hotel.address}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-ink-500">From</p>
          <p className="text-3xl font-bold text-brand-800">
            {formatPrice(hotel.pricePerNight, hotel.currency)}
            <span className="text-sm font-normal text-ink-500"> / night</span>
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <ImageGallery images={gallery} alt={hotel.name} />

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-2xl text-brand-900">About this hotel</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-700">{hotel.description}</p>
          </section>

          <section aria-labelledby="rooms-heading">
            <h2 id="rooms-heading" className="font-display text-2xl text-brand-900">Room types & pricing</h2>
            <p className="mt-1 text-sm text-ink-500">Indicative prices per room per night. Final rates depend on dates and availability.</p>
            {hotel.rooms.length === 0 ? (
              <p className="mt-4 text-ink-500">Room details are available on request.</p>
            ) : (
              <ul className="mt-4 divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
                {hotel.rooms.map((room) => (
                  <li key={room.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-ink-900">{room.name}</h3>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden /> Up to {room.capacity} guests</span>
                        {room.bedConfiguration && (
                          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" aria-hidden /> {room.bedConfiguration}</span>
                        )}
                      </p>
                      {room.description && <p className="mt-1.5 text-sm text-ink-700">{room.description}</p>}
                    </div>
                    <p className="shrink-0 text-lg font-bold text-brand-800 sm:text-right">
                      {formatPrice(room.pricePerNight, hotel.currency)}
                      <span className="block text-xs font-normal text-ink-500">per night</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {hotel.amenities.length > 0 && (
            <section aria-labelledby="facilities-heading">
              <h2 id="facilities-heading" className="font-display text-2xl text-brand-900">Facilities</h2>
              <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {hotel.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-ink-700">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="location-heading">
            <h2 id="location-heading" className="font-display text-2xl text-brand-900">Location</h2>
            <div className="card mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink-900">{hotel.address}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {hotel.distanceFromHolyMosqueMeters != null
                    ? `${formatDistance(hotel.distanceFromHolyMosqueMeters)} from ${HOLY_MOSQUE[hotel.city]} (verified)`
                    : `Ask our team for walking distance and transport options to ${HOLY_MOSQUE[hotel.city]}.`}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.address}, Saudi Arabia`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline shrink-0"
              >
                View on map <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </section>
        </div>

        <div id="inquiry" className="lg:sticky lg:top-24 lg:self-start">
          <InquiryForm
            inquiryType="Hotel"
            hotelId={hotel.id}
            subject={hotel.name}
            title="Request this hotel"
            showDates
            defaults={{ checkIn: str(sp.checkIn), checkOut: str(sp.checkOut), guests: str(sp.guests) }}
            roomOptions={hotel.rooms.map((r) => r.name)}
          />
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ hotel }: { hotel: HotelDetail }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
      <Link href="/" className="hover:text-brand-700">Home</Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      <Link href={`/hotels/${citySlug(hotel.city)}`} className="hover:text-brand-700">{hotel.city} Hotels</Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      <span className="text-ink-900">{hotel.name}</span>
    </nav>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading hotel">
      <div className="h-4 w-48 animate-pulse rounded bg-sand-100" />
      <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-sand-100" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="aspect-[16/10] animate-pulse rounded-2xl bg-sand-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-sand-100" />
      </div>
    </div>
  );
}
