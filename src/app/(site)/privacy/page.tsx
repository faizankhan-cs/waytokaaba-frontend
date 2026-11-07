import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <article className="container-page prose-page max-w-3xl py-12">
        <p className="rounded-lg bg-gold-50 px-4 py-3 text-sm">
          This is a draft policy for the initial version of the website. It should be reviewed and finalised by the
          business owner (and legal counsel where appropriate) before public launch.
        </p>
        <h2>Information we collect</h2>
        <p>When you send an inquiry, we collect the details you provide in the form:</p>
        <ul>
          <li>Your name, email address and phone number</li>
          <li>The package or hotel you are asking about</li>
          <li>Your preferred travel dates, number of guests and your message</li>
        </ul>
        <h2>How we use your information</h2>
        <p>
          We use these details only to respond to your inquiry, provide availability and pricing, and help plan your
          journey. We do not sell your personal information.
        </p>
        <h2>Payments</h2>
        <p>This website does not collect payment card details. No bookings or payments are processed online.</p>
        <h2>Data retention and security</h2>
        <p>
          Inquiry records are stored securely and kept only as long as needed to serve you and meet legal obligations.
          Access is limited to authorised staff.
        </p>
        <h2>Your choices</h2>
        <p>You may ask us to update or delete the information you submitted by contacting us through the Contact page.</p>
      </article>
    </>
  );
}
