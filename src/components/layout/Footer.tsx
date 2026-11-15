import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT } from "@/lib/config";
import { LogoMark } from "./Logo";

const EXPLORE = [
  { href: "/packages", label: "Umrah Packages" },
  { href: "/visas", label: "Visas" },
  { href: "/transport", label: "Transport" },
  { href: "/hotels/makkah", label: "Makkah Hotels" },
  { href: "/hotels/madinah", label: "Madinah Hotels" },
  { href: "/hotels", label: "All Hotels" },
];

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const SOCIAL = [
  { label: "Facebook", href: CONTACT.facebookUrl, Icon: FacebookIcon },
  { label: "WhatsApp", href: CONTACT.whatsappUrl, Icon: WhatsAppIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-3" aria-label="Way To Kaaba Travel & Tours — home">
            <LogoMark className="h-14 w-auto" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-wide text-white uppercase">Way To Kaaba</span>
              <span className="mt-1.5 text-[0.65rem] font-semibold tracking-[0.32em] text-gold-400 uppercase">Travel &amp; Tours</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            Helping pilgrims find carefully selected Umrah packages and comfortable hotels in Makkah and Madinah.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Follow and contact us">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-700 px-3.5 py-1.5 text-xs font-medium text-brand-100 transition-colors hover:border-gold-400 hover:text-gold-400"
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn title="Explore" links={EXPLORE} />
        <FooterColumn title="Company" links={COMPANY} />

        <div>
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-200">
            <li>
              <a href={`tel:${CONTACT.phoneE164}`} className="flex gap-2.5 transition-colors hover:text-gold-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>{CONTACT.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex gap-2.5 break-all transition-colors hover:text-gold-400">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <span>{CONTACT.email}</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 transition-colors hover:text-gold-400">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>WhatsApp us</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 transition-colors hover:text-gold-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                <address className="not-italic">
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-900">
        {/* Extra bottom space on phones and right space on desktop keep this text clear of the floating buttons. */}
        <div className="container-page flex flex-col gap-2 pt-5 pb-24 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
          <p>© <CopyrightYear /> Way To Kaaba Travel &amp; Tours. All rights reserved.</p>
          <p className="sm:pr-20">Listings and prices shown are indicative. Availability and final pricing are confirmed by our team.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wider text-white uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-brand-200 transition-colors hover:text-gold-400">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cached so the static shell can be prerendered (Cache Components disallows raw `new Date()` there). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
