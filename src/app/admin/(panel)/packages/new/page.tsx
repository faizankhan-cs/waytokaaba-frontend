import Link from "next/link";
import { Suspense } from "react";
import { PackageForm } from "@/components/admin/PackageForm";
import { adminGet } from "@/lib/admin/api";
import type { HotelSummary, PagedResult } from "@/lib/types";

export const metadata = { title: "Add package" };

export default function NewPackagePage() {
  return (
    <>
      <Link href="/admin/packages" className="text-sm text-brand-700 hover:underline">← Back to packages</Link>
      <h1 className="mt-2 mb-6 font-display text-3xl text-brand-900">Add package</h1>
      <Suspense fallback={<div className="card h-[40rem] animate-pulse" />}>
        <NewPackageForm />
      </Suspense>
    </>
  );
}

async function NewPackageForm() {
  const hotels = await adminGet<PagedResult<HotelSummary>>("/api/admin/hotels?pageSize=50&sort=stars_desc");
  return <PackageForm hotels={hotels.items} />;
}
