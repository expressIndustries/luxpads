import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder")) {
    return null;
  }
  return new Stripe(key, { typescript: true });
}

export function stripeConfigured() {
  const k = process.env.STRIPE_SECRET_KEY;
  return !!k && !k.includes("placeholder");
}
