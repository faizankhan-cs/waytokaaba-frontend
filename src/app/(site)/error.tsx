"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" role="alert">
      <AlertTriangle className="h-12 w-12 text-gold-500" aria-hidden />
      <h1 className="mt-4 font-display text-3xl text-brand-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-500">
        We couldn&apos;t load this page. Our servers may be waking up — please try again in a few seconds.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-outline">Go to homepage</Link>
      </div>
    </div>
  );
}
