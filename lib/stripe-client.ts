import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

async function fetchPublishableKey(): Promise<string> {
  const response = await fetch("/api/stripe/publishable-key");
  const result = await response.json();

  if (!response.ok || !result.publishableKey) {
    throw new Error(result.error || "Failed to load Stripe publishable key.");
  }

  return result.publishableKey;
}

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = fetchPublishableKey().then((publishableKey) =>
      loadStripe(publishableKey),
    );
  }

  return stripePromise;
}
