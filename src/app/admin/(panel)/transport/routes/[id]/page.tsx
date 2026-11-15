import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteTransportRouteAction } from "../../../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { TransportRouteForm } from "@/components/admin/TransportRouteForm";
import { adminGet } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import { routeLabel } from "@/lib/transport";
import type { TransportCatalog, TransportRoute } from "@/lib/types";

export const metadata = { title: "Edit route" };

export default function EditTransportRoutePage({ params, searchParams }: PageProps<"/admin/transport/routes/[id]">) {
  return (
    <>
      <Link href="/admin/transport" className="text-sm text-brand-700 hover:underline">← Back to transport</Link>
      <Suspense fallback={<div className="card mt-6 h-[30rem] animate-pulse" />}>
        <EditRoute params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EditRoute({ params, searchParams }: Pick<PageProps<"/admin/transport/routes/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let route: TransportRoute;
  let catalog: TransportCatalog;
  try {
    [route, catalog] = await Promise.all([
      adminGet<TransportRoute>(`/api/admin/transport/routes/${id}`),
      adminGet<TransportCatalog>("/api/admin/transport"),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-900">{routeLabel(route)}</h1>
        <DeleteForm action={deleteTransportRouteAction} fields={{ id: route.id }} label="Delete route" confirmText={`Delete the route ${routeLabel(route)}? This cannot be undone.`} />
      </div>
      {sp.created === "1" && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Route created.</p>
      )}
      <TransportRouteForm route={route} vehicles={catalog.vehicles} />
    </>
  );
}
