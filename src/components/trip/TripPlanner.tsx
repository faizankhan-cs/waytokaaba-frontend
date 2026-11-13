"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Plus, RotateCcw, Send, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT } from "@/lib/config";
import { formatPrice, pluralize } from "@/lib/format";
import {
  DISCLAIMER,
  buildSlip,
  buildWhatsAppText,
  formatStayDate,
  legProblem,
  slipReference,
  tripCurrency,
  tripNights,
  tripTotal,
  type PlannerHotel,
  type Slip,
  type TripCustomer,
} from "@/lib/trip";
import { buildSlipPdf } from "@/lib/trip-pdf";
import { LegCard } from "./LegCard";
import { useTrip } from "./useTrip";

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

export function TripPlanner({ hotels }: { hotels: PlannerHotel[] }) {
  const { legs, add, remove, move, patch, reset } = useTrip(hotels);
  const [showProblems, setShowProblems] = useState(false);
  const [slipOpen, setSlipOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [customer, setCustomer] = useState<TripCustomer>({ name: "", phone: "" });
  const [pdf, setPdf] = useState<{ slip: Slip; blob: Blob } | null>(null);
  const [copied, setCopied] = useState(false);
  const slipRef = useRef<HTMLElement>(null);

  const allValid = legs.every((leg) => legProblem(leg, hotels) === null);
  const total = tripTotal(legs, hotels);
  const nights = tripNights(legs);
  const currency = tripCurrency(legs, hotels);

  // The slip is derived live, so editing a stay while it is open keeps the slip and PDF in sync.
  const slip = useMemo(
    () => (slipOpen && allValid ? buildSlip(legs, hotels, customer, reference) : null),
    [slipOpen, allValid, legs, hotels, customer, reference],
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
    if (!allValid) return;
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
            Add each hotel stay in order, for example <strong>Makkah → Madinah → Makkah</strong>. Pick a room type, your dates and the number
            of rooms, and the total updates as you go.
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
              showProblem={showProblems}
              isFirst={i === 0}
              isLast={i === legs.length - 1}
              canRemove={legs.length > 1}
              onPatch={(p) => patch(leg.id, p)}
              onMove={(dir) => move(leg.id, dir)}
              onRemove={() => remove(leg.id)}
            />
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-outline" onClick={() => add("Makkah")}>
            <Plus className="h-4 w-4" /> Add Makkah stay
          </button>
          <button type="button" className="btn-outline" onClick={() => add("Madinah")}>
            <Plus className="h-4 w-4" /> Add Madinah stay
          </button>
        </div>

        {slipOpen && (
          <section ref={slipRef} aria-labelledby="slip-heading" className="card mt-10 scroll-mt-24 p-5 sm:p-8">
            <h2 id="slip-heading" className="font-display text-2xl text-brand-900">Your trip slip</h2>

            {slip ? (
              <>
                <p className="mt-1 text-sm text-ink-500">Reference <strong className="text-ink-900">{slip.reference}</strong></p>

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
                  <li className="flex items-center justify-between gap-3 bg-gold-100 p-4">
                    <span className="font-semibold text-brand-900">Estimated total · {pluralize(slip.totalNights, "night")}</span>
                    <span className="font-display text-xl text-brand-900">{formatPrice(slip.total, slip.currency)}</span>
                  </li>
                </ul>
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
              <p className="mt-3 text-sm text-red-600">Complete every stay above to see your slip.</p>
            )}
          </section>
        )}
      </div>

      {/* Sticky total. Right padding keeps it clear of the floating WhatsApp chat button. */}
      <div className="sticky bottom-0 z-20 border-t border-sand-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-3 py-3 pr-20 sm:pr-64">
          <div>
            <p className="text-xs text-ink-500">
              {pluralize(legs.length, "stay")} · {pluralize(nights, "night")}
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
