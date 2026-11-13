import { BadgeCheck, CalendarClock, Check, Clock, Info, MapPin, Phone, Repeat, X } from "lucide-react";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { APPROVALS, CONTACT, whatsappLink } from "@/lib/config";
import { ScrollToHash } from "@/components/visas/ScrollToHash";
import { formatPrice } from "@/lib/format";
import type { VisaDetail } from "@/lib/types";
import { DEFAULT_VISA_DISCLAIMER, VISA_ENTRY_LABEL, visaMessage } from "@/lib/visa";

const WA_BUTTON = "btn bg-[#25D366] text-white hover:bg-[#1ebe5a]";

/** Horizontal strip with the four facts visitors look for first. */
export function VisaSummaryStrip({ visa }: { visa: VisaDetail }) {
  const items = [
    { icon: <CalendarClock className="h-5 w-5" />, label: "Visa validity", value: visa.validity },
    { icon: <Clock className="h-5 w-5" />, label: "Allowed stay", value: visa.allowedStay },
    { icon: <Repeat className="h-5 w-5" />, label: "Entry type", value: VISA_ENTRY_LABEL[visa.entryType] },
    { icon: <Clock className="h-5 w-5" />, label: "Processing time", value: visa.processingTime },
  ];
  return (
    <dl className="card grid grid-cols-2 divide-sand-200 lg:grid-cols-4 lg:divide-x">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3 p-4">
          <span className="mt-0.5 text-brand-700" aria-hidden>{item.icon}</span>
          <div>
            <dt className="text-xs text-ink-500">{item.label}</dt>
            <dd className="font-semibold text-ink-900">{item.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function VisaTiers({ visa }: { visa: VisaDetail }) {
  return (
    <section aria-labelledby="tiers-heading">
      <h2 id="tiers-heading" className="font-display text-2xl text-brand-900">Visa options and pricing</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {visa.tiers.map((tier) => (
          <li key={tier.id} className="card flex flex-col p-5">
            <h3 className="font-semibold text-ink-900">{tier.name}</h3>
            {tier.description && <p className="mt-1 text-sm text-ink-500">{tier.description}</p>}
            <p className="mt-4 text-2xl font-bold text-brand-800">{formatPrice(tier.price, visa.currency)}</p>
            <div className="mt-auto pt-5">
              <a
                href={whatsappLink(visaMessage(visa.country, tier.name))}
                target="_blank"
                rel="noopener noreferrer"
                className={`${WA_BUTTON} w-full`}
              >
                <WhatsAppIcon className="h-4 w-4" /> Book via WhatsApp
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VisaIncluded({ visa }: { visa: VisaDetail }) {
  const rows = [
    { label: "Embassy / visa fee", included: visa.includesEmbassyFee },
    { label: "Mandatory travel or medical insurance", included: visa.includesInsurance },
    { label: "Agency service charges", included: visa.includesServiceCharge },
  ];
  return (
    <section aria-labelledby="included-heading">
      <h2 id="included-heading" className="font-display text-2xl text-brand-900">What the price includes</h2>
      <ul className="card mt-4 divide-y divide-sand-200">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 px-5 py-3.5 text-sm">
            {row.included ? (
              <Check className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
            ) : (
              <X className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
            )}
            <span className="text-ink-900">{row.label}</span>
            <span className={`ml-auto font-semibold ${row.included ? "text-brand-700" : "text-ink-500"}`}>
              {row.included ? "Included" : "Not included"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DocumentsChecklist({ documents }: { documents: string[] }) {
  if (documents.length === 0) return null;
  return (
    <section id="requirements" aria-labelledby="documents-heading" className="scroll-mt-24">
      <ScrollToHash id="requirements" />
      <h2 id="documents-heading" className="font-display text-2xl text-brand-900">Required documents</h2>
      <ul className="card mt-4 space-y-3 p-5">
        {documents.map((doc) => (
          <li key={doc} className="flex items-start gap-3 text-sm text-ink-700">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
            {doc}
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS = [
  { title: "Send documents on WhatsApp", text: "Message us your scanned documents. We check them and tell you if anything is missing." },
  { title: "Confirm and pay", text: "We confirm the final price and your travel dates. You pay once everything is agreed." },
  { title: "Receive your visa", text: "We process your application and send you the visa as soon as it is approved." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="font-display text-2xl text-brand-900">How it works</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card relative p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white" aria-hidden>
              {i + 1}
            </span>
            <h3 className="mt-3 font-semibold text-ink-900">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-ink-500">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VisaDisclaimer({ text }: { text: string | null }) {
  return (
    <aside className="flex gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm text-ink-700" aria-label="Important notice">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
      <p>
        <strong className="text-ink-900">Important: </strong>
        {text ?? DEFAULT_VISA_DISCLAIMER}
      </p>
    </aside>
  );
}

/** Office details (and approvals, once the agency supplies them) shown beside the WhatsApp buttons. */
export function TrustBadges({ children }: { children?: ReactNode }) {
  return (
    <section aria-labelledby="trust-heading" className="card space-y-4 p-5">
      <h2 id="trust-heading" className="font-semibold text-ink-900">Visit or call our office</h2>
      <ul className="space-y-3 text-sm text-ink-700">
        <li className="flex gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
          <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
            {CONTACT.address}
          </a>
        </li>
        <li className="flex gap-2.5">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
          <a href={`tel:${CONTACT.phoneE164}`} className="hover:text-brand-700">{CONTACT.phoneDisplay}</a>
        </li>
      </ul>
      {APPROVALS.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Official approvals">
          {APPROVALS.map((a) => (
            <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {a}
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

/** Desktop sidebar call to action. Phones use <StickyWhatsAppBar /> instead. */
export function VisaWhatsAppCard({ visa }: { visa: VisaDetail }) {
  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-semibold text-ink-900">Questions about the {visa.country} visa?</h2>
      <p className="text-sm text-ink-500">Message us on WhatsApp. We reply with the exact price, documents and timeline for your dates.</p>
      <a href={whatsappLink(visaMessage(visa.country))} target="_blank" rel="noopener noreferrer" className={`${WA_BUTTON} w-full`}>
        <WhatsAppIcon className="h-4 w-4" /> Inquire on WhatsApp
      </a>
    </div>
  );
}

/** Fixed bottom bar for phones on visa detail pages. */
export function StickyWhatsAppBar({ visa }: { visa: VisaDetail }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
      <a href={whatsappLink(visaMessage(visa.country))} target="_blank" rel="noopener noreferrer" className={`${WA_BUTTON} w-full py-3`}>
        <WhatsAppIcon className="h-5 w-5" /> Inquire on WhatsApp
      </a>
    </div>
  );
}
