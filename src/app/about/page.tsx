import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">About {siteCopy.legalName}</h1>

      <p className="mt-6 text-sm font-medium leading-relaxed text-stone-900">
        {siteCopy.legalName} was born out of frustration—and opportunity.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        As a homeowner in Boulder, Colorado, I saw firsthand how platforms like Airbnb and VRBO were changing the
        short-term rental market. While they made it easier to list properties, they also added layers of fees,
        complexity, and friction for both owners and guests. It started to feel less like a direct connection—and more
        like a middleman-controlled marketplace.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        At the same time, I noticed something else: during high-demand events like the Sundance Film Festival, there was
        a real gap. Corporate teams, production crews, and individuals were all looking for premium homes—but the
        process to find and secure the right place was inefficient, expensive, and often impersonal.
      </p>

      <p className="mt-4 text-sm font-medium leading-relaxed text-stone-900">
        So I built {siteCopy.legalName}.
      </p>

      <h2 className="mt-12 font-serif text-2xl text-stone-900">A Better Way to Connect</h2>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        {siteCopy.legalName} is designed to connect homeowners directly with renters—whether that&apos;s a brand hosting
        clients, a film team on location, or a family looking for an elevated experience during Sundance.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        No unnecessary layers.
        <br />
        No bloated fees.
        <br />
        Just high-quality homes and direct relationships.
      </p>

      <h2 className="mt-12 font-serif text-2xl text-stone-900">Built by an Owner, for Owners</h2>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        This isn&apos;t a faceless platform. {siteCopy.legalName} was created by someone who understands what it&apos;s
        like to open up your home—and what it should feel like to rent one.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">We focus on:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
        <li>Premium properties in sought-after locations</li>
        <li>Direct communication between owners and renters</li>
        <li>Flexible, transparent arrangements</li>
        <li>Curated experiences during high-demand events</li>
      </ul>

      <h2 className="mt-12 font-serif text-2xl text-stone-900">Focused on Sundance (for Now)</h2>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        {siteCopy.legalName} is currently centered around the Sundance Film Festival—one of the most unique and
        high-demand rental markets in the world. It&apos;s where timing, trust, and quality matter most.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Our goal is simple: make it easier for the right people to find the right homes—without the noise.
      </p>

      <hr className="my-12 border-stone-200" />

      <p className="text-sm leading-relaxed text-stone-600">
        If you&apos;re a homeowner looking to maximize your property&apos;s potential during Sundance—or a renter looking
        for something better than the typical listing experience—{siteCopy.legalName} is built for you.
      </p>

      <p className="mt-4 text-sm font-medium leading-relaxed text-stone-900">
        Welcome to a more direct way to rent.
      </p>
    </div>
  );
}
