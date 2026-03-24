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
        {siteCopy.legalName} is a luxury listing marketplace presented by FestivalPads.com. We connect discerning travelers
        with homeowners for festival seasons and executive retreats—without inserting ourselves into rental payments or
        contracts.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Travelers pay no booking fees to the platform. Homeowners pay a simple monthly membership to keep listings live
        and polished. When you are ready to book, you finalize details directly with the homeowner.
      </p>
    </div>
  );
}
