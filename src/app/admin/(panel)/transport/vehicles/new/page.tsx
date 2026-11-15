import Link from "next/link";
import { TransportVehicleForm } from "@/components/admin/TransportVehicleForm";

export const metadata = { title: "Add vehicle" };

export default function NewTransportVehiclePage() {
  return (
    <>
      <Link href="/admin/transport" className="text-sm text-brand-700 hover:underline">← Back to transport</Link>
      <h1 className="mt-2 mb-6 font-display text-3xl text-brand-900">Add vehicle</h1>
      <TransportVehicleForm />
    </>
  );
}
