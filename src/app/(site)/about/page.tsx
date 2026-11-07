import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, ListChecks, MessagesSquare } from "lucide-react";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Way To Kaaba Travel & Tours and how we help pilgrims plan Umrah with carefully selected packages and hotels.",
};

const VALUES = [
  {
    icon: ListChecks,
    title: "Clear information",
    text: "Every package lists its hotels, nights in each city and included services, so you know what to expect.",
  },
  {
    icon: MessagesSquare,
    title: "Personal guidance",
    text: "Send an inquiry and a member of our team will help you choose dates, rooms and the right package.",
  },
  {
    icon: HeartHandshake,
    title: "Care for every pilgrim",
    text: "Families, elderly travellers and first-time pilgrims — we help you plan a journey that suits your needs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Way To Kaaba" title="Helping you plan a peaceful Umrah" />

      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-2">
        <div className="prose-page">
          <p className="text-lg">
            Way To Kaaba Travel &amp; Tours is an Umrah travel company that helps pilgrims discover Umrah packages and hotels in Makkah and
            Madinah in one place.
          </p>
          <p>
            Planning a sacred journey involves many decisions — where to stay, for how long in each city, and which
            services are included. Our goal is to present these options clearly so you can compare them with confidence
            and then speak with our team to finalise the details.
          </p>
          <p>
            We work on an inquiry basis: browse packages and hotels, send us your requirements, and we&apos;ll get back to
            you with availability and pricing for your dates. Nothing is booked or charged online.
          </p>
          <p className="text-sm text-ink-500">
            {/* Placeholder for the client's own story, licensing details and team information. */}
            More information about our company and team will be added soon.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1646424857576-2a66db82a65c?auto=format&fit=crop"
            alt="The Green Dome of Masjid an-Nabawi in Madinah"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <h2 className="heading-section">What we stand for</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-6">
                <Icon className="h-8 w-8 text-gold-500" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/packages" className="btn-primary">Browse Umrah Packages</Link>
            <Link href="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
