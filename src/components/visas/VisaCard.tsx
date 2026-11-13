import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/format";
import type { VisaSummary } from "@/lib/types";
import { VISA_FORMAT_LABEL, flagUrl } from "@/lib/visa";

export function VisaCard({ visa }: { visa: VisaSummary }) {
  const href = `/visas/${visa.slug}`;
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-sand-100" tabIndex={-1} aria-hidden>
        <Image
          src={visa.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-950/70 to-transparent" />
        <span className="absolute bottom-3 left-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Image src={flagUrl(visa.countryCode)} alt="" width={28} height={20} unoptimized className="h-5 w-7 rounded-[3px] object-cover ring-1 ring-white/60" />
          {visa.country}
        </span>
        {visa.isDemoContent && <DemoBadge className="absolute top-3 left-3" />}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge tone={visa.visaFormat === "UmrahVisa" ? "gold" : "brand"}>{VISA_FORMAT_LABEL[visa.visaFormat]}</Badge>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-ink-900">
          <Link href={href} className="hover:text-brand-700">
            {visa.country} Visa
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">{visa.summary}</p>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-700">
          <Clock className="h-4 w-4 text-ink-500" aria-hidden /> {visa.processingTime}
        </p>

        <div className="mt-auto pt-5">
          {visa.startingPrice != null && (
            <p className="mb-3 text-xl font-bold whitespace-nowrap text-brand-800">
              <span className="mr-1.5 text-xs font-normal text-ink-500">From</span>
              {formatPrice(visa.startingPrice, visa.currency)}
            </p>
          )}
          <Link href={`${href}#requirements`} className="btn-outline w-full whitespace-nowrap">
            View Requirements
          </Link>
        </div>
      </div>
    </article>
  );
}
