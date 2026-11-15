import Link from "next/link";
import { Suspense } from "react";
import { TransportRouteForm } from "@/components/admin/TransportRouteForm";
import { adminGet } from "@/lib/admin/api";
import type { TransportCatalog } from "@/lib/types";

export const metadata = { title: "Add route" };

export default function NewTransportRoutePage() {
  return (
    <>
      <Link href="/admin/transport" className="text-sm text-brand-700 hover:underline">← Back to transport</Link>
      <h1 className="mt-2 mb-6 font-display text-3xl text-brand-900">Add route</h1>
      <Suspense fallback={<div className="card h-[30rem] animate-pulse" />}>
        <NewRouteForm />
      </Suspense>
    </>
  );
}

async function NewRouteForm() {
  const { vehicles } = await adminGet<TransportCatalog>("/api/admin/transport");
  return <TransportRouteForm vehicles={vehicles} />;
}
