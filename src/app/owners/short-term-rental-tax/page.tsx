import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Short-term rental income & Section 280A(g)",
  description:
    "A plain-language overview of the federal 14-day rule for renting your home—when income may be excluded and when it is taxable.",
};

export default function ShortTermRentalTaxPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        <Link href="/owners" className="hover:text-stone-800">
          For owners
        </Link>
        <span className="text-stone-400"> / </span>
        Tax basics
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900">The 14-day rule (Section 280A(g))</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        This page summarizes a common federal income-tax rule for homeowners who rent a primary or secondary residence. It
        is general information only—not tax, legal, or financial advice. Your situation may differ; talk to a qualified
        tax professional before making decisions.
      </p>

      <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50/80 p-6">
        <h2 className="font-serif text-xl text-stone-900">The simple version</h2>
        <ul className="mt-4 space-y-3 text-sm text-stone-700">
          <li>
            <span className="font-medium text-stone-900">14 days or fewer</span> in a calendar year: rental income is
            often excluded from federal gross income under Section 280A(g). You generally do not report that income on
            your federal return for that exclusion.
          </li>
          <li>
            <span className="font-medium text-stone-900">15 days or more</span>: the exclusion does not apply. Rental
            income is normally taxable and must be reported (commonly on Schedule E). You may also be able to deduct
            rental-related expenses—such as a share of mortgage interest, property taxes, utilities, cleaning, repairs,
            and depreciation—which can reduce taxable profit.
          </li>
        </ul>
      </div>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-stone-600">
        <h2 className="font-serif text-2xl text-stone-900">Why this rule exists</h2>
        <p>
          Congress created this exclusion so people who occasionally rent out a home for big events—think major sports
          tournaments or film festivals—are not buried in filing complexity for a short stay.
        </p>
        <p>
          The Sundance Film Festival is often about ten days. Many homeowners who rent only for that window may fall
          under the 14-day threshold for federal purposes, but dates and your own use matter—confirm with a tax advisor.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-sm leading-relaxed text-stone-600">
        <h2 className="font-serif text-2xl text-stone-900">If you rent more than 14 days</h2>
        <p>
          Once you are over 14 days in a year, Section 280A(g) no longer shields that income at the federal level.
          Reporting and deductions follow normal rental-property rules. Federal rates depend on your total income and
          filing status (brackets currently run from 10% to 37%); your effective rate on rental income is specific to
          you.
        </p>
        <p className="text-xs text-stone-500">
          State and local taxes, occupancy taxes, and other rules are separate. This page addresses only the federal
          concept described above.
        </p>
      </section>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-900">List your home on LuxPads</p>
        <p className="mt-2 text-sm text-stone-600">
          We connect travelers and owners directly—you set terms, use your own lease or a sample agreement, and handle
          payment off-platform.
        </p>
        <Link
          href="/owners"
          className="mt-4 inline-flex text-sm font-medium text-amber-900 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900"
        >
          Back to For owners
        </Link>
      </div>
    </div>
  );
}
