"use client";

import { useFormState, useFormStatus } from "react-dom";
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
  selectedAmenitySlugs: string[];
  allAmenities: AmenityOption[];
};

export function ListingEditFormClient({ defaults, selectedAmenitySlugs, allAmenities }: Props) {
  const [state, formAction] = useFormState(updateListing, initialSave);
  const selected = new Set(selectedAmenitySlugs);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={defaults.id} />
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Basics</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={defaults.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" required defaultValue={defaults.summary} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required defaultValue={defaults.description} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property type</Label>
          <select
            id="propertyType"
            name="propertyType"
            defaultValue={defaults.propertyType}
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          >
            {!PROPERTY_TYPES.includes(defaults.propertyType as (typeof PROPERTY_TYPES)[number]) ? (
              <option value={defaults.propertyType}>{defaults.propertyType}</option>
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
          <Input id="addressLine1" name="addressLine1" required defaultValue={defaults.addressLine1} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required defaultValue={defaults.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / region</Label>
            <Input id="state" name="state" required defaultValue={defaults.state} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required defaultValue={defaults.country} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" name="postalCode" required defaultValue={defaults.postalCode} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (optional)</Label>
            <Input id="latitude" name="latitude" defaultValue={defaults.latitude} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (optional)</Label>
            <Input id="longitude" name="longitude" defaultValue={defaults.longitude} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Capacity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxGuests">Max guests</Label>
            <Input id="maxGuests" name="maxGuests" type="number" required defaultValue={defaults.maxGuests} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" required defaultValue={defaults.bedrooms} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              step="0.5"
              required
              defaultValue={defaults.bathrooms}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beds">Beds</Label>
            <Input id="beds" name="beds" type="number" required defaultValue={defaults.beds} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleepingArrangements">Sleeping arrangements</Label>
          <Textarea
            id="sleepingArrangements"
            name="sleepingArrangements"
            defaultValue={defaults.sleepingArrangements}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Policies & rates</h2>
        <div className="space-y-2">
          <Label htmlFor="houseRules">House rules</Label>
          <Textarea id="houseRules" name="houseRules" defaultValue={defaults.houseRules} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkInOut">Check-in / check-out</Label>
          <Textarea id="checkInOut" name="checkInOut" defaultValue={defaults.checkInOut} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cancellationPolicy">Cancellation policy</Label>
          <Textarea id="cancellationPolicy" name="cancellationPolicy" defaultValue={defaults.cancellationPolicy} />
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
              defaultValue={defaults.nightlyRateDollars}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minNights">Minimum nights</Label>
            <Input id="minNights" name="minNights" type="number" required defaultValue={defaults.minNights} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cleaningFeeNote">Cleaning fee note (display only)</Label>
          <Textarea id="cleaningFeeNote" name="cleaningFeeNote" defaultValue={defaults.cleaningFeeNote} />
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
                defaultChecked={selected.has(a.slug)}
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
