"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { fieldLabel } from "@/lib/field-labels";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
};

/** Styled modal on top of the native <dialog> (focus trap, Escape and backdrop-click close). */
export function Modal({ open, onClose, title, icon, children, actions }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first button; move focus to the main action when one is marked.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Close on a backdrop click only when the press also started on the backdrop. A click that began
      // elsewhere (e.g. the one that opened this dialog by leaving a field) must not close it straight away.
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        if (e.target === ref.current && pressedBackdrop.current) onClose();
        pressedBackdrop.current = false;
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-ink-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {icon}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
            <div className="mt-2 text-sm text-ink-700">{children}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>
      </div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      icon={
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>
      }
      actions={
        <>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-danger" onClick={onConfirm} autoFocus data-autofocus>{confirmLabel}</button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

/**
 * Error / warning popup. `details` lists problems per field ({ fieldName: message }); field names are shown with
 * friendly labels. `labels` can name fields that aren't in the shared list (e.g. "Stay 2 · Madinah").
 */
export function ErrorDialog({
  open,
  onClose,
  variant = "error",
  title,
  message,
  details,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  /** "warning" = the action isn't allowed (friendly notice); "error" = something failed. */
  variant?: "error" | "warning";
  title?: string;
  message?: string;
  details?: Record<string, string>;
  labels?: Record<string, string>;
}) {
  const entries = Object.entries(details ?? {});
  const warning = variant === "warning";
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (warning ? "Can't do that yet" : entries.length > 0 ? "Please check these details" : "Something went wrong")}
      icon={
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            warning ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
          }`}
        >
          {warning ? <AlertTriangle className="h-5 w-5" aria-hidden /> : <XCircle className="h-5 w-5" aria-hidden />}
        </span>
      }
      actions={<button type="button" className="btn-primary" onClick={onClose} autoFocus data-autofocus>OK</button>}
    >
      {message && <p>{message}</p>}
      {entries.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Problems">
          {entries.map(([k, v]) => (
            <li key={k} className="flex gap-2.5 rounded-lg bg-red-50 px-3 py-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
              <span>
                <span className="block text-xs font-semibold tracking-wide text-red-700 uppercase">{labels?.[k] ?? fieldLabel(k)}</span>
                <span className="text-ink-900">{v}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
