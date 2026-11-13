import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, HandCoins, Headset, Search } from "lucide-react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HotelCard } from "@/components/hotels/HotelCard";
import { PackageCard } from "@/components/packages/PackageCard";
import { VisaCarousel } from "@/components/visas/VisaCarousel";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { CardGridSkeleton, ErrorState, SectionHeader } from "@/components/ui/primitives";
import { getFeaturedPackages, getFeaturedVisas, searchHotels } from "@/lib/api";
import type { City } from "@/lib/types";

const HERO_IMAGE = "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&q=75";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="container-page py-16 sm:py-20" aria-labelledby="packages-heading">
        <SectionHeader
          eyebrow="Umrah Packages"
          title="Featured Umrah Packages"
          description="Complete itineraries with hotels in Makkah and Madinah, visa support and ground transport."
          action={{ href: "/packages", label: "View All Packages" }}
        />
        <Suspense fallback={<CardGridSkeleton count={3} />}>
          <FeaturedPackages />
        </Suspense>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="Visa services">
        <div className="container-page">
          <SectionHeader
            eyebrow="Visa Services"
            title="Visas for Popular Destinations"
            description="Tourist and Umrah visas with clear prices and processing times. Message us on WhatsApp to get started."
            action={{ href: "/visas", label: "View All Visas" }}
          />
          <Suspense fallback={<CardGridSkeleton count={3} />}>
            <FeaturedVisas />
          </Suspense>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Makkah"
            title="Popular Hotels in Makkah"
            description="Comfortable stays near Masjid al-Haram, from value options to five-star hotels."
            action={{ href: "/hotels/makkah", label: "View All Makkah Hotels" }}
          />
          <Suspense fallback={<CardGridSkeleton count={3} />}>
            <FeaturedHotels city="Makkah" />
          </Suspense>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeader
          eyebrow="Madinah"
          title="Popular Hotels in Madinah"
          description="Peaceful stays close to Masjid an-Nabawi for families, groups and individual travellers."
          action={{ href: "/hotels/madinah", label: "View All Madinah Hotels" }}
        />
        <Suspense fallback={<CardGridSkeleton count={3} />}>
          <FeaturedHotels city="Madinah" />
        </Suspense>
        <div className="mt-10 text-center">
          <Link href="/hotels" className="btn-outline">
            View All Hotels
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <CallToAction />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <Image
        src={HERO_IMAGE}
        alt="Pilgrims around the Kaaba at Masjid al-Haram in Makkah"
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-[center_75%] opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/70 via-brand-950/40 to-brand-950/85" />

      <div className="container-page pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow text-gold-200">Umrah packages · Makkah & Madinah hotels</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-6xl">
            Your Sacred Journey Begins With <span className="text-gold-400">Way To Kaaba</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            Discover carefully selected Umrah packages and comfortable hotels in Makkah and Madinah.
          </p>
        </div>
        <div className="mt-10 max-w-5xl">
          <HeroSearch />
          <p className="mt-3 text-xs text-brand-200">
            Prices shown are indicative. Send an inquiry and our team will confirm availability and final pricing — no payment is taken online.
          </p>
        </div>
      </div>
    </section>
  );
}

async function FeaturedPackages() {
  const packages = await getFeaturedPackages(9).catch(() => null);
  if (!packages) return <ErrorState />;
  return <CardCarousel label="Umrah packages" items={packages.map((p) => <PackageCard key={p.id} pkg={p} />)} />;
}

async function FeaturedVisas() {
  const visas = await getFeaturedVisas(8).catch(() => null);
  if (!visas) return <ErrorState />;
  if (visas.length === 0) return null;
  return <VisaCarousel visas={visas} />;
}

async function FeaturedHotels({ city }: { city: City }) {
  // Search (not "featured only") so the carousel fills up; the default sort lists featured hotels first.
  const hotels = await searchHotels(city, {}, 9).then((r) => r.items).catch(() => null);
  if (!hotels) return <ErrorState />;
  return <CardCarousel label={`${city} hotels`} items={hotels.map((h) => <HotelCard key={h.id} hotel={h} />)} />;
}

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Carefully Selected Hotels",
    text: "We list hotels chosen for comfort, cleanliness and convenient access to the Haramain.",
  },
  {
    icon: HandCoins,
    title: "Affordable Umrah Packages",
    text: "Options for every budget — from economy to luxury — with clear details on what's included.",
  },
  {
    icon: Search,
    title: "Easy Hotel Search",
    text: "Filter hotels in Makkah and Madinah by price, star rating and room capacity in seconds.",
  },
  {
    icon: Headset,
    title: "Customer Support",
    text: "Send an inquiry and our team will personally help you plan dates, rooms and transport.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-brand-900 py-16 text-white sm:py-20" aria-labelledby="why-heading">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow text-gold-400">Why Way To Kaaba</p>
          <h2 id="why-heading" className="mt-2 font-display text-3xl sm:text-4xl">
            Why Choose Way To Kaaba?
          </h2>
          <p className="mt-3 text-brand-200">
            Planning Umrah should feel calm and clear. We focus on the details so you can focus on your worship.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-brand-700 bg-brand-800/50 p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="card flex flex-col items-start gap-6 bg-gradient-to-r from-gold-50 to-white p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="font-display text-2xl text-brand-900 sm:text-3xl">Not sure which package suits you?</h2>
          <p className="mt-2 text-ink-500">Tell us your dates, group size and budget — we&apos;ll suggest the best options.</p>
        </div>
        <Link href="/contact" className="btn-primary px-6 py-3 text-base">
          Send an Inquiry
        </Link>
      </div>
    </section>
  );
}
