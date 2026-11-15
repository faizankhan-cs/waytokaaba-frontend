"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BedDouble, Check, Copy, Download, Plus, RotateCcw, Send, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT } from "@/lib/config";
import { formatPrice, pluralize } from "@/lib/format";
import {
  DISCLAIMER,
  buildSlip,
  buildWhatsAppText,
  findHotel,
  findRoom,
  formatStayDate,
  bedNote,
  guestSummary,
  legNights,
  legIssue,
  legProblem,
  legTotal,
  roomShortage,
  slipReference,
  tripCurrency,
  tripNights,
  tripTotal,
  totalGuests,
  visaTransportFor,
  type Guests,
  type PlannerHotel,
  type Slip,
  type TripCustomer,
} from "@/lib/trip";
import { buildSlipPdf } from "@/lib/trip-pdf";
import { ErrorDialog } from "@/components/ui/Modal";
import { LegCard, legFieldId } from "./LegCard";
import { RoomShortageDialog } from "./RoomShortageDialog";
import { useTrip } from "./useTrip";

/** "Children without a bed and infants share with an adult — no accommodation charge", when it applies. */
function BedNote({ guests }: { guests: Guests }) {
  const note = bedNote(guests);
  if (!note) return null;
  return (
    <p className="mt-2 flex items-start gap-2 rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700" data-testid="bed-note">
      <BedDouble className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{note}</span>
    </p>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function TripPlanner({ hotels, visaTransportRate }: { hotels: PlannerHotel[]; visaTransportRate: number | null }) {
  const { legs, guests, visaTransport, add, remove, move, patch, setGuests, setVisaTransport, reset } = useTrip(hotels);
  const [showProblems, setShowProblems] = useState(false);
  const [slipOpen, setSlipOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [customer, setCustomer] = useState<TripCustomer>({ name: "", phone: "" });
  const [pdf, setPdf] = useState<{ slip: Slip; blob: Blob } | null>(null);
  const [copied, setCopied] = useState(false);
  const slipRef = useRef<HTMLElement>(null);
  // The stay whose rooms can't fit the guests (shown in the "Not enough rooms" popup).
  const [shortageLegId, setShortageLegId] = useState<string | null>(null);
  // "Finish your stays" popup: what is still missing in each stay.
  const [stayProblemsOpen, setStayProblemsOpen] = useState(false);
  const stayIssues = legs.flatMap((leg, i) => {
    const issue = legIssue(leg, hotels, guests);
    return issue ? [{ key: `stay-${i}`, index: i, label: `Stay ${i + 1} · ${leg.city}`, ...issue }] : [];
  });
  const shortageIndex = legs.findIndex((l) => l.id === shortageLegId);
  const shortageLeg = shortageIndex >= 0 ? legs[shortageIndex] : undefined;
  // Computed live, so the popup closes by itself once the rooms are fixed.
  const shortage = shortageLeg ? roomShortage(shortageLeg, hotels, guests) : null;

  const allValid = legs.every((leg) => legProblem(leg, hotels, guests) === null);
  const accommodation = tripTotal(legs, hotels);
  // Offered only when the admin has set a price.
  const offerVisaTransport = visaTransportRate !== null && visaTransportRate > 0;
  // A plain number (not an object) so the slip memo below stays stable between renders.
  const addOnRate = visaTransport && offerVisaTransport ? visaTransportRate : null;
  const addOn = visaTransportFor(guests, addOnRate);
  const total = accommodation + (addOn?.total ?? 0);
  const nights = tripNights(legs);
  const currency = tripCurrency(legs, hotels);

  // The slip is derived live, so editing a stay while it is open keeps the slip and PDF in sync.
  const slip = useMemo(
    () => (slipOpen && allValid ? buildSlip(legs, hotels, guests, addOnRate, customer, reference) : null),
    [slipOpen, allValid, legs, hotels, guests, addOnRate, customer, reference],
  );

  // Build the PDF ahead of the click: browsers only allow sharing/opening WhatsApp straight from a user tap.
  useEffect(() => {
    if (!slip) return;
    let cancelled = false;
    buildSlipPdf(slip)
      .then((blob) => !cancelled && setPdf({ slip, blob }))
      .catch(() => !cancelled && setPdf(null));
    return () => {
      cancelled = true;
    };
  }, [slip]);

  const pdfReady = slip !== null && pdf?.slip === slip ? pdf.blob : null;
  const fileName = `${slip?.reference ?? "WTK-trip"}.pdf`;

  function generateSlip() {
    setShowProblems(true);
    if (!allValid) {
      // If the first stay with a problem is short of rooms, explain it in the popup.
      const firstInvalid = legs.find((leg) => legProblem(leg, hotels, guests) !== null);
      if (firstInvalid && roomShortage(firstInvalid, hotels, guests)) setShortageLegId(firstInvalid.id);
      // Anything else is listed per stay in the "Finish your stays" popup.
      else setStayProblemsOpen(true);
      return;
    }
    if (!slipOpen) setReference(slipReference());
    setSlipOpen(true);
    requestAnimationFrame(() => slipRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function openWhatsApp(base: string, text: string) {
    window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function shareOnWhatsApp() {
    if (!slip || !pdfReady) return;
    const text = buildWhatsAppText(slip);
    const file = new File([pdfReady], fileName, { type: "application/pdf" });

    // On phones the share sheet attaches the PDF and lets the customer pick any chat or group.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Way To Kaaba trip estimate", text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    // Desktop / unsupported: save the PDF, then open WhatsApp's own chat-and-group picker with the text ready.
    downloadBlob(pdfReady, fileName);
    openWhatsApp("https://wa.me/", text);
  }

  async function copyMessage() {
    if (!slip) return;
    try {
      await navigator.clipboard.writeText(buildWhatsAppText(slip));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="pb-4">
      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-ink-500">
            Choose your guests in the first stay, then add each hotel stay in order, for example <strong>Makkah → Madinah → Makkah</strong>.
            Pick a room type and your dates; rooms are worked out from your guests and the total updates as you go.
          </p>
          <button type="button" className="btn-ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>

        <ol className="mt-6 grid gap-5">
          {legs.map((leg, i) => (
            <LegCard
              key={leg.id}
              leg={leg}
              index={i}
              hotels={hotels}
              guests={guests}
              onGuestsChange={setGuests}
              showProblem={showProblems}
              isFirst={i === 0}
              isLast={i === legs.length - 1}
              canRemove={legs.length > 1}
              onPatch={(p) => patch(leg.id, p)}
              onMove={(dir) => move(leg.id, dir)}
              onRemove={() => remove(leg.id)}
              onRoomShortage={() => setShortageLegId(leg.id)}
            />
          ))}
        </ol>

        <ErrorDialog
          open={stayProblemsOpen && stayIssues.length > 0}
          title="Finish your stays first"
          message="A few details are missing before we can make your slip:"
          details={Object.fromEntries(stayIssues.map((x) => [x.key, x.message]))}
          labels={Object.fromEntries(stayIssues.map((x) => [x.key, x.label]))}
          onClose={() => {
            const first = stayIssues[0];
            setStayProblemsOpen(false);
            // Take the customer straight to the first thing to fix.
            if (first)
              setTimeout(() => {
                const el = document.getElementById(legFieldId(first.index, first.field));
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus({ preventScroll: true });
              }, 50);
          }}
        />

        <RoomShortageDialog
          shortage={shortage}
          currentRooms={shortageLeg?.rooms ?? NaN}
          sharesBed={guests.infants + guests.childrenNoBed > 0}
          onUseRooms={(rooms) => shortageLeg && patch(shortageLeg.id, { rooms })}
          onPickRoom={() => {
            const index = shortageIndex;
            setShortageLegId(null);
            // After the dialog has closed and handed focus back, move it to that stay's room type.
            setTimeout(() => {
              const select = document.getElementById(`leg-${index}-room`);
              select?.scrollIntoView({ behavior: "smooth", block: "center" });
              select?.focus({ preventScroll: true });
            }, 50);
          }}
          onClose={() => setShortageLegId(null)}
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-outline" onClick={() => add("Makkah")}>
            <Plus className="h-4 w-4" /> Add Makkah stay
          </button>
          <button type="button" className="btn-outline" onClick={() => add("Madinah")}>
            <Plus className="h-4 w-4" /> Add Madinah stay
          </button>
        </div>

        {offerVisaTransport && (
          <section aria-labelledby="extras-heading" className="card mt-8 p-5 sm:p-6">
            <h2 id="extras-heading" className="font-display text-xl text-brand-900">Visa &amp; transport</h2>
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-sand-200 p-4 has-checked:border-gold-500 has-checked:bg-gold-50">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-brand-900"
                checked={visaTransport}
                onChange={(e) => setVisaTransport(e.target.checked)}
              />
              <span>
                <span className="block font-semibold text-ink-900">
                  Add Visa &amp; transport — {formatPrice(visaTransportRate, currency)} per person
                </span>
                <span className="block text-sm text-ink-500">
                  Umrah visa and transport for every guest, infants included ({pluralize(totalGuests(guests), "guest")}).
                </span>
              </span>
            </label>

            {addOn && (
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-gold-700 uppercase">1. Visa &amp; transport</h3>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-sand-50 px-4 py-3 text-sm">
                    <span className="text-ink-700">
                      {formatPrice(addOn.rate, currency)} × {pluralize(addOn.people, "guest")}{" "}
                      <span className="text-ink-500">· {guestSummary(guests)}</span>
                    </span>
                    <span className="font-semibold text-ink-900" data-testid="visa-transport-total">{formatPrice(addOn.total, currency)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-gold-700 uppercase">2. Accommodation</h3>
                  <ul className="mt-2 divide-y divide-sand-200 rounded-lg bg-sand-50 text-sm">
                    {legs.map((leg, i) => {
                      const hotel = findHotel(hotels, leg.hotelId);
                      const room = findRoom(hotel, leg.roomId);
                      const n = legNights(leg);
                      const sub = legTotal(leg, hotels);
                      return (
                        <li key={leg.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                          <span className="text-ink-700">
                            <span className="font-semibold text-ink-900">{i + 1}. {leg.city}</span>
                            {hotel && room && n > 0 && Number.isFinite(leg.rooms)
                              ? ` — ${hotel.name}: ${formatPrice(room.pricePerNight, currency)} × ${pluralize(n, "night")} × ${pluralize(leg.rooms, "room")}`
                              : " — not complete yet"}
                          </span>
                          <span className="font-semibold text-ink-900">{sub > 0 ? formatPrice(sub, currency) : "—"}</span>
                        </li>
                      );
                    })}
                    <li className="flex items-baseline justify-between gap-2 px-4 py-3 font-semibold">
                      <span className="text-ink-900">Accommodation total · {pluralize(nights, "night")}</span>
                      <span className="text-ink-900" data-testid="accommodation-total">{accommodation > 0 ? formatPrice(accommodation, currency) : "—"}</span>
                    </li>
                  </ul>
                  <BedNote guests={guests} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-gold-700 uppercase">3. Grand total</h3>
                  <div className="mt-2 rounded-lg bg-brand-950 px-4 py-3 text-sm text-white">
                    <p className="flex flex-wrap justify-between gap-2 text-brand-200">
                      <span>Visa &amp; transport + accommodation</span>
                      <span>
                        {formatPrice(addOn.total, currency)} + {accommodation > 0 ? formatPrice(accommodation, currency) : "—"}
                      </span>
                    </p>
                    <p className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="font-semibold">Grand total</span>
                      <span className="font-display text-2xl text-gold-400" data-testid="grand-total">{formatPrice(total, currency)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {slipOpen && (
          <section ref={slipRef} aria-labelledby="slip-heading" className="card mt-10 scroll-mt-24 p-5 sm:p-8">
            <h2 id="slip-heading" className="font-display text-2xl text-brand-900">Your trip slip</h2>

            {slip ? (
              <>
                <p className="mt-1 text-sm text-ink-500">
                  Reference <strong className="text-ink-900">{slip.reference}</strong> · {guestSummary(slip.guests)}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="slip-name" className="label">Your name (optional)</label>
                    <input
                      id="slip-name"
                      className="input"
                      maxLength={80}
                      autoComplete="name"
                      value={customer.name}
                      onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="slip-phone" className="label">Phone / WhatsApp (optional)</label>
                    <input
                      id="slip-phone"
                      type="tel"
                      className="input"
                      maxLength={20}
                      autoComplete="tel"
                      placeholder="+92 3XX XXXXXXX"
                      value={customer.phone}
                      onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <ul className="mt-6 divide-y divide-sand-200 rounded-xl border border-sand-200">
                  {slip.visaTransport && (
                    <>
                      <li className="bg-sand-50 px-4 py-2 text-xs font-semibold tracking-wide text-gold-700 uppercase">1. Visa &amp; transport</li>
                      <li className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
                        <div>
                          <p className="font-semibold text-brand-900">Visa &amp; transport</p>
                          <p className="text-xs text-ink-500">
                            {formatPrice(slip.visaTransport.rate, slip.currency)} × {pluralize(slip.visaTransport.people, "guest")}
                          </p>
                        </div>
                        <p className="font-semibold text-ink-900 sm:text-right">{formatPrice(slip.visaTransport.total, slip.currency)}</p>
                      </li>
                      <li className="bg-sand-50 px-4 py-2 text-xs font-semibold tracking-wide text-gold-700 uppercase">2. Accommodation</li>
                    </>
                  )}
                  {slip.legs.map((leg, i) => (
                    <li key={i} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="font-semibold text-brand-900">
                          {i + 1}. {leg.city} — {leg.hotelName} <span className="text-gold-600">{"★".repeat(leg.starRating)}</span>
                        </p>
                        <p className="text-sm text-ink-500">
                          {leg.roomName} × {pluralize(leg.rooms, "room")} · {formatStayDate(leg.checkIn)} → {formatStayDate(leg.checkOut)} ·{" "}
                          {pluralize(leg.nights, "night")}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatPrice(leg.rate, slip.currency)} × {leg.nights} × {leg.rooms}
                        </p>
                      </div>
                      <p className="font-semibold text-ink-900 sm:text-right">{formatPrice(leg.subtotal, slip.currency)}</p>
                    </li>
                  ))}
                  {slip.visaTransport && (
                    <li className="flex items-center justify-between gap-3 p-4">
                      <span className="font-semibold text-brand-900">Accommodation total · {pluralize(slip.totalNights, "night")}</span>
                      <span className="font-semibold text-ink-900">{formatPrice(slip.accommodationTotal, slip.currency)}</span>
                    </li>
                  )}
                  <li className="flex items-center justify-between gap-3 bg-gold-100 p-4">
                    <span className="font-semibold text-brand-900">
                      {slip.visaTransport ? "Grand total" : `Estimated total · ${pluralize(slip.totalNights, "night")}`}
                    </span>
                    <span className="font-display text-xl text-brand-900">{formatPrice(slip.total, slip.currency)}</span>
                  </li>
                </ul>
                <BedNote guests={slip.guests} />
                <p className="mt-3 text-xs text-ink-500">{DISCLAIMER}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    className="btn bg-[#25D366] text-white hover:bg-[#1ebe5a]"
                    disabled={!pdfReady}
                    onClick={shareOnWhatsApp}
                  >
                    {pdfReady ? <Share2 className="h-4 w-4" /> : null}
                    {pdfReady ? "Share on WhatsApp" : "Preparing PDF…"}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => openWhatsApp(`https://wa.me/${CONTACT.phoneE164.replace(/\D/g, "")}`, buildWhatsAppText(slip))}
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Send to Way To Kaaba
                  </button>
                  <button type="button" className="btn-outline" disabled={!pdfReady} onClick={() => pdfReady && downloadBlob(pdfReady, fileName)}>
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                  <button type="button" className="btn-ghost border border-sand-200" onClick={copyMessage}>
                    {copied ? <Check className="h-4 w-4 text-brand-700" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy message"}
                  </button>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs text-ink-500">
                  <Send className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>Share on WhatsApp</strong> opens WhatsApp so you can choose any contact or group. On a phone the PDF is attached; on a
                    computer it is downloaded and the message opens ready to send, so attach the PDF if you like.
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Finish the stays above and press <strong>Update slip</strong> to see your slip again.</p>
            )}
          </section>
        )}
      </div>

      {/* Sticky total. Right padding keeps it clear of the floating WhatsApp chat button. */}
      <div className="sticky bottom-0 z-20 border-t border-sand-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-3 py-3 pr-20 sm:pr-64">
          <div>
            <p className="text-xs text-ink-500">
              {pluralize(legs.length, "stay")} · {pluralize(nights, "night")} · {pluralize(totalGuests(guests), "guest")}
              {addOn ? " · incl. visa & transport" : ""}
            </p>
            <p className="font-display text-2xl leading-tight text-brand-900" aria-live="polite">
              {total > 0 ? formatPrice(total, currency) : "—"}
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={generateSlip}>
            {slipOpen ? "Update slip" : "Generate slip"}
          </button>
        </div>
      </div>
    </div>
  );
}
