import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
const publicPublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

function isPublishableKey(value: string | undefined | null): value is string {
  return typeof value === "string" && value.startsWith("pk_");
}

async function fetchPublishableKey(): Promise<string> {
  const response = await fetch("/api/stripe/publishable-key");
  const result = await response.json();

  if (!response.ok || !result.publishableKey) {
    throw new Error(result.error || "Failed to load Stripe publishable key.");
  }

  return result.publishableKey;
}

async function resolvePublishableKey(): Promise<string> {
  if (isPublishableKey(publicPublishableKey)) {
    return publicPublishableKey;
  }

  return fetchPublishableKey();
}

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = resolvePublishableKey()
      .then((publishableKey) => loadStripe(publishableKey))
      .catch((error) => {
        stripePromise = null;
        throw error;
      });
  }

  return stripePromise;
}
