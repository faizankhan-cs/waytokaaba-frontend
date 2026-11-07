import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityBanner } from "@/components/hotels/CityBanner";
import { HotelListing } from "@/components/hotels/HotelListing";
import { HOLY_MOSQUE, cityFromSlug } from "@/lib/format";

export function generateStaticParams() {
  return [{ city: "makkah" }, { city: "madinah" }];
}

export async function generateMetadata({ params }: PageProps<"/hotels/[city]">): Promise<Metadata> {
  const city = cityFromSlug((await params).city);
  if (!city) return {};
  return {
    title: `Hotels in ${city}`,
    description: `Search hotels in ${city} near ${HOLY_MOSQUE[city]}. Filter by price, star rating and guest capacity, then send an inquiry.`,
  };
}

export default async function CityHotelsPage({ params, searchParams }: PageProps<"/hotels/[city]">) {
  const { city: slug } = await params;
  const city = cityFromSlug(slug);
  if (!city) notFound();

  return (
    <>
      <CityBanner city={city} />
      <HotelListing city={city} basePath={`/hotels/${slug}`} searchParams={searchParams} />
    </>
  );
}
