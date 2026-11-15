"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Route, Ticket, X } from "lucide-react";
import { Logo } from "./Logo";

const TICKETING_URL = "https://b2b.waytokaaba.com/";

function RoundTripButton({ className, active }: { className: string; active?: boolean }) {
  return (
    <Link href="/trip-planner" aria-current={active ? "page" : undefined} className={className}>
      <Route className="h-4 w-4" aria-hidden />
      Round Trip
    </Link>
  );
}

function TicketingButton({ className }: { className: string }) {
  return (
    <a href={TICKETING_URL} target="_blank" rel="noopener noreferrer" className={className}>
      <Ticket className="h-4 w-4" aria-hidden />
      Ticketing
    </a>
  );
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Umrah Packages" },
  { href: "/visas", label: "Visas" },
  { href: "/transport", label: "Private Transport" },
  { href: "/hotels/makkah", label: "Makkah Hotels" },
  { href: "/hotels/madinah", label: "Madinah Hotels" },
  { href: "/about", label: "About Us" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Prevent background scroll and allow Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className="rounded-lg px-2 py-2 text-sm whitespace-nowrap font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-800"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 whitespace-nowrap xl:flex">
          <RoundTripButton className="btn-outline" active={isActive(pathname, "/trip-planner")} />
          <TicketingButton className="btn-gold" />
        </div>

        <button
          type="button"
          className="btn-ghost -mr-2 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
    </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become the containing block
          for this fixed overlay and collapse it to the header's height. */}
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink-900 hover:bg-brand-50 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-3">
              <RoundTripButton className="btn-outline w-full py-3" active={isActive(pathname, "/trip-planner")} />
            </li>
            <li>
              <TicketingButton className="btn-gold w-full py-3" />
            </li>
            <li>
              <Link href="/contact" className="btn-primary w-full py-3">
                Send an Inquiry
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

/** Static navbar rendered in the prerendered shell until the interactive one (which reads the URL) hydrates. */
export function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="rounded-lg px-2 py-2 text-sm whitespace-nowrap font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-800">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 whitespace-nowrap xl:flex">
          <RoundTripButton className="btn-outline" />
          <TicketingButton className="btn-gold" />
        </div>
        <span className="btn-ghost -mr-2 xl:hidden" aria-hidden>
          <Menu className="h-6 w-6" />
        </span>
      </nav>
    </header>
  );
}
