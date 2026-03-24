import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Terms of use (placeholder)</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        This is placeholder legal copy. {siteCopy.legalName} operates as a listing marketplace only. Replace this page
        with counsel-approved terms covering eligibility, acceptable use, content moderation, and
        limitation of liability for off-platform transactions.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-stone-600">
        <li>The platform is not the merchant of record for rentals.</li>
        <li>Owners are responsible for compliance with local short-term rental regulations.</li>
        <li>Users must not use the marketplace to circumvent safety or discrimination laws.</li>
      </ul>
    </div>
  );
}
