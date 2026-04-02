"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateListing, type ListingSaveState } from "@/lib/actions/listing-actions";
import { PROPERTY_TYPES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialSave: ListingSaveState = {};

export type ListingEditDefaults = {
  id: string;
  title: string;
  summary: string;
  description: string;
  propertyType: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  sleepingArrangements: string;
  houseRules: string;
  checkInOut: string;
  cancellationPolicy: string;
  nightlyRateDollars: number;
  minNights: number;
  cleaningFeeNote: string;
};

export type AmenityOption = { id: string; slug: string; label: string };

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

type Props = {
  defaults: ListingEditDefaults;
  /** Changes after each successful save so we re-sync from the server (React 19 resets forms after actions). */
  listingUpdatedAt: string;
  selectedAmenitySlugs: string[];
  allAmenities: AmenityOption[];
};

export function ListingEditFormClient({
  defaults,
  listingUpdatedAt,
  selectedAmenitySlugs,
  allAmenities,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateListing, initialSave);
  const [values, setValues] = useState(() => cloneDefaults(defaults));
  const [amenitySlugs, setAmenitySlugs] = useState(() => new Set(selectedAmenitySlugs));

  useEffect(() => {
    setValues(cloneDefaults(defaults));
    setAmenitySlugs(new Set(selectedAmenitySlugs));
    // Only listingUpdatedAt — not `defaults` (new object every RSC render would wipe edits while typing).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingUpdatedAt]);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  function patch<K extends keyof ListingEditDefaults>(key: K, value: ListingEditDefaults[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={values.id} />
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Basics</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={values.title}
            onChange={(e) => patch("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            name="summary"
            required
            value={values.summary}
            onChange={(e) => patch("summary", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            value={values.description}
            onChange={(e) => patch("description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property type</Label>
          <select
            id="propertyType"
            name="propertyType"
            value={values.propertyType}
            onChange={(e) => patch("propertyType", e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
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
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Location</h2>
        <div className="space-y-2">
          <Label htmlFor="addressLine1">Address</Label>
          <Input
            id="addressLine1"
            name="addressLine1"
            required
            value={values.addressLine1}
            onChange={(e) => patch("addressLine1", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required value={values.city} onChange={(e) => patch("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / region</Label>
            <Input
              id="state"
              name="state"
              required
              value={values.state}
              onChange={(e) => patch("state", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              required
              value={values.country}
              onChange={(e) => patch("country", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              required
              value={values.postalCode}
              onChange={(e) => patch("postalCode", e.target.value)}
            />
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (optional)</Label>
            <Input
              id="longitude"
              name="longitude"
              value={values.longitude}
              onChange={(e) => patch("longitude", e.target.value)}
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
                name="amenitySlugs"
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
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.ok ? (
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950"
            role="status"
          >
            Your listing was saved successfully.
          </p>
        ) : null}
        <SaveButton />
      </div>
    </form>
  );
}
