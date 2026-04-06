"use client";

import { useState } from "react";
import { PROPERTY_TYPES } from "@/lib/constants";

export type AmenityFilterOption = { id: string; slug: string; label: string };

type Props = {
  /** Open by default when URL already has filters (so users see why results narrowed). */
  defaultOpen: boolean;
  activeFilterCount: number;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  minBedrooms: string;
  minBathrooms: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  q: string;
  selectedAmenitySlugs: string[];
  amenityList: AmenityFilterOption[];
};

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h18M6 12h12M10 20h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExploreFiltersForm({
  defaultOpen,
  activeFilterCount,
  city,
  checkIn,
  checkOut,
  guests,
  minBedrooms,
  minBathrooms,
  minPrice,
  maxPrice,
  propertyType,
  q,
  selectedAmenitySlugs,
  amenityList,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = "explore-filters-panel";

  return (
    <form method="get" className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <button
          type="button"
          id="explore-filters-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-300 hover:bg-stone-100"
        >
          <FilterIcon className="text-stone-600" />
          <span>Filters</span>
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <button
          type="submit"
          className="inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Apply filters
        </button>
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby="explore-filters-trigger"
        hidden={!open}
        className="mt-6 space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Destination</label>
            <input
              name="city"
              defaultValue={city}
              placeholder="City or region"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Check-in</label>
            <input
              name="checkIn"
              type="date"
              defaultValue={checkIn}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Check-out</label>
            <input
              name="checkOut"
              type="date"
              defaultValue={checkOut}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Guests</label>
            <input
              name="guests"
              type="number"
              min={1}
              defaultValue={guests}
              placeholder="Any"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Min bedrooms</label>
            <input
              name="minBedrooms"
              type="number"
              min={0}
              defaultValue={minBedrooms}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Min bathrooms</label>
            <input
              name="minBathrooms"
              type="number"
              min={0}
              step={0.5}
              defaultValue={minBathrooms}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Property type</label>
            <select
              name="propertyType"
              defaultValue={propertyType}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            >
              <option value="">Any</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Min price / night (USD)
            </label>
            <input
              name="minPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={minPrice}
              placeholder="e.g. 1500"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
            <p className="text-[11px] text-stone-500">Whole dollars per night.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Max price / night (USD)
            </label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={maxPrice}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">Amenities</legend>
          <div className="flex flex-wrap gap-3">
            {amenityList.map((a) => {
              const checked = selectedAmenitySlugs.includes(a.slug);
              return (
                <label key={a.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={a.slug}
                    defaultChecked={checked}
                    className="rounded border-stone-300"
                  />
                  {a.label}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-500">
            Selecting multiple amenities narrows to homes that include all selected.
          </p>
        </fieldset>
        <input type="hidden" name="q" value={q} />
      </div>
    </form>
  );
}
