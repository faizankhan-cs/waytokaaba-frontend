import Link from "next/link";
import { Bus, ExternalLink, Hotel, Inbox, LogOut, Package, Stamp } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { logoutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Inquiries", icon: Inbox },
  { href: "/admin/hotels", label: "Hotels & rooms", icon: Hotel },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/visas", label: "Visas", icon: Stamp },
  { href: "/admin/transport", label: "Transport", icon: Bus },
];

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="border-b border-brand-900 bg-brand-950 text-brand-100 lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="h-9 w-auto" />
            <span className="font-display text-xl text-white">Admin</span>
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <button type="submit" className="btn px-2 text-brand-200 hover:text-white" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
        <nav aria-label="Admin" className="overflow-x-auto px-2 pb-3 lg:px-3">
          <ul className="flex gap-1 lg:flex-col">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-brand-900 hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-brand-900 hover:text-white">
                <ExternalLink className="h-4 w-4" aria-hidden /> View website
              </Link>
            </li>
          </ul>
        </nav>
        <form action={logoutAction} className="hidden px-3 pt-4 lg:block">
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-brand-200 hover:bg-brand-900 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
