import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      customerId,
      databaseCustomerId,
      paymentMethodId,
      paymentMethodLabel,
      amount,
    } = await req.json();

    if (
      !customerId ||
      !databaseCustomerId ||
      !paymentMethodId ||
      !Number.isInteger(amount)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid payment data." },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero." },
        { status: 400 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      payment_method: paymentMethodId,
      amount,
      currency: "usd",
      payment_method_types: ["card", "us_bank_account"],
      confirm: true,
      off_session: false,
    });

    const transactionBasePayload = {
      customer_id: databaseCustomerId,
      name: "Balance payment",
      type: "Payment",
      stripe_intent_id: paymentIntent.id,
      amount,
      status: "pending",
    };

    const transactionDescriptionPayload = {
      ...transactionBasePayload,
      description: paymentMethodLabel
        ? `Stripe payment with ${paymentMethodLabel}`
        : "Stripe balance payment",
    };

    let { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert(transactionDescriptionPayload)
      .select()
      .single();

    const missingDescriptionColumn =
      transactionError?.message
        ?.toLowerCase()
        .includes("could not find the 'description' column") ?? false;

    if (missingDescriptionColumn) {
      const fallbackInsert = await supabase
        .from("transactions")
        .insert(transactionBasePayload)
        .select()
        .single();

      transaction = fallbackInsert.data;
      transactionError = fallbackInsert.error;
    }

    if (transactionError) {
      return NextResponse.json(
        {
          error: `PaymentIntent created, but failed to record transaction: ${transactionError.message}`,
          paymentIntentId: paymentIntent.id,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        transaction,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
