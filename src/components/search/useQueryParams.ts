"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useOptimistic, useTransition } from "react";

export type ParamUpdates = Record<string, string | string[] | null | undefined>;

/**
 * The most recent filter change that may not have reached the URL yet. Shared by every filter
 * control, so quick successive changes (e.g. untick a type, then pick a duration) build on each
 * other instead of on the stale URL.
 */
let pending: { path: string; query: string; chain: string[] } | null = null;

function baseQuery(pathname: string, urlQuery: string): string {
  // Valid while the URL is still at the starting point or any intermediate step of the pending chain.
  if (pending && pending.path === pathname && pending.chain.includes(urlQuery)) {
    return pending.query;
  }
  return urlQuery;
}

/**
 * Reads and updates URL search params. Filter changes reset pagination to page 1.
 * The returned `searchParams` are optimistic: controls reflect a change immediately,
 * while the new results stream in from the server.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(urlParams.toString());
  const searchParams = useMemo(() => new URLSearchParams(optimisticQuery), [optimisticQuery]);

  const update = useCallback(
    (updates: ParamUpdates, { resetPage = true }: { resetPage?: boolean } = {}) => {
      const urlQuery = urlParams.toString();
      const base = baseQuery(pathname, urlQuery);
      const next = new URLSearchParams(base);
      for (const [key, value] of Object.entries(updates)) {
        next.delete(key);
        if (Array.isArray(value)) value.filter(Boolean).forEach((v) => next.append(key, v));
        else if (value) next.set(key, value);
      }
      if (resetPage) next.delete("page");
      const qs = next.toString();
      pending = {
        path: pathname,
        query: qs,
        chain: base === urlQuery ? [urlQuery, qs] : [...(pending?.chain ?? []), qs].slice(-10),
      };
      startTransition(() => {
        setOptimisticQuery(qs);
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [urlParams, pathname, router, setOptimisticQuery],
  );

  return { searchParams, update, isPending, pathname };
}
