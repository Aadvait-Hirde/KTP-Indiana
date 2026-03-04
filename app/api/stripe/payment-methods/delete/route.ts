import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { paymentMethodId, customerId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Missing payment method ID." },
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const attachedCustomerId =
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : paymentMethod.customer?.id ?? null;

    if (customerId && attachedCustomerId && attachedCustomerId !== customerId) {
      return NextResponse.json(
        { error: "Payment method does not belong to this customer." },
        { status: 403 },
      );
    }

    if (!attachedCustomerId) {
      if (!customerId) {
        return NextResponse.json(
          {
            error:
              "Customer ID is required to remove an unverified payment method.",
          },
          { status: 400 },
        );
      }

      const setupIntentList = await stripe.setupIntents.list({
        customer: customerId,
        payment_method: paymentMethodId,
        limit: 10,
      });

      const cancelableSetupIntents = setupIntentList.data.filter(
        (setupIntent) =>
          setupIntent.status !== "succeeded" && setupIntent.status !== "canceled",
      );

      await Promise.all(
        cancelableSetupIntents.map((setupIntent) =>
          stripe.setupIntents.cancel(setupIntent.id).catch(() => null),
        ),
      );

      return NextResponse.json({ id: paymentMethodId, deleted: true });
    }

    const detachedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId,
    );

    return NextResponse.json({ id: detachedPaymentMethod.id, deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
