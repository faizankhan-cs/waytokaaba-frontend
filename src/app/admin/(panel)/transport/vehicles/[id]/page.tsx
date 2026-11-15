import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteTransportVehicleAction } from "../../../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { TransportVehicleForm } from "@/components/admin/TransportVehicleForm";
import { adminGet } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import type { TransportVehicle } from "@/lib/types";

export const metadata = { title: "Edit vehicle" };

export default function EditTransportVehiclePage({ params, searchParams }: PageProps<"/admin/transport/vehicles/[id]">) {
  return (
    <>
      <Link href="/admin/transport" className="text-sm text-brand-700 hover:underline">← Back to transport</Link>
      <Suspense fallback={<div className="card mt-6 h-[30rem] animate-pulse" />}>
        <EditVehicle params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EditVehicle({ params, searchParams }: Pick<PageProps<"/admin/transport/vehicles/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let vehicle: TransportVehicle;
  try {
    vehicle = await adminGet<TransportVehicle>(`/api/admin/transport/vehicles/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-900">{vehicle.name}</h1>
        <DeleteForm
          action={deleteTransportVehicleAction}
          fields={{ id: vehicle.id }}
          label="Delete vehicle"
          confirmText={`Delete the ${vehicle.name}? Its prices on every route are deleted too. This cannot be undone.`}
        />
      </div>
      {sp.created === "1" && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Vehicle created. Now add its prices on the routes.</p>
      )}
      <TransportVehicleForm vehicle={vehicle} />
    </>
  );
}
