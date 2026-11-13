"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";

/** Floating "Send an Inquiry" button, stacked above the WhatsApp button. Hidden on the contact page itself. */
export function InquiryButton() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <Link
      href="/contact"
      aria-label="Send an inquiry"
      className="btn-primary fixed right-4 bottom-20 z-30 rounded-full p-3.5 shadow-lg ring-4 ring-white/70 transition-transform hover:scale-105 sm:right-6 sm:bottom-24 sm:px-5"
    >
      <MessageSquareText className="h-6 w-6 sm:h-5 sm:w-5" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">Send an Inquiry</span>
    </Link>
  );
}
