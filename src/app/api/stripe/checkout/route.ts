import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_OWNER_MONTHLY." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable" }, { status: 503 });
  }

  const plan = await prisma.plan.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });
  if (!plan) {
    return NextResponse.json({ error: "No active plan in database" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${base}/dashboard/billing?success=1`,
    cancel_url: `${base}/owners/pricing`,
    metadata: { userId: session.user.id, planId: plan.id },
    subscription_data: {
      metadata: { userId: session.user.id, planId: plan.id },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
