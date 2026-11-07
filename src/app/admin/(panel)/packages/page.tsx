import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { deletePackageAction } from "../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { Badge } from "@/components/ui/primitives";
import { adminGet } from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";
import type { PackageSummary, PagedResult } from "@/lib/types";

export const metadata = { title: "Packages" };

export default function AdminPackagesPage({ searchParams }: PageProps<"/admin/packages">) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Umrah packages</h1>
          <p className="mt-1 text-sm text-ink-500">Create and edit packages, their hotels and included services.</p>
        </div>
        <Link href="/admin/packages/new" className="btn-primary"><Plus className="h-4 w-4" /> Add package</Link>
      </div>
      <Suspense fallback={<div className="card mt-6 h-96 animate-pulse" />}>
        {searchParams.then((sp) => (
          <PackageTable deleted={sp.deleted === "1"} />
        ))}
      </Suspense>
    </>
  );
}

async function PackageTable({ deleted }: { deleted: boolean }) {
  const result = await adminGet<PagedResult<PackageSummary>>("/api/admin/packages?pageSize=50");
  return (
    <>
      {deleted && <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Package deleted.</p>}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Package</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {result.items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/packages/${p.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{p.name}</Link>
                  <Link href={`/packages/${p.slug}`} target="_blank" className="block text-xs text-ink-500 hover:text-brand-700">View on site ↗</Link>
                </td>
                <td className="px-4 py-3">{p.packageType}</td>
                <td className="px-4 py-3">{p.durationInDays} days ({p.makkahDays}+{p.madinahDays})</td>
                <td className="px-4 py-3">{formatPrice(p.price, p.currency)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={p.isActive ? "brand" : "red"}>{p.isActive ? "Active" : "Hidden"}</Badge>
                    {p.isFeatured && <Badge tone="gold">Featured</Badge>}
                    {p.isDemoContent && <Badge tone="gray">Demo</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/packages/${p.id}`} className="btn-ghost px-3 py-1.5 text-brand-700">Edit</Link>
                    <DeleteForm action={deletePackageAction} fields={{ id: p.id }} compact confirmText={`Delete "${p.name}"? This cannot be undone.`} />
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
