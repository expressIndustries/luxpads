import type { Metadata } from "next";
import Link from "next/link";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

const SAMPLE_LEASE_HREF = "/docs/2025%20Residential%20Lease%20Agreement%20-%20BLANK.docx";

const ownersDescription = `List luxury homes on ${siteCopy.domainDisplay} for free. No traveler booking fees; you screen guests, set terms, and handle payment directly — ${siteCopy.legalName} is a listing marketplace, not a booking middleman.`;

export const metadata: Metadata = {
  title: "For owners — list your home for free",
  description: ownersDescription,
  alternates: { canonical: "/owners" },
  openGraph: {
    title: `For owners | ${siteCopy.legalName}`,
    description: ownersDescription,
    url: absoluteUrl("/owners"),
    type: "website",
  },
};

export default function OwnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Owners publish. Travelers inquire. You keep control.</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        {siteCopy.legalName} is a listing marketplace at {siteCopy.domainDisplay}—not a booking middleman. Listing is
        free, and there are no traveler booking fees.{" "}
        <span className="font-medium text-stone-800">
          Renters contact you directly
        </span>
        ; you decide who stays, on what terms, and how money changes hands.
      </p>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
        <h2 className="font-serif text-xl text-stone-900">Leases and agreements</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Because guests and owners work together outside our platform, you should put rates, dates, house rules, and
          cancellation expectations in writing. Use{" "}
          <span className="font-medium text-stone-800">your own lease or rental agreement</span>, or start from our{" "}
          <a
            href={SAMPLE_LEASE_HREF}
            className="font-medium text-amber-900 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
          >
            sample residential lease
          </a>{" "}
          (same document linked in the site footer under Resources). Have an attorney review anything you sign.
        </p>
      </section>

      <ul className="mt-10 space-y-3 text-sm text-stone-700">
        <li>— Polished listing pages with gallery, amenities, and availability tools</li>
        <li>— Inquiries with guest context delivered to your inbox</li>
        <li>— You handle screening, contracts, deposits, and payment—directly with the guest</li>
        <li>— Publish when you are ready—listing stays free</li>
      </ul>

      <section className="mt-10 border-t border-stone-200 pt-10">
        <h2 className="font-serif text-xl text-stone-900">Renting for a short window (e.g. Sundance)</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          If you only rent your home for a handful of days a year, federal tax rules sometimes treat that income
          differently than longer-term rentals. The IRS refers to this as the{" "}
          <span className="font-medium text-stone-800">14-day rule</span> under Section 280A(g)—it is not one-size-fits-all
          and does not replace advice from your CPA.
        </p>
        <Link
          href="/owners/short-term-rental-tax"
          className="mt-4 inline-flex text-sm font-medium text-amber-900 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
        >
          Read a plain-language overview: Section 280A(g) and the 14-day rule
        </Link>
      </section>

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
