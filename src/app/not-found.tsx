import Link from "next/link";
import { LogoMark } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 text-center">
      <LogoMark className="h-20 w-auto" />
      <p className="eyebrow mt-6">Page not found</p>
      <h1 className="mt-2 font-display text-4xl text-brand-900">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-ink-500">The page may have moved, or the listing is no longer available.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Go to homepage</Link>
        <Link href="/packages" className="btn-outline">Browse packages</Link>
        <Link href="/hotels" className="btn-outline">Browse hotels</Link>
      </div>
    </div>
  );
}
