import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deletePackageAction } from "../../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { PackageForm } from "@/components/admin/PackageForm";
import { adminGet } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import type { HotelSummary, PackageDetail, PagedResult } from "@/lib/types";

export const metadata = { title: "Edit package" };

export default function EditPackagePage({ params, searchParams }: PageProps<"/admin/packages/[id]">) {
  return (
    <>
      <Link href="/admin/packages" className="text-sm text-brand-700 hover:underline">← Back to packages</Link>
      <Suspense fallback={<div className="card mt-6 h-[40rem] animate-pulse" />}>
        <EditPackage params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EditPackage({ params, searchParams }: Pick<PageProps<"/admin/packages/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let pkg: PackageDetail;
  let hotels: PagedResult<HotelSummary>;
  try {
    [pkg, hotels] = await Promise.all([
      adminGet<PackageDetail>(`/api/admin/packages/${id}`),
      adminGet<PagedResult<HotelSummary>>("/api/admin/hotels?pageSize=50&sort=stars_desc"),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-900">{pkg.name}</h1>
        <DeleteForm action={deletePackageAction} fields={{ id: pkg.id }} label="Delete package" confirmText={`Delete "${pkg.name}"? This cannot be undone.`} />
      </div>
      {sp.created === "1" && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Package created.</p>
      )}
      <PackageForm pkg={pkg} hotels={hotels.items} />
    </>
  );
}
