import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { deleteTransportRouteAction, deleteTransportVehicleAction } from "../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { Badge } from "@/components/ui/primitives";
import { adminGet } from "@/lib/admin/api";
import { formatPrice } from "@/lib/format";
import { priceFor, routeLabel } from "@/lib/transport";
import type { TransportCatalog } from "@/lib/types";

export const metadata = { title: "Transport" };

export default function AdminTransportPage({ searchParams }: PageProps<"/admin/transport">) {
  return (
    <>
      <div>
        <h1 className="font-display text-3xl text-brand-900">Private transport</h1>
        <p className="mt-1 text-sm text-ink-500">Manage the vehicles, routes and the price of each vehicle on each route (PKR, one way).</p>
      </div>
      <Suspense fallback={<div className="card mt-6 h-96 animate-pulse" />}>
        {searchParams.then((sp) => (
          <TransportAdmin deleted={typeof sp.deleted === "string" ? sp.deleted : undefined} />
        ))}
      </Suspense>
    </>
  );
}

async function TransportAdmin({ deleted }: { deleted?: string }) {
  const { vehicles, routes, currency } = await adminGet<TransportCatalog>("/api/admin/transport");
  return (
    <>
      {deleted && (
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">
          {deleted === "vehicle" ? "Vehicle deleted." : "Route deleted."}
        </p>
      )}

      <section className="mt-8" aria-labelledby="vehicles-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="vehicles-heading" className="text-xl font-semibold text-ink-900">Vehicles</h2>
          <Link href="/admin/transport/vehicles/new" className="btn-primary"><Plus className="h-4 w-4" /> Add vehicle</Link>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Seats / bags</th>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image src={v.imageUrl} alt="" width={64} height={44} className="h-11 w-16 rounded-md object-cover" />
                      <Link href={`/admin/transport/vehicles/${v.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{v.name}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">{v.seats} / {v.bags}</td>
                  <td className="px-4 py-3">{v.startingPrice != null ? formatPrice(v.startingPrice, currency) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={v.isActive ? "brand" : "red"}>{v.isActive ? "Active" : "Hidden"}</Badge>
                      {v.isDemoContent && <Badge tone="gray">Demo</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/transport/vehicles/${v.id}`} className="btn-ghost px-3 py-1.5 text-brand-700">Edit</Link>
                      <DeleteForm
                        action={deleteTransportVehicleAction}
                        fields={{ id: v.id }}
                        compact
                        confirmText={`Delete the ${v.name}? Its prices on every route are deleted too. This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="routes-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="routes-heading" className="text-xl font-semibold text-ink-900">Routes &amp; prices</h2>
          <Link href="/admin/transport/routes/new" className="btn-primary"><Plus className="h-4 w-4" /> Add route</Link>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Route</th>
                {vehicles.map((v) => (
                  <th key={v.id} className="px-3 py-3 text-right font-semibold">{v.name}</th>
                ))}
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {routes.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/transport/routes/${r.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{routeLabel(r)}</Link>
                  </td>
                  {vehicles.map((v) => {
                    const p = priceFor(r, v.id);
                    return (
                      <td key={v.id} className="px-3 py-3 text-right tabular-nums">
                        {p === null ? <span className="text-ink-300">—</span> : formatPrice(p, currency)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <Badge tone={r.isActive ? "brand" : "red"}>{r.isActive ? "Active" : "Hidden"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/transport/routes/${r.id}`} className="btn-ghost px-3 py-1.5 text-brand-700">Edit</Link>
                      <DeleteForm action={deleteTransportRouteAction} fields={{ id: r.id }} compact confirmText={`Delete the route ${routeLabel(r)}? This cannot be undone.`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          <Link href="/transport" target="_blank" className="hover:text-brand-700">View the transport page on the site ↗</Link>
        </p>
      </section>
    </>
  );
}
