import Link from "next/link";
import { AlertTriangle, SearchX, Star } from "lucide-react";
import type { ReactNode } from "react";

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4.5 w-4.5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} star hotel`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < rating ? "fill-gold-400 text-gold-400" : "fill-sand-200 text-sand-200"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Marks sample listings so demonstration content is never mistaken for verified inventory. */
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-700 shadow-sm ring-1 ring-sand-200 ${className}`}
      title="Sample listing for demonstration. Details and prices are indicative."
    >
      Sample listing
    </span>
  );
}

export function Badge({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "gold" | "gray" | "red" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-800 ring-brand-200",
    gold: "bg-gold-50 text-gold-700 ring-gold-200",
    gray: "bg-sand-100 text-ink-700 ring-sand-200",
    red: "bg-red-50 text-red-700 ring-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="heading-section">{title}</h2>
        {description && <p className="mt-3 text-ink-500">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-outline shrink-0 self-start sm:self-auto">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <SearchX className="h-10 w-10 text-ink-300" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "We couldn't load this right now", description }: { title?: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center" role="alert">
      <AlertTriangle className="h-10 w-10 text-gold-500" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-ink-500">
        {description ?? "Please refresh the page in a moment. If the problem continues, contact us and we'll help directly."}
      </p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="aspect-[4/3] animate-pulse bg-sand-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-sand-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-sand-100" />
        <div className="h-3 w-full animate-pulse rounded bg-sand-100" />
        <div className="h-8 w-1/3 animate-pulse rounded bg-sand-100" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3, cols = "sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-6 ${cols}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-sand-200 bg-gradient-to-b from-brand-50 to-sand-50">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl text-brand-900 sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-ink-500">{description}</p>}
      </div>
    </section>
  );
}
