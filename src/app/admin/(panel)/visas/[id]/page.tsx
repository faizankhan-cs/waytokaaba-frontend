import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteVisaAction } from "../../../actions";
import { DeleteForm } from "@/components/admin/FormParts";
import { VisaForm } from "@/components/admin/VisaForm";
import { adminGet } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import type { VisaDetail } from "@/lib/types";

export const metadata = { title: "Edit visa" };

export default function EditVisaPage({ params, searchParams }: PageProps<"/admin/visas/[id]">) {
  return (
    <>
      <Link href="/admin/visas" className="text-sm text-brand-700 hover:underline">← Back to visas</Link>
      <Suspense fallback={<div className="card mt-6 h-[40rem] animate-pulse" />}>
        <EditVisa params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EditVisa({ params, searchParams }: Pick<PageProps<"/admin/visas/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  let visa: VisaDetail;
  try {
    visa = await adminGet<VisaDetail>(`/api/admin/visas/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-900">{visa.country}</h1>
        <DeleteForm action={deleteVisaAction} fields={{ id: visa.id }} label="Delete visa" confirmText={`Delete the ${visa.country} visa? This cannot be undone.`} />
      </div>
      {sp.created === "1" && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">Visa created.</p>
      )}
      <VisaForm visa={visa} />
    </>
  );
}
