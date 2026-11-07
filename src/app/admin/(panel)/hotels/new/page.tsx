import Link from "next/link";
import { HotelForm } from "@/components/admin/HotelForm";

export const metadata = { title: "Add hotel" };

export default function NewHotelPage() {
  return (
    <>
      <Link href="/admin/hotels" className="text-sm text-brand-700 hover:underline">← Back to hotels</Link>
      <h1 className="mt-2 mb-6 font-display text-3xl text-brand-900">Add hotel</h1>
      <HotelForm />
      <p className="mt-4 text-sm text-ink-500">You can add room types after the hotel has been created.</p>
    </>
  );
}
