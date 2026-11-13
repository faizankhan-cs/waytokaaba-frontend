import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { deleteVisaAction } from "../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { Badge } from "@/components/ui/primitives";
import { adminGet } from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";
import type { PagedResult, VisaSummary } from "@/lib/types";
import { VISA_FORMAT_LABEL } from "@/lib/visa";

export const metadata = { title: "Visas" };

export default function AdminVisasPage({ searchParams }: PageProps<"/admin/visas">) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Visas</h1>
          <p className="mt-1 text-sm text-ink-500">Create and edit visa countries, their options, prices and required documents.</p>
        </div>
        <Link href="/admin/visas/new" className="btn-primary"><Plus className="h-4 w-4" /> Add visa</Link>
      </div>
      <Suspense fallback={<div className="card mt-6 h-96 animate-pulse" />}>
        {searchParams.then((sp) => (
          <VisaTable deleted={sp.deleted === "1"} />
        ))}
      </Suspense>
    </>
  );
}

async function VisaTable({ deleted }: { deleted: boolean }) {
  const result = await adminGet<PagedResult<VisaSummary>>("/api/admin/visas?pageSize=50");
  return (
    <>
      {deleted && <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Visa deleted.</p>}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Format</th>
              <th className="px-4 py-3 font-semibold">Processing</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {result.items.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/visas/${v.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{v.country}</Link>
                  <Link href={`/visas/${v.slug}`} target="_blank" className="block text-xs text-ink-500 hover:text-brand-700">View on site ↗</Link>
                </td>
                <td className="px-4 py-3">{VISA_FORMAT_LABEL[v.visaFormat]}</td>
                <td className="px-4 py-3">{v.processingTime}</td>
                <td className="px-4 py-3">{v.startingPrice != null ? formatPrice(v.startingPrice, v.currency) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={v.isActive ? "brand" : "red"}>{v.isActive ? "Active" : "Hidden"}</Badge>
                    {v.isFeatured && <Badge tone="gold">Slider</Badge>}
                    {v.isDemoContent && <Badge tone="gray">Demo</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/visas/${v.id}`} className="btn-ghost px-3 py-1.5 text-brand-700">Edit</Link>
                    <DeleteForm action={deleteVisaAction} fields={{ id: v.id }} compact confirmText={`Delete the ${v.country} visa? This cannot be undone.`} />
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
