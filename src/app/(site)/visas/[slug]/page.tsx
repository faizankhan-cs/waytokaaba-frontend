import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import {
  DocumentsChecklist,
  HowItWorks,
  StickyWhatsAppBar,
  TrustBadges,
  VisaDisclaimer,
  VisaIncluded,
  VisaSummaryStrip,
  VisaTiers,
  VisaWhatsAppCard,
} from "@/components/visas/VisaSections";
import { Badge, DemoBadge } from "@/components/ui/primitives";
import { getVisa } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { VISA_FORMAT_HINT, VISA_FORMAT_LABEL, flagUrl } from "@/lib/visa";

type Props = PageProps<"/visas/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const visa = await getVisa(slug).catch(() => null);
  if (!visa) return { title: "Visa not found" };
  return {
    title: `${visa.country} Visa`,
    description: `${visa.summary} Processing time: ${visa.processingTime}.`,
    openGraph: { images: [{ url: visa.imageUrl }] },
  };
}

export default function VisaDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page h-[60vh] py-10" role="status" aria-label="Loading visa" />}>
      <VisaDetailContent params={params} />
    </Suspense>
  );
}

async function VisaDetailContent({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const visa = await getVisa(slug);
  if (!visa) notFound();

  return (
    <div className="container-page py-8 pb-28 sm:py-10 sm:pb-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/visas" className="hover:text-brand-700">Visas</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-ink-900">{visa.country}</span>
      </nav>

      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={visa.visaFormat === "UmrahVisa" ? "gold" : "brand"}>{VISA_FORMAT_LABEL[visa.visaFormat]}</Badge>
            <span className="text-xs text-ink-500">{VISA_FORMAT_HINT[visa.visaFormat]}</span>
            {visa.isDemoContent && <DemoBadge />}
          </div>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl text-brand-900 sm:text-4xl">
            <Image src={flagUrl(visa.countryCode)} alt="" width={40} height={28} unoptimized className="h-7 w-10 rounded object-cover ring-1 ring-sand-200" />
            {visa.country} Visa
          </h1>
          <p className="mt-2 max-w-2xl text-ink-500">{visa.summary}</p>
        </div>
        {visa.startingPrice != null && (
          <div className="sm:text-right">
            <p className="text-sm text-ink-500">Starting from</p>
            <p className="text-3xl font-bold text-brand-800">{formatPrice(visa.startingPrice, visa.currency)}</p>
          </div>
        )}
      </header>

      <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl bg-sand-100">
        <Image src={visa.imageUrl} alt="" fill preload sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
      </div>

      <div className="mt-6">
        <VisaSummaryStrip visa={visa} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <VisaTiers visa={visa} />
          <VisaIncluded visa={visa} />
          <DocumentsChecklist documents={visa.requiredDocuments} />
          <HowItWorks />
          <VisaDisclaimer text={visa.disclaimer} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden sm:block">
            <VisaWhatsAppCard visa={visa} />
          </div>
          <TrustBadges />
        </aside>
      </div>

      <StickyWhatsAppBar visa={visa} />
    </div>
  );
}
