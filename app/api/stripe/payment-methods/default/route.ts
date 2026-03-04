import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { customerId, paymentMethodId } = await req.json();

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Missing customer ID or payment method ID." },
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const attachedCustomerId =
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : paymentMethod.customer?.id ?? null;

    if (!attachedCustomerId) {
      return NextResponse.json(
        {
          error:
            "Payment method is not attached to your customer yet. Verify and re-add if needed.",
        },
        { status: 400 },
      );
    }

    if (attachedCustomerId !== customerId) {
      return NextResponse.json(
        { error: "Payment method does not belong to this customer." },
        { status: 403 },
      );
    }

    const updatedCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const defaultPaymentMethodId =
      typeof updatedCustomer.invoice_settings.default_payment_method === "string"
        ? updatedCustomer.invoice_settings.default_payment_method
        : updatedCustomer.invoice_settings.default_payment_method?.id ?? null;

    return NextResponse.json(
      {
        customerId: updatedCustomer.id,
        defaultPaymentMethodId,
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
