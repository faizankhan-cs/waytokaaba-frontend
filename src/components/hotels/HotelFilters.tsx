"use client";

import { StarRating } from "@/components/ui/primitives";
import { CheckboxGroup, ClearFilters, FilterGroup, FilterPanel, OptionList, PriceRange, SearchBox, SelectParam } from "@/components/search/FilterControls";

const GUEST_OPTIONS = [
  { value: "", label: "Any room size" },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+ guest${n > 1 ? "s" : ""}` })),
];

export function HotelFilters({ showCity }: { showCity: boolean }) {
  return (
    <FilterPanel>
      <FilterGroup title="Hotel name">
        <SearchBox placeholder="Search by hotel name" />
      </FilterGroup>

      {showCity && (
        <FilterGroup title="City">
          <OptionList
            options={[
              { label: "All cities", updates: { city: null } },
              { label: "Makkah", updates: { city: "Makkah" } },
              { label: "Madinah", updates: { city: "Madinah" } },
            ]}
            isSelected={(sp, u) => (sp.get("city") ?? null) === u.city}
          />
        </FilterGroup>
      )}

      <FilterGroup title="Price per night">
        <PriceRange />
      </FilterGroup>

      <FilterGroup title="Star rating">
        <CheckboxGroup
          param="stars"
          options={[5, 4, 3].map((s) => ({
            value: String(s),
            label: (
              <span className="flex items-center gap-2">
                <StarRating rating={s} /> <span>{s} stars</span>
              </span>
            ),
          }))}
        />
      </FilterGroup>

      <FilterGroup title="Guests per room">
        <SelectParam param="guests" label="Guests per room" options={GUEST_OPTIONS} />
      </FilterGroup>

      <ClearFilters keep={["checkIn", "checkOut"]} />
    </FilterPanel>
  );
}
