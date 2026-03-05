import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import {
  allocateByFifo,
  normalizeManualAllocations,
} from "@/lib/finance-utils";
import type {
  FinanceAllocationInput,
  FinanceAllocationMode,
} from "@/lib/finance-types";
import { loadObligationBalancesForUser } from "@/lib/finance-server";

type FinancePaymentWebhookRow = {
  id?: string;
  user_id?: string;
  amount_cents?: number;
  status?: string;
  allocation_mode?: string;
  pending_allocations_json?: unknown;
};

async function findFinancePaymentByIntentId(paymentIntentId: string) {
  const { data, error } = await supabase
    .from("finance_payments")
    .select("id, user_id, amount_cents, status, allocation_mode, pending_allocations_json")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load finance payment for intent ${paymentIntentId}: ${error.message}`,
    );
  }

  return (data ?? null) as FinancePaymentWebhookRow | null;
}

async function markFinancePaymentStatus(
  paymentId: string,
  status: "failed" | "canceled" | "completed",
) {
  const updatePayload: {
    status: "failed" | "canceled" | "completed";
    updated_at: string;
    pending_allocations_json?: null;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    updatePayload.pending_allocations_json = null;
  }

  const { error } = await supabase
    .from("finance_payments")
    .update(updatePayload)
    .eq("id", paymentId);

  if (error) {
    throw new Error(`Failed to update finance payment status: ${error.message}`);
  }
}

async function completeFinancePayment(payment: FinancePaymentWebhookRow) {
  if (
    typeof payment.id !== "string" ||
    typeof payment.user_id !== "string" ||
    typeof payment.amount_cents !== "number"
  ) {
    throw new Error("Finance payment row is malformed.");
  }

  if (payment.status === "completed") {
    return;
  }

  const obligations = (await loadObligationBalancesForUser(payment.user_id)).filter(
    (obligation) => obligation.remaining_cents > 0,
  );

  const allocationMode: FinanceAllocationMode =
    payment.allocation_mode === "manual_selection"
      ? "manual_selection"
      : "auto_fifo";

  const allocations =
    allocationMode === "manual_selection"
      ? normalizeManualAllocations({
          allocations: Array.isArray(payment.pending_allocations_json)
            ? (payment.pending_allocations_json as FinanceAllocationInput[])
            : [],
          obligationById: new Map(
            obligations.map((obligation) => [obligation.id, obligation]),
          ),
          amountCents: payment.amount_cents,
        })
      : allocateByFifo({
          obligations,
          amountCents: payment.amount_cents,
        });

  if (allocations.length > 0) {
    const { error: allocationError } = await supabase
      .from("finance_payment_allocations")
      .upsert(
        allocations.map((allocation) => ({
          payment_id: payment.id,
          obligation_id: allocation.obligationId,
          amount_cents: allocation.amountCents,
        })),
        {
          onConflict: "payment_id,obligation_id",
          ignoreDuplicates: true,
        },
      );

    if (allocationError) {
      throw new Error(
        `Failed to insert finance allocations for payment ${payment.id}: ${allocationError.message}`,
      );
    }
  }

  await markFinancePaymentStatus(payment.id, "completed");
}

async function handleSucceededPaymentIntent(paymentIntentId: string) {
  const financePayment = await findFinancePaymentByIntentId(paymentIntentId);

  if (!financePayment) {
    console.info("No finance payment row found for succeeded intent", {
      paymentIntentId,
    });
    return;
  }

  await completeFinancePayment(financePayment);
}

async function handleFailedOrCanceledPaymentIntent(
  paymentIntentId: string,
  status: "failed" | "canceled",
) {
  const financePayment = await findFinancePaymentByIntentId(paymentIntentId);

  if (!financePayment) {
    console.info("No finance payment row found for failed/canceled intent", {
      paymentIntentId,
      status,
    });
    return;
  }

  if (typeof financePayment.id !== "string") {
    throw new Error("Finance payment row is malformed.");
  }

  if (financePayment.status === "completed") {
    return;
  }

  await markFinancePaymentStatus(financePayment.id, status);
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
        await handleSucceededPaymentIntent(paymentIntent.id);
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
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedOrCanceledPaymentIntent(paymentIntent.id, "failed");
        break;
      }
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedOrCanceledPaymentIntent(paymentIntent.id, "canceled");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
