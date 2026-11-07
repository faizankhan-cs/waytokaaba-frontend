import Link from "next/link";
import { Suspense } from "react";
import { Mail, Phone } from "lucide-react";
import { updateInquiryStatusAction } from "../actions";
import { SubmitButton } from "@/components/admin/FormParts";
import { Pagination } from "@/components/search/Pagination";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { adminGet } from "@/lib/admin/api";
import { toQueryString, type SearchParams } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus, type PagedResult } from "@/lib/types";

export const metadata = { title: "Inquiries" };

const STATUS_TONE: Record<InquiryStatus, "gold" | "brand" | "gray"> = { New: "gold", Contacted: "brand", Closed: "gray" };

export default function InquiriesPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <h1 className="font-display text-3xl text-brand-900">Customer inquiries</h1>
      <p className="mt-1 text-sm text-ink-500">Newest first. Update the status as you follow up with each customer.</p>
      <Suspense fallback={<div className="card mt-6 h-96 animate-pulse" />}>
        <InquiryList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function InquiryList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && INQUIRY_STATUSES.includes(sp.status as InquiryStatus) ? sp.status : undefined;
  const page = typeof sp.page === "string" ? sp.page : undefined;
  const result = await adminGet<PagedResult<Inquiry>>(`/api/inquiries${toQueryString({ status, page, pageSize: 20 })}`);

  return (
    <>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter by status">
        {[undefined, ...INQUIRY_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin?status=${s}` : "/admin"}
            aria-current={status === s ? "page" : undefined}
            className="rounded-full border border-sand-200 bg-white px-3 py-1 text-sm text-ink-700 aria-[current=page]:border-brand-700 aria-[current=page]:bg-brand-700 aria-[current=page]:text-white"
          >
            {s ?? "All"}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-sm text-ink-500">{result.totalCount} inquiries</p>

      {result.items.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No inquiries yet" description="Inquiries submitted on the website will appear here." />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {result.items.map((inq) => (
            <li key={inq.id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink-900">{inq.customerName}</h2>
                    <Badge tone={STATUS_TONE[inq.status]}>{inq.status}</Badge>
                    <Badge tone="gray">{inq.inquiryType}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                    <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-brand-700"><Mail className="h-3.5 w-3.5" aria-hidden />{inq.email}</a>
                    <a href={`tel:${inq.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1 hover:text-brand-700"><Phone className="h-3.5 w-3.5" aria-hidden />{inq.phone}</a>
                  </p>
                </div>
                <p className="shrink-0 text-xs text-ink-500">{formatDateTime(inq.createdAt)}</p>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {inq.packageName && <Detail label="Package" value={inq.packageName} />}
                {inq.hotelName && <Detail label="Hotel" value={`${inq.hotelName}${inq.hotelCity ? ` (${inq.hotelCity})` : ""}`} />}
                {inq.checkIn && <Detail label="Dates" value={`${formatDate(inq.checkIn)}${inq.checkOut ? ` – ${formatDate(inq.checkOut)}` : ""}`} />}
                {inq.guests && <Detail label="Guests" value={String(inq.guests)} />}
              </dl>
              <p className="mt-3 rounded-lg bg-sand-50 p-3 text-sm whitespace-pre-line text-ink-700">{inq.message}</p>

              <form action={updateInquiryStatusAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="id" value={inq.id} />
                <label htmlFor={`status-${inq.id}`} className="text-sm text-ink-500">Status</label>
                <select id={`status-${inq.id}`} name="status" defaultValue={inq.status} className="input w-auto py-1.5">
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SubmitButton className="btn-outline py-1.5">Update</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <Pagination basePath="/admin" searchParams={sp} page={result.page} totalPages={result.totalPages} />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-ink-500">{label}:</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
