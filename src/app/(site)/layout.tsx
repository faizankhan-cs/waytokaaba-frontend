import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar, NavbarFallback } from "@/components/layout/Navbar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CONTACT, SITE } from "@/lib/config";

/** Business details for search engines (schema.org TravelAgency). */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE.legalName,
  url: SITE.url,
  logo: `${SITE.url}/brand/logo-full.png`,
  image: `${SITE.url}/brand/logo-full.png`,
  email: CONTACT.email,
  telephone: CONTACT.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Office No. 4, Floor 2, Allay Plaza, Near PIA Building, Fazal-e-Haq Road, Blue Area",
    addressLocality: "Islamabad",
    postalCode: "44000",
    addressCountry: "PK",
  },
  sameAs: [CONTACT.facebookUrl],
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
