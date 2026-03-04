import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const DESCRIPTOR_CODE_REGEX = /^SM[A-Z0-9]{4}$/;

function normalizeSetupIntentResponse(setupIntent: Stripe.SetupIntent) {
  const isVerifyMicrodepositsAction =
    setupIntent.next_action?.type === "verify_with_microdeposits";
  const verifyAction = isVerifyMicrodepositsAction
    ? setupIntent.next_action?.verify_with_microdeposits
    : null;

  return {
    id: setupIntent.id,
    status: setupIntent.status,
    nextActionType: setupIntent.next_action?.type ?? null,
    microdepositType: verifyAction?.microdeposit_type ?? null,
    arrivalDate: verifyAction?.arrival_date ?? null,
    hostedVerificationUrl: verifyAction?.hosted_verification_url ?? null,
    lastErrorCode: setupIntent.last_setup_error?.code ?? null,
    lastErrorMessage: setupIntent.last_setup_error?.message ?? null,
  };
}

function pickLatestRelevantSetupIntent(
  setupIntents: Stripe.SetupIntent[],
): Stripe.SetupIntent | null {
  if (setupIntents.length === 0) {
    return null;
  }

  const nonCanceledIntent = setupIntents.find(
    (setupIntent) => setupIntent.status !== "canceled",
  );

  return nonCanceledIntent ?? setupIntents[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, paymentMethodId, amounts, descriptorCode } =
      await req.json();

    const hasAmounts = Array.isArray(amounts) && amounts.length > 0;
    const hasDescriptorCode =
      typeof descriptorCode === "string" && descriptorCode.trim().length > 0;

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Missing customer ID or payment method ID." },
        { status: 400 },
      );
    }

    if ((hasAmounts && hasDescriptorCode) || (!hasAmounts && !hasDescriptorCode)) {
      return NextResponse.json(
        {
          error:
            "Provide either two micro-deposit amounts or a descriptor code.",
        },
        { status: 400 },
      );
    }

    let normalizedAmounts: [number, number] | null = null;
    let normalizedDescriptorCode: string | null = null;

    if (hasAmounts) {
      if (!Array.isArray(amounts) || amounts.length !== 2) {
        return NextResponse.json(
          { error: "Micro-deposit verification requires exactly two amounts." },
          { status: 400 },
        );
      }

      const parsedAmounts = amounts.map((amount) => Number(amount));
      const validAmounts = parsedAmounts.every(
        (amount) => Number.isInteger(amount) && amount > 0,
      );

      if (!validAmounts) {
        return NextResponse.json(
          {
            error:
              "Micro-deposit amounts must be positive integers in cents.",
          },
          { status: 400 },
        );
      }

      normalizedAmounts = [parsedAmounts[0], parsedAmounts[1]];
    }

    if (hasDescriptorCode) {
      const normalizedCode = String(descriptorCode).trim().toUpperCase();
      if (!DESCRIPTOR_CODE_REGEX.test(normalizedCode)) {
        return NextResponse.json(
          {
            error:
              "Descriptor code must be six characters and start with SM (for example, SM11AA).",
          },
          { status: 400 },
        );
      }

      normalizedDescriptorCode = normalizedCode;
    }

    const setupIntentList = await stripe.setupIntents.list({
      customer: customerId,
      payment_method: paymentMethodId,
      limit: 10,
    });

    const setupIntent = pickLatestRelevantSetupIntent(setupIntentList.data);

    if (!setupIntent) {
      return NextResponse.json(
        {
          error:
            "No setup intent found for this payment method. Remove and re-add the bank account.",
        },
        { status: 404 },
      );
    }

    const verifiedSetupIntent = await stripe.setupIntents.verifyMicrodeposits(
      setupIntent.id,
      normalizedAmounts
        ? { amounts: normalizedAmounts }
        : { descriptor_code: normalizedDescriptorCode! },
    );

    return NextResponse.json(
      { setupIntent: normalizeSetupIntentResponse(verifiedSetupIntent) },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("microdeposit") ||
      normalizedMessage.includes("descriptor") ||
      normalizedMessage.includes("amount") ||
      normalizedMessage.includes("attempt") ||
      normalizedMessage.includes("timeout")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
