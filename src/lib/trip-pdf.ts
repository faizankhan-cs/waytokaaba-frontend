import { CONTACT, SITE } from "./config";
import { DISCLAIMER, bedNote, formatStayDate, guestSummary, money, type Slip } from "./trip";

// Brand colours (see globals.css): near-black and gold-500.
const BLACK: [number, number, number] = [13, 13, 13];
const GOLD: [number, number, number] = [201, 162, 39];
const INK: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [107, 107, 107];
const GOLD_DARK: [number, number, number] = [150, 118, 22];

/**
 * Builds the A4 PDF slip. jsPDF is loaded on demand so it never weighs down the rest of the site.
 * Text is limited to the standard Helvetica font, so amounts use "PKR 20,000" rather than a currency symbol.
 */
export async function buildSlipPdf(slip: Slip): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > H - 22) {
      doc.addPage();
      y = 20;
    }
  };

  // Header band
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 34, W, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(20).text(SITE.legalName, M, 15);
  doc.setFont("helvetica", "normal").setFontSize(10).text("Trip estimate slip", M, 23);
  doc.text(`${CONTACT.phoneDisplay}  ·  ${CONTACT.email}`, M, 29);
  doc.setFont("helvetica", "bold").setFontSize(11).text(slip.reference, W - M, 15, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).text(
    new Date(slip.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    W - M,
    21,
    { align: "right" },
  );

  y = 46;
  doc.setTextColor(...INK);
  if (slip.customer.name || slip.customer.phone) {
    doc.setFont("helvetica", "bold").setFontSize(10).text("Prepared for", M, y);
    doc.setFont("helvetica", "normal").text([slip.customer.name, slip.customer.phone].filter(Boolean).join("  ·  "), M + 28, y);
    y += 6;
  }
  doc.setFont("helvetica", "bold").setFontSize(10).text("Guests", M, y);
  doc.setFont("helvetica", "normal").text(guestSummary(slip.guests), M + 28, y);
  y += 10;

  const sectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...GOLD_DARK).text(title, M, y);
    doc.setTextColor(...INK);
    y += 7;
  };

  // 1. Visa & transport (when added) comes first, then the hotels.
  const vt = slip.visaTransport;
  if (vt) {
    sectionTitle("1. Visa & transport");
    doc.setDrawColor(232, 232, 232).setFillColor(247, 247, 247);
    doc.roundedRect(M, y - 5, W - 2 * M, 12, 2, 2, "FD");
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
    doc.text(`Umrah visa & transport:  ${money(vt.rate, slip.currency)} x ${vt.people} ${vt.people === 1 ? "guest" : "guests"}`, M + 4, y + 2.5);
    doc.setFont("helvetica", "bold").text(money(vt.total, slip.currency), W - M - 4, y + 2.5, { align: "right" });
    y += 17;
    sectionTitle("2. Accommodation");
  }

  // Table
  const cols = { n: M, hotel: M + 8, dates: M + 78, nights: M + 122, rooms: M + 136, sub: W - M };
  const header = () => {
    doc.setFillColor(...BLACK);
    doc.rect(M, y - 5, W - 2 * M, 8, "F");
    doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(9);
    doc.text("#", cols.n + 1, y);
    doc.text("Hotel / room", cols.hotel, y);
    doc.text("Dates", cols.dates, y);
    doc.text("Nights", cols.nights, y);
    doc.text("Rooms", cols.rooms, y);
    doc.text("Subtotal", cols.sub - 1, y, { align: "right" });
    y += 8;
    doc.setTextColor(...INK);
  };
  header();

  slip.legs.forEach((leg, i) => {
    const hotelLines = doc.setFont("helvetica", "bold").setFontSize(10).splitTextToSize(`${leg.hotelName} (${leg.starRating} star)`, 66) as string[];
    const rowH = hotelLines.length * 4.6 + 11;
    ensureSpace(rowH);
    if (y === 20) header();

    doc.setFont("helvetica", "bold").setFontSize(10).text(String(i + 1), cols.n + 1, y);
    doc.text(hotelLines, cols.hotel, y);
    const textBottom = y + hotelLines.length * 4.6;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
    doc.text(`${leg.city}  ·  ${leg.roomName}`, cols.hotel, textBottom);
    doc.text(`${money(leg.rate, slip.currency)} / night / room`, cols.hotel, textBottom + 4.4);

    doc.setTextColor(...INK).setFontSize(9);
    doc.text([formatStayDate(leg.checkIn), `to ${formatStayDate(leg.checkOut)}`], cols.dates, y);
    doc.setFontSize(10);
    doc.text(String(leg.nights), cols.nights + 4, y, { align: "center" });
    doc.text(String(leg.rooms), cols.rooms + 4, y, { align: "center" });
    doc.setFont("helvetica", "bold").text(money(leg.subtotal, slip.currency), cols.sub - 1, y, { align: "right" });

    y += rowH;
    doc.setDrawColor(232, 232, 232).line(M, y - 5, W - M, y - 5);
  });

  // Guests sharing a bed (infants, children without a bed) aren't charged for accommodation.
  const note = bedNote(slip.guests);
  if (note) {
    ensureSpace(8);
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...GOLD_DARK);
    doc.text(note, M + 4, y);
    y += 7;
  }

  // Totals
  ensureSpace(vt ? 52 : 30);
  y += 2;
  if (vt) {
    doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(10);
    doc.text(`Accommodation total  (${slip.totalNights} ${slip.totalNights === 1 ? "night" : "nights"})`, M + 4, y);
    doc.text(money(slip.accommodationTotal, slip.currency), W - M - 4, y, { align: "right" });
    y += 8;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
    doc.text("Visa & transport", M + 4, y);
    doc.text(money(vt.total, slip.currency), W - M - 4, y, { align: "right" });
    y += 5;
    doc.text("Accommodation", M + 4, y);
    doc.text(money(slip.accommodationTotal, slip.currency), W - M - 4, y, { align: "right" });
    y += 9;
  }
  doc.setFillColor(...GOLD);
  doc.roundedRect(M, y - 6, W - 2 * M, 14, 2, 2, "F");
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(12);
  doc.text(vt ? "Grand total" : `Estimated total  (${slip.totalNights} ${slip.totalNights === 1 ? "night" : "nights"})`, M + 4, y + 3);
  doc.setFontSize(14).text(money(slip.total, slip.currency), W - M - 4, y + 3, { align: "right" });
  y += 20;

  // Disclaimer
  doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(DISCLAIMER, W - 2 * M) as string[], M, y);

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...GOLD).line(M, H - 16, W - M, H - 16);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
    doc.text(`${SITE.legalName}  ·  ${CONTACT.phoneDisplay}  ·  ${CONTACT.email}`, M, H - 11);
    doc.text(`${slip.reference}  ·  Page ${p} of ${pages}`, W - M, H - 11, { align: "right" });
  }

  return doc.output("blob");
}
