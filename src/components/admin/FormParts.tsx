"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import type { FormState } from "@/app/admin/actions";

export function SubmitButton({ children, className = "btn-primary" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.success)
    return (
      <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> {state.success}
      </p>
    );
  if (state.message)
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        <p>{state.message}</p>
        {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-xs">
            {Object.entries(state.fieldErrors).map(([k, v]) => (
              <li key={k}>
                <span className="font-semibold">{k}</span>: {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  return null;
}

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextField({ name, label, error, hint, className = "", id, ...rest }: FieldProps) {
  const fieldId = id ?? name;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="label">{label}</label>
      <input id={fieldId} name={name} className="input" aria-invalid={error ? true : undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  error,
  hint,
  className = "",
  ...rest
}: { name: string; label: string; error?: string; hint?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <textarea id={name} name={name} className="input" aria-invalid={error ? true : undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  error,
  className = "",
  ...rest
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} className="input" aria-invalid={error ? true : undefined} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-brand-700" />
      {label}
    </label>
  );
}

/** Delete button that asks for confirmation and shows API errors (e.g. 409 conflicts). */
export function DeleteForm({
  action,
  fields,
  label = "Delete",
  confirmText,
  compact = false,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  fields: Record<string, string | number>;
  label?: string;
  confirmText: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton className={compact ? "btn-ghost px-2 text-red-600 hover:bg-red-50" : "btn-danger"}>
        <Trash2 className="h-4 w-4" aria-hidden />
        <span className={compact ? "sr-only" : ""}>{label}</span>
      </SubmitButton>
      {state.message && <p className="mt-2 max-w-sm text-xs text-red-600" role="alert">{state.message}</p>}
    </form>
  );
}
