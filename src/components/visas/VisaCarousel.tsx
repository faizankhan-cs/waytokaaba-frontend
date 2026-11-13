import type { VisaSummary } from "@/lib/types";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { VisaCard } from "./VisaCard";

/** Auto-sliding visa cards, same look and behaviour as the package and hotel carousels. */
export function VisaCarousel({ visas }: { visas: VisaSummary[] }) {
  return <CardCarousel label="visa destinations" items={visas.map((visa) => <VisaCard key={visa.id} visa={visa} />)} />;
}
