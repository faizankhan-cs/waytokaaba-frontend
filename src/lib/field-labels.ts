/**
 * Friendly names for form fields, used when listing problems in an error popup.
 * Keys are the field names the forms and the API use (the API may send them in PascalCase, e.g. "ImageUrl").
 */
const LABELS: Record<string, string> = {
  // inquiries
  customername: "Full name",
  email: "Email",
  phone: "Phone / WhatsApp",
  checkin: "Check-in",
  checkout: "Check-out",
  guests: "Guests",
  message: "Message",
  // admin: common
  name: "Name",
  slug: "URL slug",
  imageurl: "Photo",
  images: "Gallery photos",
  shortdescription: "Short description",
  description: "Description",
  sortorder: "Sort order",
  password: "Password",
  // hotels & rooms
  city: "City",
  address: "Address",
  starrating: "Star rating",
  pricepernight: "Price per night",
  distancetoharammeters: "Distance to Haram",
  isdistanceverified: "Distance verified",
  facilities: "Facilities",
  capacity: "Max guests",
  // packages
  durationdays: "Duration (days)",
  price: "Price",
  hotels: "Hotels",
  services: "Included services",
  // visas
  country: "Country",
  tiers: "Visa options",
  // transport
  seats: "Seats",
  bags: "Bags",
  from: "From",
  to: "To",
  note: "Note",
  prices: "Prices",
  // round trip settings
  visatransportpriceperperson: "Visa & transport price per person",
};

/** "Tiers[0].Price" → "Visa options 1 · Price"; unknown keys are turned into words ("maxPrice" → "Max price"). */
export function fieldLabel(key: string): string {
  const parts = key.split(".");
  return parts
    .map((part) => {
      const m = /^(\w+)\[(\d+)\]$/.exec(part);
      const base = m ? m[1] : part;
      const known = LABELS[base.toLowerCase()];
      const words = known ?? humanize(base);
      return m ? `${words} ${Number(m[2]) + 1}` : words;
    })
    .join(" · ");
}

function humanize(s: string): string {
  const spaced = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
