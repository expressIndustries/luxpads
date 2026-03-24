import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { formatMoney } from "@/lib/utils";
import { format } from "date-fns";
import { CheckoutButton } from "./checkout-button";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (!session?.user?.id) return null;

  const [sub, plan] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    }),
    prisma.plan.findFirst({ where: { active: true } }),
  ]);

  const active = isSubscriptionActive(sub?.status);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Billing</h1>
        <p className="mt-2 text-sm text-stone-600">
          Membership is billed through Stripe. Bookings themselves are never processed by {process.env.NEXT_PUBLIC_SITE_NAME ?? "LuxStay Direct"}.
        </p>
      </div>
      {sp.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
          Thanks—your subscription will reflect here after the webhook runs (or refresh in a moment).
        </div>
      ) : null}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Current status</p>
        <p className="mt-3 text-2xl font-semibold text-stone-900">{active ? "Active" : sub?.status ?? "No subscription"}</p>
        {sub?.currentPeriodEnd ? (
          <p className="mt-2 text-sm text-stone-600">
            Renews / ends: {format(sub.currentPeriodEnd, "MMM d, yyyy")}
          </p>
        ) : null}
        {plan ? (
          <p className="mt-4 text-sm text-stone-600">
            Plan: <span className="font-medium text-stone-900">{plan.name}</span> — {formatMoney(plan.amountCents)} / month
          </p>
        ) : null}
        <div className="mt-8">
          <CheckoutButton />
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Configure <code className="rounded bg-stone-100 px-1">STRIPE_SECRET_KEY</code>,{" "}
          <code className="rounded bg-stone-100 px-1">STRIPE_PRICE_ID_OWNER_MONTHLY</code>, and webhook endpoint{" "}
          <code className="rounded bg-stone-100 px-1">/api/stripe/webhook</code> for production.
        </p>
      </div>
    </div>
  );
}
