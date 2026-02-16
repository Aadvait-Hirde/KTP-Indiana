import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_API_TEST ?? process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing Stripe secret key. Set STRIPE_API_TEST or STRIPE_SECRET_KEY.");
}

export const stripe = new Stripe(stripeSecretKey);
