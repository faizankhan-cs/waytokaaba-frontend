"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT } from "@/lib/config";

const ROUND =
  "flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)] transition duration-200 group-hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:h-14 sm:w-14";

/** Label pill that slides out to the left of a round button on hover or keyboard focus (desktop only). */
function HoverLabel({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 translate-x-2 rounded-full bg-brand-900 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition duration-200 group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:block motion-reduce:transition-none"
    >
      {children}
    </span>
  );
}

/**
 * Floating "Send an Inquiry" and WhatsApp buttons, bottom right on every public page.
 * - Always visible, including over the footer (its bottom bar leaves room for them; see Footer.tsx).
 * - No inquiry button on /contact, which is the inquiry page itself.
 * - Hidden on phones on visa detail pages, which have their own sticky WhatsApp bar, and on the transport
 *   page below md, where every route in the list has its own WhatsApp "Book" button on the right edge.
 */
export function FloatingActions() {
  const pathname = usePathname();
  const hide = /^\/visas\/[^/]+/.test(pathname) ? " max-sm:hidden" : pathname === "/transport" ? " max-md:hidden" : "";

  return (
    <div
      className={`fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6${hide}`}
    >
      {pathname !== "/contact" && (
        <div className="group relative">
          <HoverLabel>Send an Inquiry</HoverLabel>
          <Link
            href="/contact"
            aria-label="Send an inquiry"
            className={`${ROUND} bg-brand-900 text-gold-400 ring-1 ring-gold-500/50 hover:bg-brand-800`}
          >
            <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </Link>
        </div>
      )}
      <div className="group relative">
        <HoverLabel>Chat on WhatsApp</HoverLabel>
        <a
          href={CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with us on WhatsApp (${CONTACT.phoneDisplay})`}
          className={`${ROUND} bg-[#25D366] text-white hover:bg-[#1ebe5a]`}
        >
          <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </a>
      </div>
    </div>
  );
}
