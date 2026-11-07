import type { Metadata } from "next";
import { CityBanner } from "@/components/hotels/CityBanner";
import { HotelListing } from "@/components/hotels/HotelListing";

export const metadata: Metadata = {
  title: "Hotels in Makkah & Madinah",
  description: "Search and compare hotels in Makkah and Madinah by price, star rating and room capacity.",
};

export default function HotelsPage({ searchParams }: PageProps<"/hotels">) {
  return (
    <>
      <CityBanner />
      <HotelListing basePath="/hotels" searchParams={searchParams} />
    </>
  );
}
