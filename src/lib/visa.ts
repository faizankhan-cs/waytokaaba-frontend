import type { VisaEntryType, VisaFormat } from "./types";

export const VISA_FORMAT_LABEL: Record<VisaFormat, string> = {
  EVisa: "E-Visa",
  StickerVisa: "Sticker Visa",
  UmrahVisa: "Umrah Visa",
};

/** Tells visitors up front whether they must visit an embassy or visa centre. */
export const VISA_FORMAT_HINT: Record<VisaFormat, string> = {
  EVisa: "Delivered by email. No embassy visit.",
  StickerVisa: "Passport goes to the embassy or visa centre.",
  UmrahVisa: "For Umrah travel to Makkah and Madinah only.",
};

export const VISA_ENTRY_LABEL: Record<VisaEntryType, string> = {
  SingleEntry: "Single entry",
  MultipleEntry: "Multiple entry",
};

export const DEFAULT_VISA_DISCLAIMER =
  "Visa prices can change with exchange rates and embassy fees. Approval is decided by the embassy or immigration authority, and we cannot guarantee it. Our team confirms the final price before you pay.";

/** Flag image for an ISO 3166-1 alpha-2 code. Images are used because flag emoji do not render on Windows. */
export function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
}

/** Pre-filled WhatsApp message for a visa, or for one tier of it. */
export function visaMessage(country: string, tierName?: string): string {
  return tierName
    ? `Assalam-o-Alaikum, I want details for the ${tierName} (${country}).`
    : `Assalam-o-Alaikum, I want details for the ${country} visa.`;
}
