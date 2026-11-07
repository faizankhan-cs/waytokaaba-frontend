import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchParams } from "@/lib/api";

function hrefFor(basePath: string, sp: SearchParams, page: number) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v === undefined) continue;
    (Array.isArray(v) ? v : [v]).forEach((x) => qs.append(k, x));
  }
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: SearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink href={hrefFor(basePath, searchParams, page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-2 text-ink-300">…</span>}
          <Link
            href={hrefFor(basePath, searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className="flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-ink-700 hover:bg-sand-100 aria-[current=page]:bg-brand-700 aria-[current=page]:text-white"
          >
            {p}
          </Link>
        </span>
      ))}
      <PageLink href={hrefFor(basePath, searchParams, page + 1)} disabled={page >= totalPages} label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled)
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-300" aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  return (
    <Link href={href} className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-sand-100" aria-label={label}>
      {children}
    </Link>
  );
}
