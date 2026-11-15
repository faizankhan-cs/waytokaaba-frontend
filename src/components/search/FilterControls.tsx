"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { ErrorDialog } from "@/components/ui/Modal";
import { useQueryParams } from "./useQueryParams";

/** Wrapper: sidebar on desktop, collapsible panel on mobile. */
export function FilterPanel({ children, title = "Filters" }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <aside aria-label={title}>
      <button
        type="button"
        className="btn-outline w-full lg:hidden"
        aria-expanded={open}
        aria-controls="filter-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        {open ? "Hide filters" : "Show filters"}
      </button>
      <div id="filter-panel" className={`${open ? "mt-4 block" : "hidden"} card p-5 lg:sticky lg:top-24 lg:mt-0 lg:block`}>
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-900">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden /> {title}
        </h2>
        <div className="space-y-6">{children}</div>
      </div>
    </aside>
  );
}

export function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-sand-200 pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 text-sm font-semibold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Text search box that applies on submit. */
export function SearchBox({ placeholder, param = "q" }: { placeholder: string; param?: string }) {
  const { searchParams, update } = useQueryParams();
  const current = searchParams.get(param) ?? "";
  const [value, setValue] = useState(current);
  const [lastCurrent, setLastCurrent] = useState(current);
  if (current !== lastCurrent) {
    setLastCurrent(current);
    setValue(current);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    update({ [param]: value.trim() || null });
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2">
      <label htmlFor={`search-${param}`} className="sr-only">
        {placeholder}
      </label>
      <input
        id={`search-${param}`}
        type="search"
        className="input"
        placeholder={placeholder}
        value={value}
        maxLength={100}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}

/** Min/max price inputs, applied together. */
export function PriceRange({ currency = "PKR" }: { currency?: string }) {
  const { searchParams, update } = useQueryParams();
  const key = `${searchParams.get("minPrice") ?? ""}|${searchParams.get("maxPrice") ?? ""}`;
  return <PriceRangeForm key={key} currency={currency} initialMin={searchParams.get("minPrice") ?? ""} initialMax={searchParams.get("maxPrice") ?? ""} onApply={update} />;
}

function PriceRangeForm({
  currency,
  initialMin,
  initialMax,
  onApply,
}: {
  currency: string;
  initialMin: string;
  initialMax: string;
  onApply: (u: Record<string, string | null>) => void;
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const invalid = min !== "" && max !== "" && Number(min) > Number(max);
  const [showError, setShowError] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return setShowError(true);
        onApply({ minPrice: min || null, maxPrice: max || null });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="minPrice" className="text-xs text-ink-500">
            Min ({currency})
          </label>
          <input id="minPrice" type="number" min={0} step={500} inputMode="numeric" className="input" value={min} onChange={(e) => setMin(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label htmlFor="maxPrice" className="text-xs text-ink-500">
            Max ({currency})
          </label>
          <input id="maxPrice" type="number" min={0} step={500} inputMode="numeric" className="input" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Any" aria-invalid={invalid || undefined} />
        </div>
      </div>
      <button type="submit" className="btn-outline mt-3 w-full py-2">
        Apply price
      </button>
      <ErrorDialog
        open={showError}
        title="Please check the price range"
        message="The max price can't be lower than the min price."
        onClose={() => {
          setShowError(false);
          setTimeout(() => document.getElementById("maxPrice")?.focus(), 50);
        }}
      />
    </form>
  );
}

/** Multi-select checkboxes bound to a repeated query param (e.g. stars=4&stars=5). */
export function CheckboxGroup({ param, options }: { param: string; options: { value: string; label: ReactNode }[] }) {
  const { searchParams, update } = useQueryParams();
  const selected = searchParams.getAll(param);

  function toggle(value: string) {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    update({ [param]: next });
  }

  return (
    <ul className="space-y-2">
      {options.map((o) => (
        <li key={o.value}>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand-200 accent-brand-700"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
            />
            {o.label}
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Single-select (radio-like) options bound to one or more params. */
export function OptionList({
  options,
  isSelected,
}: {
  options: { label: string; updates: Record<string, string | null> }[];
  isSelected: (searchParams: URLSearchParams, updates: Record<string, string | null>) => boolean;
}) {
  const { searchParams, update } = useQueryParams();
  return (
    <ul className="space-y-1">
      {options.map((o) => {
        const active = isSelected(new URLSearchParams(searchParams.toString()), o.updates);
        return (
          <li key={o.label}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => update(o.updates)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-sand-100 aria-pressed:bg-brand-50 aria-pressed:font-semibold aria-pressed:text-brand-800"
            >
              {o.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function SelectParam({
  param,
  label,
  options,
}: {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const { searchParams, update } = useQueryParams();
  return (
    <div>
      <label htmlFor={`select-${param}`} className="sr-only">
        {label}
      </label>
      <select
        id={`select-${param}`}
        className="input"
        value={searchParams.get(param) ?? ""}
        onChange={(e) => update({ [param]: e.target.value || null })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SortSelect({ options }: { options: { value: string; label: string }[] }) {
  const { searchParams, update, isPending } = useQueryParams();
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-ink-500" aria-hidden />
      <label htmlFor="sort" className="text-sm text-ink-500">
        Sort by
      </label>
      <select
        id="sort"
        className="input w-auto py-2"
        value={searchParams.get("sort") ?? "recommended"}
        onChange={(e) => update({ sort: e.target.value === "recommended" ? null : e.target.value })}
        aria-busy={isPending}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ClearFilters({ keep = [] }: { keep?: string[] }) {
  const { searchParams, pathname } = useQueryParams();
  const next = new URLSearchParams();
  keep.forEach((k) => searchParams.getAll(k).forEach((v) => next.append(k, v)));
  const qs = next.toString();
  return (
    <Link href={qs ? `${pathname}?${qs}` : pathname} className="btn-ghost w-full py-2 text-brand-700" scroll={false}>
      Clear all filters
    </Link>
  );
}
