import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAppAuthContext, RouteAuthError } from "@/lib/server-auth";
import { loadObligationBalancesForUser } from "@/lib/finance-server";

type CustomerRow = {
  id?: string;
  stripe_id?: string | null;
};

type ChargeRow = {
  id?: string;
  title?: string;
  description?: string | null;
};

type PaymentRow = {
  id?: string;
  user_id?: string;
  customer_id?: string | null;
  source?: string;
  status?: string;
  amount_cents?: number;
  currency?: string;
  stripe_payment_intent_id?: string | null;
  payment_method_label?: string | null;
  allocation_mode?: string;
  notes?: string | null;
  created_at?: string;
};

type AllocationRow = {
  payment_id?: string;
  obligation_id?: string;
  amount_cents?: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Failed to load finance overview.";
}

export async function GET() {
  try {
    const context = await requireAppAuthContext();

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("id, stripe_id")
      .eq("user_id", context.appUser.id)
      .maybeSingle();

    if (customerError) throw customerError;

    const customer = (customerData ?? null) as CustomerRow | null;

    const financeEnabled = Boolean(
      customer &&
        typeof customer.stripe_id === "string" &&
        customer.stripe_id.length > 0,
    );

    const obligations = await loadObligationBalancesForUser(context.appUser.id);

    const chargeTitleById = new Map<string, { title: string; description: string | null }>();
    const chargeIds = Array.from(new Set(obligations.map((item) => item.charge_id)));

    if (chargeIds.length > 0) {
      const { data: chargeRows, error: chargeError } = await supabase
        .from("finance_charges")
        .select("id, title, description")
        .in("id", chargeIds);

      if (chargeError) throw chargeError;

      for (const row of (chargeRows ?? []) as ChargeRow[]) {
        if (typeof row.id !== "string" || typeof row.title !== "string") continue;

        chargeTitleById.set(row.id, {
          title: row.title,
          description: typeof row.description === "string" ? row.description : null,
        });
      }
    }

    const { data: paymentRows, error: paymentError } = await supabase
      .from("finance_payments")
      .select("*")
      .eq("user_id", context.appUser.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (paymentError) throw paymentError;

    const paymentIds = (paymentRows ?? []).flatMap((row) =>
      typeof row.id === "string" ? [row.id] : [],
    );

    const allocationsResponse =
      paymentIds.length > 0
        ? await supabase
            .from("finance_payment_allocations")
            .select("payment_id, obligation_id, amount_cents")
            .in("payment_id", paymentIds)
        : { data: [], error: null };

    if (allocationsResponse.error) throw allocationsResponse.error;

    const allocationsByPaymentId = new Map<
      string,
      Array<{ obligationId: string; amountCents: number }>
    >();

    for (const row of (allocationsResponse.data ?? []) as AllocationRow[]) {
      if (
        typeof row.payment_id !== "string" ||
        typeof row.obligation_id !== "string" ||
        typeof row.amount_cents !== "number"
      ) {
        continue;
      }

      const current = allocationsByPaymentId.get(row.payment_id) ?? [];
      current.push({
        obligationId: row.obligation_id,
        amountCents: row.amount_cents,
      });
      allocationsByPaymentId.set(row.payment_id, current);
    }

    const payments = ((paymentRows ?? []) as PaymentRow[]).flatMap((row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.amount_cents !== "number" ||
        typeof row.source !== "string" ||
        typeof row.status !== "string" ||
        typeof row.allocation_mode !== "string" ||
        typeof row.created_at !== "string"
      ) {
        return [];
      }

      return [
        {
          id: row.id,
          source: row.source,
          status: row.status,
          amountCents: row.amount_cents,
          currency: typeof row.currency === "string" ? row.currency : "usd",
          stripePaymentIntentId:
            typeof row.stripe_payment_intent_id === "string"
              ? row.stripe_payment_intent_id
              : null,
          paymentMethodLabel:
            typeof row.payment_method_label === "string"
              ? row.payment_method_label
              : null,
          allocationMode: row.allocation_mode,
          notes: typeof row.notes === "string" ? row.notes : null,
          createdAt: row.created_at,
          allocations: allocationsByPaymentId.get(row.id) ?? [],
        },
      ];
    });

    const obligationsWithCharge = obligations.map((obligation) => ({
      ...obligation,
      chargeTitle: chargeTitleById.get(obligation.charge_id)?.title ?? "Charge",
      chargeDescription: chargeTitleById.get(obligation.charge_id)?.description ?? null,
    }));

    const outstandingCents = obligationsWithCharge.reduce(
      (sum, obligation) => sum + obligation.remaining_cents,
      0,
    );

    const overdueCount = obligationsWithCharge.filter(
      (obligation) => obligation.is_overdue && obligation.remaining_cents > 0,
    ).length;

    return NextResponse.json(
      {
        financeEnabled,
        customer:
          customer && typeof customer.id === "string"
            ? {
                customerId: customer.id,
                stripeCustomerId:
                  typeof customer.stripe_id === "string" ? customer.stripe_id : null,
              }
            : null,
        summary: {
          outstandingCents,
          overdueCount,
          obligationCount: obligationsWithCharge.length,
        },
        obligations: obligationsWithCharge,
        payments,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
