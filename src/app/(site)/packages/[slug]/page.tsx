import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, Check, ChevronRight, MapPin, Moon } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { Badge, DemoBadge, StarRating } from "@/components/ui/primitives";
import { getPackage } from "@/lib/api";
import { HOLY_MOSQUE, formatDistance, formatPrice, hotelHref } from "@/lib/format";

type Props = PageProps<"/packages/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug).catch(() => null);
  if (!pkg) return { title: "Package not found" };
  return {
    title: pkg.name,
    description: pkg.shortDescription,
    openGraph: { images: [{ url: pkg.imageUrl }] },
  };
}

export default function PackageDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page h-[60vh] py-10" role="status" aria-label="Loading package" />}>
      <PackageDetailContent params={params} />
    </Suspense>
  );
}

async function PackageDetailContent({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();

  const gallery = pkg.images.length > 0 ? pkg.images : [{ url: pkg.imageUrl, caption: pkg.name }];
  const otherDays = pkg.durationInDays - pkg.makkahDays - pkg.madinahDays;

  return (
    <div className="container-page py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/packages" className="hover:text-brand-700">Umrah Packages</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-ink-900">{pkg.name}</span>
      </nav>

      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={pkg.packageType === "Luxury" || pkg.packageType === "Premium" ? "gold" : "brand"}>{pkg.packageType} package</Badge>
            {pkg.isDemoContent && <DemoBadge />}
          </div>
          <h1 className="mt-2 font-display text-3xl text-brand-900 sm:text-4xl">{pkg.name}</h1>
          <p className="mt-2 max-w-2xl text-ink-500">{pkg.shortDescription}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-ink-500">From, per person</p>
          <p className="text-3xl font-bold text-brand-800">{formatPrice(pkg.price, pkg.currency)}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <ImageGallery images={gallery} alt={pkg.name} />

          <section aria-labelledby="duration-heading">
            <h2 id="duration-heading" className="sr-only">Duration</h2>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Stat icon={<CalendarDays className="h-5 w-5" />} label="Total duration" value={`${pkg.durationInDays} days`} />
              <Stat icon={<Moon className="h-5 w-5" />} label="Stay in Makkah" value={`${pkg.makkahDays} nights`} />
              <Stat icon={<Moon className="h-5 w-5" />} label="Stay in Madinah" value={`${pkg.madinahDays} nights`} />
            </dl>
            {otherDays > 0 && (
              <p className="mt-2 text-xs text-ink-500">Remaining {otherDays === 1 ? "day is" : "days are"} allocated to travel.</p>
            )}
          </section>

          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="font-display text-2xl text-brand-900">Package overview</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-700">{pkg.description}</p>
          </section>

          {pkg.hotels.length > 0 && (
            <section aria-labelledby="hotels-heading">
              <h2 id="hotels-heading" className="font-display text-2xl text-brand-900">Included hotels</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {pkg.hotels.map((h) => (
                  <li key={h.hotelId} className="card flex gap-4 overflow-hidden p-3">
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-sand-100">
                      <Image src={h.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                    </div>
                    <div className="min-w-0 py-1">
                      <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{h.city} · {h.nights} nights</p>
                      <Link href={hotelHref({ city: h.city, slug: h.hotelSlug })} className="mt-1 block font-semibold text-ink-900 hover:text-brand-700">
                        {h.hotelName}
                      </Link>
                      <StarRating rating={h.starRating} />
                      {h.distanceFromHolyMosqueMeters != null && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                          <MapPin className="h-3 w-3" aria-hidden /> {formatDistance(h.distanceFromHolyMosqueMeters)} from {HOLY_MOSQUE[h.city]}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.services.length > 0 && (
            <section aria-labelledby="services-heading">
              <h2 id="services-heading" className="font-display text-2xl text-brand-900">What&apos;s included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {pkg.services.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="font-medium text-ink-900">{s.serviceName}</span>
                      {s.description && <span className="block text-sm text-ink-500">{s.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ink-500">Inclusions, airline and dates are confirmed with you before any booking is made.</p>
            </section>
          )}
        </div>

        <div id="inquiry" className="lg:sticky lg:top-24 lg:self-start">
          <InquiryForm inquiryType="Package" packageId={pkg.id} subject={pkg.name} title="Inquire about this package" showDates />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700" aria-hidden>
        {icon}
      </span>
      <div>
        <dt className="text-xs text-ink-500">{label}</dt>
        <dd className="font-semibold text-ink-900">{value}</dd>
      </div>
    </div>
  );
}
