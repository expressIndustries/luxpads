import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Owner membership",
};

export default async function PricingPage() {
  const plan = await prisma.plan.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Owner membership</h1>
      <p className="mt-3 text-sm text-stone-600">
        One simple subscription unlocks publishing. Stripe handles renewals; we never tax your nightly rate.
      </p>
      <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Current plan</p>
        <p className="mt-3 font-serif text-3xl text-stone-900">{plan?.name ?? "Owner Membership"}</p>
        <p className="mt-2 text-3xl font-semibold text-stone-900">
          {plan ? formatMoney(plan.amountCents) : "$99"}
          <span className="text-base font-normal text-stone-500"> / month</span>
        </p>
        <p className="mt-4 text-sm text-stone-600">
          Includes unlimited published listings while your subscription stays active, inquiry routing, and calendar
          tooling. Connect Stripe keys in <code className="rounded bg-stone-100 px-1">.env</code> to enable live checkout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            Get started
          </Link>
          <Link
            href="/dashboard/billing"
            className="inline-flex rounded-full border border-stone-200 bg-white px-6 py-2.5 text-sm font-medium text-stone-900 hover:border-stone-300"
          >
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  );
}
