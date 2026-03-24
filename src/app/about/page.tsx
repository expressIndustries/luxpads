import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">About {siteCopy.legalName}</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        {siteCopy.legalName} ({siteCopy.domainDisplay}) is a luxury listing marketplace. We connect discerning travelers with
        homeowners—without inserting ourselves into rental payments or contracts.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Travelers pay no booking fees to the platform. Homeowners list for free. When you are ready to book, you finalize
        details directly with the homeowner.
      </p>
    </div>
  );
}
