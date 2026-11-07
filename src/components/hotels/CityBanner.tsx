import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { City } from "@/lib/types";

const BANNERS: Record<City | "All", { image: string; title: string; text: string; alt: string }> = {
  Makkah: {
    image: "https://images.unsplash.com/photo-1720549973451-018d3623b55a?auto=format&fit=crop",
    alt: "The Kaaba and Masjid al-Haram in Makkah",
    title: "Hotels in Makkah",
    text: "Find a comfortable stay for your Umrah — compare hotels near Masjid al-Haram by price, star rating and room size.",
  },
  Madinah: {
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop",
    alt: "Masjid an-Nabawi in Madinah at sunset",
    title: "Hotels in Madinah",
    text: "Peaceful hotels close to Masjid an-Nabawi for families, groups and individual travellers.",
  },
  All: {
    image: "https://images.unsplash.com/photo-1627728734379-a5f8c099763e?auto=format&fit=crop",
    alt: "The Kaaba with the Makkah clock tower in the background",
    title: "Hotels in Makkah & Madinah",
    text: "Browse all hotels across both holy cities and filter to find the right fit for your journey.",
  },
};

export function CityBanner({ city }: { city?: City }) {
  const b = BANNERS[city ?? "All"];
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <Image src={b.image} alt={b.alt} fill preload sizes="100vw" className="-z-10 object-cover object-[center_40%] opacity-45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/60 to-brand-950/20" />
      <div className="container-page py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-brand-200">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          {city ? (
            <>
              <Link href="/hotels" className="hover:text-white">Hotels</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="text-white">{city}</span>
            </>
          ) : (
            <span className="text-white">Hotels</span>
          )}
        </nav>
        <h1 className="font-display text-4xl text-white sm:text-5xl">{b.title}</h1>
        <p className="mt-3 max-w-2xl text-brand-100">{b.text}</p>
      </div>
    </section>
  );
}
