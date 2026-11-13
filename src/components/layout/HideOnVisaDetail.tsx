"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Visa detail pages have their own fixed WhatsApp bar on phones. Hide the floating chat and inquiry
 * buttons there (below the sm breakpoint) so they do not sit on top of it.
 */
export function HideOnVisaDetail({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onVisaDetail = /^\/visas\/[^/]+/.test(pathname);
  return <div className={onVisaDetail ? "max-sm:hidden" : "contents"}>{children}</div>;
}
