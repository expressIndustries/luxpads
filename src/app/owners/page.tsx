import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For owners",
  description: "List luxury homes with a simple monthly membership. No commissions on your bookings.",
};

export default function OwnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Owners publish. Travelers inquire. You keep control.</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        LuxStay Direct (presented by FestivalPads.com) is a premium listing marketplace—not a booking merchant. You pay a
        predictable monthly membership to keep homes live, while renters reach you directly with no traveler booking fees.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-stone-700">
        <li>— Polished listing pages with gallery, amenities, and availability tools</li>
        <li>— Inquiries with guest context delivered to your inbox</li>
        <li>— You handle contracts, screening, deposits, and payment collection</li>
        <li>— Active membership required for public visibility</li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Create owner account
        </Link>
        <Link
          href="/owners/pricing"
          className="inline-flex rounded-full border border-stone-200 bg-white px-6 py-2.5 text-sm font-medium text-stone-900 hover:border-stone-300"
        >
          View membership
        </Link>
      </div>
    </div>
  );
}
