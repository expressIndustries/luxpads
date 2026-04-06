"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateListing, type ListingSaveState } from "@/lib/actions/listing-actions";
import {
  DRAFT_LISTING_FIELD_TEMPLATES,
  coalesceDraftTemplatesForSubmit,
} from "@/lib/listing-draft-templates";
import type { ListingEditDefaults } from "@/lib/listing-edit-types";
import { PROPERTY_TYPES, US_STATES_FULL } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ListingDeleteControls } from "@/components/dashboard/listing-delete-controls";

export type { ListingEditDefaults } from "@/lib/listing-edit-types";

const initialSave: ListingSaveState = {};

function cloneDefaults(d: ListingEditDefaults): ListingEditDefaults {
  return { ...d };
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export type AmenityOption = { id: string; slug: string; label: string };

type Props = {
  defaults: ListingEditDefaults;
  /** Raw DB values for coalescing empty “placeholder” submits back to draft templates. */
  submitFallbackDefaults: ListingEditDefaults;
  listingUpdatedAt: string;
  selectedAmenitySlugs: string[];
  allAmenities: AmenityOption[];
  deleteListingId: string;
  deleteListingTitle: string;
  deleteRedirectHref: string;
};

export function ListingEditFormClient({
  defaults,
  submitFallbackDefaults,
  listingUpdatedAt,
  selectedAmenitySlugs,
  allAmenities,
  deleteListingId,
  deleteListingTitle,
  deleteRedirectHref,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateListing, initialSave);
  const [values, setValues] = useState(() => cloneDefaults(defaults));
  const [amenitySlugs, setAmenitySlugs] = useState(() => new Set(selectedAmenitySlugs));

  useEffect(() => {
    setValues(cloneDefaults(defaults));
    setAmenitySlugs(new Set(selectedAmenitySlugs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingUpdatedAt]);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  const submitSnapshot = useMemo(
    () => coalesceDraftTemplatesForSubmit(values, submitFallbackDefaults),
    [values, submitFallbackDefaults],
  );

  function patch<K extends keyof ListingEditDefaults>(key: K, value: ListingEditDefaults[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const fe = state.fieldErrors ?? {};
  function FieldError({ name }: { name: string }) {
    const msg = fe[name];
    return msg ? <p className="text-sm text-red-600">{msg}</p> : null;
  }

  const stateInList = US_STATES_FULL.includes(
    values.state as (typeof US_STATES_FULL)[number],
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={values.id} />
        <input type="hidden" name="title" value={submitSnapshot.title} required />
        <input type="hidden" name="summary" value={submitSnapshot.summary} />
        <input type="hidden" name="description" value={submitSnapshot.description} />
        <input type="hidden" name="addressLine1" value={submitSnapshot.addressLine1} required />
        <input type="hidden" name="city" value={submitSnapshot.city} required />
        <input type="hidden" name="state" value={submitSnapshot.state} required />
        <input type="hidden" name="country" value={submitSnapshot.country} required />
        <input type="hidden" name="postalCode" value={submitSnapshot.postalCode} required />

        {Array.from(amenitySlugs).map((slug) => (
          <input key={slug} type="hidden" name="amenitySlugs" value={slug} />
        ))}

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Basics</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              placeholder={DRAFT_LISTING_FIELD_TEMPLATES.title}
              onChange={(e) => patch("title", e.target.value)}
              aria-invalid={Boolean(fe.title)}
            />
            <FieldError name="title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={values.summary}
              placeholder={DRAFT_LISTING_FIELD_TEMPLATES.summary}
              onChange={(e) => patch("summary", e.target.value)}
              aria-invalid={Boolean(fe.summary)}
            />
            <FieldError name="summary" />
            {state.warnings?.summary ? (
              <p className="text-sm text-amber-800">{state.warnings.summary}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              placeholder={DRAFT_LISTING_FIELD_TEMPLATES.description}
              onChange={(e) => patch("description", e.target.value)}
              aria-invalid={Boolean(fe.description)}
            />
            <FieldError name="description" />
            {state.warnings?.description ? (
              <p className="text-sm text-amber-800">{state.warnings.description}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type</Label>
            <select
              id="propertyType"
              name="propertyType"
              value={values.propertyType}
              onChange={(e) => patch("propertyType", e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              aria-invalid={Boolean(fe.propertyType)}
            >
              {!PROPERTY_TYPES.includes(values.propertyType as (typeof PROPERTY_TYPES)[number]) ? (
                <option value={values.propertyType}>{values.propertyType}</option>
              ) : null}
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FieldError name="propertyType" />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Location</h2>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              value={values.addressLine1}
              placeholder={DRAFT_LISTING_FIELD_TEMPLATES.addressLine1}
              onChange={(e) => patch("addressLine1", e.target.value)}
              aria-invalid={Boolean(fe.addressLine1)}
            />
            <FieldError name="addressLine1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={values.city}
                placeholder={DRAFT_LISTING_FIELD_TEMPLATES.city}
                onChange={(e) => patch("city", e.target.value)}
                aria-invalid={Boolean(fe.city)}
              />
              <FieldError name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={values.state}
                onChange={(e) => patch("state", e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
                aria-invalid={Boolean(fe.state)}
              >
                <option value="">Select state</option>
                {!stateInList && values.state ? (
                  <option value={values.state}>{values.state}</option>
                ) : null}
                {US_STATES_FULL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError name="state" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={values.country}
                placeholder={DRAFT_LISTING_FIELD_TEMPLATES.country}
                onChange={(e) => patch("country", e.target.value)}
                aria-invalid={Boolean(fe.country)}
              />
              <FieldError name="country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                value={values.postalCode}
                placeholder={DRAFT_LISTING_FIELD_TEMPLATES.postalCode}
                onChange={(e) => patch("postalCode", e.target.value)}
                aria-invalid={Boolean(fe.postalCode)}
              />
              <FieldError name="postalCode" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input
                id="latitude"
                name="latitude"
                value={values.latitude}
                onChange={(e) => patch("latitude", e.target.value)}
                aria-invalid={Boolean(fe.latitude)}
              />
              <FieldError name="latitude" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input
                id="longitude"
                name="longitude"
                value={values.longitude}
                onChange={(e) => patch("longitude", e.target.value)}
                aria-invalid={Boolean(fe.longitude)}
              />
              <FieldError name="longitude" />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Capacity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max guests</Label>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                required
                value={values.maxGuests}
                onChange={(e) => patch("maxGuests", Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(fe.maxGuests)}
              />
              <FieldError name="maxGuests" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                required
                value={values.bedrooms}
                onChange={(e) => patch("bedrooms", Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(fe.bedrooms)}
              />
              <FieldError name="bedrooms" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                required
                value={values.bathrooms}
                onChange={(e) => patch("bathrooms", Number.parseFloat(e.target.value) || 0)}
                aria-invalid={Boolean(fe.bathrooms)}
              />
              <FieldError name="bathrooms" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds">Beds</Label>
              <Input
                id="beds"
                name="beds"
                type="number"
                required
                value={values.beds}
                onChange={(e) => patch("beds", Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(fe.beds)}
              />
              <FieldError name="beds" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleepingArrangements">Sleeping arrangements</Label>
            <Textarea
              id="sleepingArrangements"
              name="sleepingArrangements"
              value={values.sleepingArrangements}
              onChange={(e) => patch("sleepingArrangements", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Policies & rates</h2>
          <div className="space-y-2">
            <Label htmlFor="houseRules">House rules</Label>
            <Textarea
              id="houseRules"
              name="houseRules"
              value={values.houseRules}
              onChange={(e) => patch("houseRules", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkInOut">Check-in / check-out</Label>
            <Textarea
              id="checkInOut"
              name="checkInOut"
              value={values.checkInOut}
              onChange={(e) => patch("checkInOut", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation policy</Label>
            <Textarea
              id="cancellationPolicy"
              name="cancellationPolicy"
              value={values.cancellationPolicy}
              onChange={(e) => patch("cancellationPolicy", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nightlyRateDollars">Nightly rate (USD)</Label>
              <Input
                id="nightlyRateDollars"
                name="nightlyRateDollars"
                type="number"
                step="1"
                required
                value={values.nightlyRateDollars}
                onChange={(e) => patch("nightlyRateDollars", Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(fe.nightlyRateDollars)}
              />
              <FieldError name="nightlyRateDollars" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minNights">Minimum nights</Label>
              <Input
                id="minNights"
                name="minNights"
                type="number"
                required
                value={values.minNights}
                onChange={(e) => patch("minNights", Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(fe.minNights)}
              />
              <FieldError name="minNights" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cleaningFeeNote">Cleaning fee note (display only)</Label>
            <Textarea
              id="cleaningFeeNote"
              name="cleaningFeeNote"
              value={values.cleaningFeeNote}
              onChange={(e) => patch("cleaningFeeNote", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Amenities</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {allAmenities.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  value={a.slug}
                  checked={amenitySlugs.has(a.slug)}
                  onChange={() => {
                    setAmenitySlugs((prev) => {
                      const next = new Set(prev);
                      if (next.has(a.slug)) next.delete(a.slug);
                      else next.add(a.slug);
                      return next;
                    });
                  }}
                  className="rounded border-stone-300"
                />
                {a.label}
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
          {state.ok ? (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950"
              role="status"
            >
              Your listing was saved successfully.
              {state.warnings?.summary || state.warnings?.description ? (
                <span className="mt-2 block text-amber-900">
                  See suggestions under Summary and Description to strengthen your listing for guests.
                </span>
              ) : null}
            </p>
          ) : null}
          <SaveButton />
        </div>
      </form>

      <div className="flex justify-end">
        <ListingDeleteControls
          listingId={deleteListingId}
          listingTitle={deleteListingTitle}
          redirectAfterDelete={deleteRedirectHref}
        />
      </div>
    </div>
  );
}
