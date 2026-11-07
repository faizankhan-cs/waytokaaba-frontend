import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms & Conditions" />
      <article className="container-page prose-page max-w-3xl py-12">
        <p className="rounded-lg bg-gold-50 px-4 py-3 text-sm">
          These are draft terms for the initial version of the website. They should be reviewed and finalised by the
          business owner (and legal counsel where appropriate) before public launch.
        </p>
        <h2>Inquiries, not bookings</h2>
        <p>
          Submitting an inquiry on this website does not create a booking or reservation. Our team will contact you to
          confirm availability, final pricing and terms before any booking is made.
        </p>
        <h2>Prices and availability</h2>
        <p>
          Prices shown are indicative and may change depending on travel dates, room type, airline and availability.
          Listings marked &quot;Sample listing&quot; are demonstration content and are not offers.
        </p>
        <h2>Hotel and package information</h2>
        <p>
          We aim to keep descriptions, photos and facilities accurate, but details may change. Distances to the holy
          mosques are shown only where they have been verified.
        </p>
        <h2>Visas and travel requirements</h2>
        <p>
          Visa approval is subject to the rules of the relevant authorities. Travellers are responsible for meeting
          passport, health and entry requirements.
        </p>
        <h2>Changes to these terms</h2>
        <p>We may update these terms from time to time. The latest version will always be available on this page.</p>
      </article>
    </>
  );
}
