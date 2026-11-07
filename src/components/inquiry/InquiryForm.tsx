"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONTACT, getApiBaseUrl } from "@/lib/config";
import type { InquiryType, ProblemDetails } from "@/lib/types";

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success" } | { kind: "error"; message: string };

interface Props {
  inquiryType: InquiryType;
  packageId?: number;
  hotelId?: number;
  /** What the inquiry is about, shown to the user, e.g. the hotel name. */
  subject?: string;
  showDates?: boolean;
  defaults?: { checkIn?: string; checkOut?: string; guests?: string };
  roomOptions?: string[];
  title?: string;
}

const FIELD_ORDER = ["customerName", "email", "phone", "checkIn", "checkOut", "guests", "message"] as const;

export function InquiryForm({
  inquiryType,
  packageId,
  hotelId,
  subject,
  showDates = false,
  defaults,
  roomOptions,
  title = "Send an Inquiry",
}: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const str = (k: string) => (data.get(k)?.toString().trim() ?? "") || undefined;

    const room = str("room");
    const message = [room ? `Preferred room: ${room}` : null, str("message")].filter(Boolean).join("\n");

    const payload = {
      customerName: str("customerName") ?? "",
      email: str("email") ?? "",
      phone: str("phone") ?? "",
      inquiryType,
      packageId,
      hotelId,
      checkIn: str("checkIn"),
      checkOut: str("checkOut"),
      guests: str("guests") ? Number(str("guests")) : undefined,
      message,
      website: str("website"), // honeypot
    };

    // Basic client-side checks for instant feedback; the API validates everything again.
    const clientErrors: Record<string, string> = {};
    if (!payload.customerName) clientErrors.customerName = "Please enter your full name.";
    if (!payload.email) clientErrors.email = "Please enter your email address.";
    if (!payload.phone) clientErrors.phone = "Please enter your phone number.";
    if ((str("message") ?? "").length < 10) clientErrors.message = "Please write a short message (at least 10 characters).";
    if (payload.checkIn && payload.checkOut && payload.checkOut <= payload.checkIn) clientErrors.checkOut = "Check-out must be after check-in.";
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setStatus({ kind: "error", message: "Please check the highlighted fields." });
      focusFirstError(form, clientErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({ kind: "success" });
        form.reset();
        return;
      }

      if (res.status === 400) {
        const problem = (await res.json().catch(() => null)) as ProblemDetails | null;
        const fieldErrors = Object.fromEntries(Object.entries(problem?.errors ?? {}).map(([k, v]) => [k, v[0]]));
        setErrors(fieldErrors);
        setStatus({ kind: "error", message: "Please check the highlighted fields." });
        focusFirstError(form, fieldErrors);
      } else if (res.status === 429) {
        setStatus({ kind: "error", message: "You've sent several inquiries in a short time. Please wait a minute and try again." });
      } else {
        setStatus({ kind: "error", message: "Something went wrong on our side. Please try again in a moment." });
      }
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach our server. Please check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="card p-6 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" aria-hidden />
        <h3 className="mt-3 font-display text-2xl text-brand-900">Thank you — inquiry received</h3>
        <p className="mt-2 text-sm text-ink-500">
          Our team will contact you shortly by phone or email{subject ? ` about ${subject}` : ""}. Please note this is an inquiry, not a confirmed booking.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5a]">
            <WhatsAppIcon className="h-4 w-4" /> Need a faster reply? WhatsApp us
          </a>
          <button type="button" className="btn-outline" onClick={() => setStatus({ kind: "idle" })}>
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="card p-5 sm:p-6" aria-labelledby="inquiry-title">
      <h2 id="inquiry-title" className="font-display text-2xl text-brand-900">
        {title}
      </h2>
      {subject && (
        <p className="mt-1 text-sm text-ink-500">
          About: <span className="font-medium text-ink-700">{subject}</span>
        </p>
      )}

      <div className="mt-5 space-y-4">
        <Field name="customerName" label="Full name" error={errors.customerName} autoComplete="name" maxLength={120} required />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field name="email" label="Email" type="email" error={errors.email} autoComplete="email" maxLength={200} required />
          <Field name="phone" label="Phone / WhatsApp" type="tel" error={errors.phone} autoComplete="tel" placeholder="+92 3XX XXXXXXX" maxLength={20} required />
        </div>

        {showDates && (
          <div className="grid grid-cols-2 gap-3">
            <Field name="checkIn" label="Check-in" type="date" error={errors.checkIn} defaultValue={defaults?.checkIn} />
            <Field name="checkOut" label="Check-out" type="date" error={errors.checkOut} defaultValue={defaults?.checkOut} />
          </div>
        )}

        <div className={`grid gap-3 ${roomOptions?.length ? "grid-cols-2" : ""}`}>
          <Field name="guests" label="Guests" type="number" min={1} max={50} error={errors.guests} defaultValue={defaults?.guests} />
          {roomOptions && roomOptions.length > 0 && (
            <div>
              <label htmlFor="room" className="label">Preferred room</label>
              <select id="room" name="room" className="input" defaultValue="">
                <option value="">No preference</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="message" className="label">
            Message <span className="text-red-600">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1800}
            className="input"
            placeholder="Tell us your preferred dates, number of travellers and any special requirements."
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && <p id="message-error" className="field-error">{errors.message}</p>}
        </div>

        {/* Honeypot field: hidden from people, often filled by bots. */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {status.kind === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {status.message}
          </p>
        )}

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={submitting}>
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {submitting ? "Sending…" : "Send Inquiry"}
        </button>
        <p className="text-center text-xs text-ink-500">No payment required. Our team will confirm availability and pricing with you.</p>
      </div>
    </form>
  );
}

function focusFirstError(form: HTMLFormElement, errors: Record<string, string>) {
  const first = FIELD_ORDER.find((f) => errors[f]);
  if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
}

function Field({
  name,
  label,
  error,
  required,
  ...input
}: { name: string; label: string; error?: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={name}
        name={name}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required || undefined}
        {...input}
      />
      {error && <p id={`${name}-error`} className="field-error">{error}</p>}
    </div>
  );
}
