import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteHotelAction } from "../../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { HotelForm } from "@/components/admin/HotelForm";
import { RoomManager } from "@/components/admin/RoomManager";
import { adminGet } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import type { HotelDetail } from "@/lib/types";

export const metadata = { title: "Edit hotel" };

export default function EditHotelPage({ params, searchParams }: PageProps<"/admin/hotels/[id]">) {
  return (
    <>
      <Link href="/admin/hotels" className="text-sm text-brand-700 hover:underline">← Back to hotels</Link>
      <Suspense fallback={<div className="card mt-6 h-[40rem] animate-pulse" />}>
        <EditHotel params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EditHotel({ params, searchParams }: Pick<PageProps<"/admin/hotels/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let hotel: HotelDetail;
  try {
    hotel = await adminGet<HotelDetail>(`/api/admin/hotels/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-900">{hotel.name}</h1>
        <DeleteForm
          action={deleteHotelAction}
          fields={{ id: hotel.id }}
          label="Delete hotel"
          confirmText={`Delete "${hotel.name}" and all its rooms? This cannot be undone.`}
        />
      </div>
      {sp.created === "1" && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Hotel created. Now add its room types below.</p>
      )}

      <HotelForm hotel={hotel} />

      <section className="mt-10" aria-labelledby="rooms-heading">
        <h2 id="rooms-heading" className="mb-4 font-display text-2xl text-brand-900">Rooms</h2>
        <RoomManager hotelId={hotel.id} currency={hotel.currency} rooms={hotel.rooms} />
      </section>
    </>
  );
}
