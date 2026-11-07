import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { PageHero } from "@/components/ui/primitives";
import { CONTACT } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact Way To Kaaba Travel & Tours, Blue Area, Islamabad, about Umrah packages and hotels in Makkah and Madinah. Call or WhatsApp ${CONTACT.phoneDisplay} or email ${CONTACT.email}.`,
};

const DETAILS = [
  { Icon: Phone, label: "Phone", value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phoneE164}`, external: false },
  { Icon: WhatsAppIcon, label: "WhatsApp", value: `Chat with us on ${CONTACT.phoneDisplay}`, href: CONTACT.whatsappUrl, external: true },
  { Icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, external: false },
  { Icon: FacebookIcon, label: "Facebook", value: "facebook.com/Way-To-Kaaba", href: CONTACT.facebookUrl, external: true },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We're here to help"
        description="Have a question about a package, a hotel or your travel dates? Call or WhatsApp us, visit our office in Islamabad, or send a message below."
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="contact-details">
          <Image
            src="/brand/logo-full.png"
            alt="Way To Kaaba Travel & Tours"
            width={1200}
            height={1234}
            unoptimized
            className="mb-8 h-40 w-auto"
          />
          <h2 id="contact-details" className="font-display text-2xl text-brand-900">Contact details</h2>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {DETAILS.map(({ Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="card flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-900">{label}</span>
                    <span className="block text-sm break-all text-brand-700">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="card mt-4 overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Office</p>
                <address className="text-sm text-ink-500 not-italic">
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
                <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  Get directions <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
            <iframe
              title="Way To Kaaba office location on Google Maps"
              src={CONTACT.mapsEmbedUrl}
              className="h-64 w-full border-0 border-t border-sand-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <InquiryForm inquiryType="General" title="Send us a message" showDates />
        </div>
      </div>
    </>
  );
}
