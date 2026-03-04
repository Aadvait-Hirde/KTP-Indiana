import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

async function updateTransactionStatusByPaymentIntentId(
  paymentIntentId: string,
  status: "completed" | "failed",
) {
  const { error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("stripe_intent_id", paymentIntentId)
    .eq("type", "Payment");

  if (error) {
    throw new Error(
      `Failed to update transactions for payment intent ${paymentIntentId}: ${error.message}`,
    );
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "setup_intent.requires_action":
      case "setup_intent.succeeded":
      case "setup_intent.setup_failed":
      case "setup_intent.canceled": {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.info("Stripe setup intent event", {
          eventType: event.type,
          setupIntentId: setupIntent.id,
          customerId:
            typeof setupIntent.customer === "string"
              ? setupIntent.customer
              : setupIntent.customer?.id ?? null,
          paymentMethodId:
            typeof setupIntent.payment_method === "string"
              ? setupIntent.payment_method
              : setupIntent.payment_method?.id ?? null,
          status: setupIntent.status,
          nextActionType: setupIntent.next_action?.type ?? null,
          lastErrorCode: setupIntent.last_setup_error?.code ?? null,
        });
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateTransactionStatusByPaymentIntentId(paymentIntent.id, "completed");
        break;
      }
      case "payment_intent.processing":
      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.info("Stripe payment intent pending event", {
          eventType: event.type,
          paymentIntentId: paymentIntent.id,
          customerId:
            typeof paymentIntent.customer === "string"
              ? paymentIntent.customer
              : paymentIntent.customer?.id ?? null,
          status: paymentIntent.status,
        });
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateTransactionStatusByPaymentIntentId(paymentIntent.id, "failed");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
