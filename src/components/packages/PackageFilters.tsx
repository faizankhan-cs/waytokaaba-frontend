"use client";

import { CheckboxGroup, ClearFilters, FilterGroup, FilterPanel, OptionList, PriceRange, SearchBox } from "@/components/search/FilterControls";
import { PACKAGE_TYPES } from "@/lib/types";

const DURATIONS = [
  { label: "Any duration", updates: { minDays: null, maxDays: null } },
  { label: "Up to 7 days", updates: { minDays: null, maxDays: "7" } },
  { label: "8 – 14 days", updates: { minDays: "8", maxDays: "14" } },
  { label: "15 – 21 days", updates: { minDays: "15", maxDays: "21" } },
  { label: "22 days or more", updates: { minDays: "22", maxDays: null } },
];

export function PackageFilters() {
  return (
    <FilterPanel>
      <FilterGroup title="Package name">
        <SearchBox placeholder="Search packages" />
      </FilterGroup>

      <FilterGroup title="Package type">
        <CheckboxGroup param="type" options={PACKAGE_TYPES.map((t) => ({ value: t, label: t }))} />
      </FilterGroup>

      <FilterGroup title="Duration">
        <OptionList
          options={DURATIONS}
          isSelected={(sp, u) => (sp.get("minDays") ?? null) === u.minDays && (sp.get("maxDays") ?? null) === u.maxDays}
        />
      </FilterGroup>

      <FilterGroup title="Price per person">
        <PriceRange />
      </FilterGroup>

      <ClearFilters />
    </FilterPanel>
  );
}
