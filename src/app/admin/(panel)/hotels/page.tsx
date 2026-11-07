import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { deleteHotelAction } from "../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { Badge } from "@/components/ui/primitives";
import { adminGet } from "@/lib/admin/api";
import { formatPrice, hotelHref } from "@/lib/format";
import type { HotelSummary, PagedResult } from "@/lib/types";

export const metadata = { title: "Hotels" };

export default function AdminHotelsPage({ searchParams }: PageProps<"/admin/hotels">) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Hotels</h1>
          <p className="mt-1 text-sm text-ink-500">Add and edit hotels in Makkah and Madinah, and manage their room types.</p>
        </div>
        <Link href="/admin/hotels/new" className="btn-primary"><Plus className="h-4 w-4" /> Add hotel</Link>
      </div>
      <Suspense fallback={<div className="card mt-6 h-96 animate-pulse" />}>
        {searchParams.then((sp) => (
          <HotelTable deleted={sp.deleted === "1"} />
        ))}
      </Suspense>
    </>
  );
}

async function HotelTable({ deleted }: { deleted: boolean }) {
  const result = await adminGet<PagedResult<HotelSummary>>("/api/admin/hotels?pageSize=50&sort=recommended");
  return (
    <>
      {deleted && <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Hotel deleted.</p>}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Hotel</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Stars</th>
              <th className="px-4 py-3 font-semibold">From / night</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {result.items.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/hotels/${h.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{h.name}</Link>
                  <Link href={hotelHref(h)} target="_blank" className="block text-xs text-ink-500 hover:text-brand-700">View on site ↗</Link>
                </td>
                <td className="px-4 py-3">{h.city}</td>
                <td className="px-4 py-3">{h.starRating}★</td>
                <td className="px-4 py-3">{formatPrice(h.pricePerNight, h.currency)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={h.isActive ? "brand" : "red"}>{h.isActive ? "Active" : "Hidden"}</Badge>
                    {h.isFeatured && <Badge tone="gold">Featured</Badge>}
                    {h.isDemoContent && <Badge tone="gray">Demo</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/hotels/${h.id}`} className="btn-ghost px-3 py-1.5 text-brand-700">Edit</Link>
                    <DeleteForm action={deleteHotelAction} fields={{ id: h.id }} compact confirmText={`Delete "${h.name}" and all its rooms? This cannot be undone.`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
