import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import type {
  StripePaymentMethodSummary,
  StripeUsBankVerificationSummary,
} from "@/lib/stripe-payment-methods";

const MICRODEPOSIT_FAILURE_CODES = new Set([
  "payment_method_microdeposit_failed",
  "payment_method_microdeposit_verification_amounts_invalid",
  "payment_method_microdeposit_verification_amounts_mismatch",
  "payment_method_microdeposit_verification_attempts_exceeded",
  "payment_method_microdeposit_verification_descriptor_code_mismatch",
  "payment_method_microdeposit_verification_timeout",
]);

async function listRecentSetupIntents(
  customerId: string,
): Promise<Stripe.SetupIntent[]> {
  const setupIntents: Stripe.SetupIntent[] = [];
  const maxPages = 5;
  let startingAfter: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await stripe.setupIntents.list({
      customer: customerId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    setupIntents.push(...response.data);

    if (!response.has_more || response.data.length === 0) {
      break;
    }

    startingAfter = response.data[response.data.length - 1]?.id;
  }

  return setupIntents;
}

function getSetupIntentPaymentMethodId(
  setupIntent: Stripe.SetupIntent,
): string | null {
  if (typeof setupIntent.payment_method === "string") {
    return setupIntent.payment_method;
  }

  if (setupIntent.payment_method && typeof setupIntent.payment_method === "object") {
    return setupIntent.payment_method.id;
  }

  return null;
}

function deriveBankVerification(
  setupIntent: Stripe.SetupIntent | null,
): StripeUsBankVerificationSummary {
  if (!setupIntent) {
    return {
      state: "unknown",
      setupIntentId: null,
      arrivalDate: null,
      microdepositType: null,
      hostedVerificationUrl: null,
      lastErrorCode: null,
      lastErrorMessage: null,
    };
  }

  const isVerifyMicrodepositsAction =
    setupIntent.next_action?.type === "verify_with_microdeposits";
  const verifyAction = isVerifyMicrodepositsAction
    ? setupIntent.next_action?.verify_with_microdeposits
    : null;

  const lastErrorCode = setupIntent.last_setup_error?.code ?? null;
  let state: StripeUsBankVerificationSummary["state"] = "unknown";

  if (setupIntent.status === "succeeded") {
    state = "verified";
  } else if (
    setupIntent.status === "requires_action" &&
    isVerifyMicrodepositsAction
  ) {
    state = "pending_microdeposits";
  } else if (setupIntent.status === "processing") {
    state = "processing";
  } else if (
    setupIntent.status === "canceled" ||
    setupIntent.status === "requires_payment_method" ||
    (lastErrorCode ? MICRODEPOSIT_FAILURE_CODES.has(lastErrorCode) : false)
  ) {
    state = "failed";
  }

  return {
    state,
    setupIntentId: setupIntent.id,
    arrivalDate: verifyAction?.arrival_date ?? null,
    microdepositType: verifyAction?.microdeposit_type ?? null,
    hostedVerificationUrl: verifyAction?.hosted_verification_url ?? null,
    lastErrorCode,
    lastErrorMessage: setupIntent.last_setup_error?.message ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customer ID." },
        { status: 400 },
      );
    }

    const [customer, cards, bankAccounts, setupIntents] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.paymentMethods.list({ customer: customerId, type: "card" }),
      stripe.paymentMethods.list({
        customer: customerId,
        type: "us_bank_account",
      }),
      listRecentSetupIntents(customerId),
    ]);

    if (!customer || ("deleted" in customer && customer.deleted)) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 },
      );
    }

    const defaultPaymentMethodId =
      typeof customer.invoice_settings.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings.default_payment_method?.id ?? null;

    const latestSetupIntentByPaymentMethod = new Map<string, Stripe.SetupIntent>();

    for (const setupIntent of setupIntents) {
      const paymentMethodId = getSetupIntentPaymentMethodId(setupIntent);
      if (!paymentMethodId) {
        continue;
      }

      const existingSetupIntent = latestSetupIntentByPaymentMethod.get(paymentMethodId);
      if (!existingSetupIntent || setupIntent.created > existingSetupIntent.created) {
        latestSetupIntentByPaymentMethod.set(paymentMethodId, setupIntent);
      }
    }

    const cardPaymentMethods: StripePaymentMethodSummary[] = cards.data.map(
      (paymentMethod) => ({
        id: paymentMethod.id,
        type: "card" as const,
        isDefault: paymentMethod.id === defaultPaymentMethodId,
        created: paymentMethod.created,
        card: {
          brand: paymentMethod.card?.brand ?? "card",
          last4: paymentMethod.card?.last4 ?? "",
          expMonth: paymentMethod.card?.exp_month ?? 0,
          expYear: paymentMethod.card?.exp_year ?? 0,
        },
      }),
    );

    const attachedBankPaymentMethods: StripePaymentMethodSummary[] =
      bankAccounts.data.map((paymentMethod) => ({
        id: paymentMethod.id,
        type: "us_bank_account" as const,
        isDefault: paymentMethod.id === defaultPaymentMethodId,
        created: paymentMethod.created,
        usBankAccount: {
          bankName: paymentMethod.us_bank_account?.bank_name ?? null,
          last4: paymentMethod.us_bank_account?.last4 ?? "",
          accountType: paymentMethod.us_bank_account?.account_type ?? null,
          verification: deriveBankVerification(
            latestSetupIntentByPaymentMethod.get(paymentMethod.id) ?? null,
          ),
        },
      }));

    const attachedPaymentMethodIds = new Set<string>([
      ...cards.data.map((paymentMethod) => paymentMethod.id),
      ...bankAccounts.data.map((paymentMethod) => paymentMethod.id),
    ]);

    const pendingUnattachedBankSetupIntents = Array.from(
      latestSetupIntentByPaymentMethod.entries(),
    )
      .filter(([paymentMethodId]) => !attachedPaymentMethodIds.has(paymentMethodId))
      .filter(([, setupIntent]) => {
        const verification = deriveBankVerification(setupIntent);
        return (
          verification.state === "pending_microdeposits" ||
          verification.state === "processing"
        );
      })
      .sort((a, b) => b[1].created - a[1].created)
      .slice(0, 20);

    const unattachedBankPaymentMethods = (
      await Promise.all(
        pendingUnattachedBankSetupIntents.map(
          async ([paymentMethodId, setupIntent]): Promise<StripePaymentMethodSummary | null> => {
            try {
              const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
              if (paymentMethod.type !== "us_bank_account") {
                return null;
              }

              const attachedCustomerId =
                typeof paymentMethod.customer === "string"
                  ? paymentMethod.customer
                  : paymentMethod.customer?.id ?? null;
              if (attachedCustomerId && attachedCustomerId !== customerId) {
                return null;
              }

              return {
                id: paymentMethod.id,
                type: "us_bank_account",
                isDefault: paymentMethod.id === defaultPaymentMethodId,
                created: paymentMethod.created || setupIntent.created,
                usBankAccount: {
                  bankName: paymentMethod.us_bank_account?.bank_name ?? null,
                  last4: paymentMethod.us_bank_account?.last4 ?? "",
                  accountType: paymentMethod.us_bank_account?.account_type ?? null,
                  verification: deriveBankVerification(setupIntent),
                },
              };
            } catch {
              return null;
            }
          },
        ),
      )
    ).filter((paymentMethod): paymentMethod is StripePaymentMethodSummary =>
      Boolean(paymentMethod),
    );

    const paymentMethods: StripePaymentMethodSummary[] = [
      ...cardPaymentMethods,
      ...attachedBankPaymentMethods,
      ...unattachedBankPaymentMethods,
    ].sort((a, b) => b.created - a.created);

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
