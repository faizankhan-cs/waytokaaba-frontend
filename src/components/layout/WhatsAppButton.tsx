import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT } from "@/lib/config";

/** Floating click-to-chat button shown on every public page. */
export function WhatsAppButton() {
  return (
    <a
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp (${CONTACT.phoneDisplay})`}
      className="group fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg ring-4 ring-white/70 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:right-6 sm:bottom-6 sm:px-5"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
