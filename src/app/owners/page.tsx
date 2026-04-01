import type { Metadata } from "next";
import Link from "next/link";
import { siteCopy } from "@/lib/constants";

export const metadata: Metadata = {
  title: "For owners",
  description: "List luxury homes for free. No platform commissions on your bookings.",
};

export default function OwnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Owners publish. Travelers inquire. You keep control.</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        {siteCopy.legalName} is a premium listing marketplace at {siteCopy.domainDisplay}—not a booking merchant. Listing
        is free; renters reach you directly with no traveler booking fees.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-stone-700">
        <li>— Polished listing pages with gallery, amenities, and availability tools</li>
        <li>— Inquiries with guest context delivered to your inbox</li>
        <li>— You handle contracts, screening, deposits, and payment collection</li>
        <li>— Publish when you are ready—listing stays free</li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Create free account
        </Link>
      </div>
    </div>
  );
}
