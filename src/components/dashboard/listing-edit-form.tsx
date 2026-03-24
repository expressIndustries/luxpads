import { updateListing } from "@/lib/actions/listing-actions";
import { PROPERTY_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ListingPublishControls } from "@/components/dashboard/listing-publish-controls";
import { ListingImageManager } from "@/components/dashboard/listing-image-manager";
import type { Listing, ListingImage, ListingAmenity } from "@prisma/client";

type ListingWith = Listing & {
  images: ListingImage[];
  amenities: (ListingAmenity & { amenity: { slug: string; label: string } })[];
};

export async function ListingEditForm({ listing }: { listing: ListingWith }) {
  const allAmenities = await prisma.amenity.findMany({ orderBy: { label: "asc" } });
  const selected = new Set(listing.amenities.map((a) => a.amenity.slug));

  return (
    <div className="space-y-10">
      <ListingPublishControls listingId={listing.id} status={listing.status} />
      <ListingImageManager
        listingId={listing.id}
        images={listing.images.map((i) => ({ id: i.id, url: i.url, sortOrder: i.sortOrder }))}
      />

      <form action={updateListing} className="space-y-6">
        <input type="hidden" name="id" value={listing.id} />
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Basics</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={listing.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" required defaultValue={listing.summary} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required defaultValue={listing.description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type</Label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={listing.propertyType}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            >
              {!PROPERTY_TYPES.includes(listing.propertyType as (typeof PROPERTY_TYPES)[number]) ? (
                <option value={listing.propertyType}>{listing.propertyType}</option>
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
            <Input id="addressLine1" name="addressLine1" required defaultValue={listing.addressLine1} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required defaultValue={listing.city} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / region</Label>
              <Input id="state" name="state" required defaultValue={listing.state} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" required defaultValue={listing.country} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" name="postalCode" required defaultValue={listing.postalCode} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input id="latitude" name="latitude" defaultValue={listing.latitude ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input id="longitude" name="longitude" defaultValue={listing.longitude ?? ""} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Capacity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max guests</Label>
              <Input id="maxGuests" name="maxGuests" type="number" required defaultValue={listing.maxGuests} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" required defaultValue={listing.bedrooms} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" step="0.5" required defaultValue={listing.bathrooms} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds">Beds</Label>
              <Input id="beds" name="beds" type="number" required defaultValue={listing.beds} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleepingArrangements">Sleeping arrangements</Label>
            <Textarea id="sleepingArrangements" name="sleepingArrangements" defaultValue={listing.sleepingArrangements ?? ""} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Policies & rates</h2>
          <div className="space-y-2">
            <Label htmlFor="houseRules">House rules</Label>
            <Textarea id="houseRules" name="houseRules" defaultValue={listing.houseRules ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkInOut">Check-in / check-out</Label>
            <Textarea id="checkInOut" name="checkInOut" defaultValue={listing.checkInOut ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation policy</Label>
            <Textarea id="cancellationPolicy" name="cancellationPolicy" defaultValue={listing.cancellationPolicy ?? ""} />
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
                defaultValue={Math.round(listing.nightlyRateCents / 100)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minNights">Minimum nights</Label>
              <Input id="minNights" name="minNights" type="number" required defaultValue={listing.minNights} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cleaningFeeNote">Cleaning fee note (display only)</Label>
            <Textarea id="cleaningFeeNote" name="cleaningFeeNote" defaultValue={listing.cleaningFeeNote ?? ""} />
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

        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
