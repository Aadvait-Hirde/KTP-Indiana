import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  assertFinanceViewPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { loadBasicUsersByIds } from "@/lib/finance-server";

type FinancePaymentRow = {
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
  created_by_user_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type FinanceAllocationRow = {
  payment_id?: string;
  obligation_id?: string;
  amount_cents?: number;
};

export async function GET() {
  try {
    const authContext = await requireAppAuthContext();
    assertFinanceViewPermission(authContext);

    const { data: paymentRows, error: paymentError } = await supabase
      .from("finance_payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (paymentError) throw paymentError;

    const payments = (paymentRows ?? []) as FinancePaymentRow[];
    const paymentIds = payments
      .flatMap((row) => (typeof row.id === "string" ? [row.id] : []));

    const [allocationRes, usersById] = await Promise.all([
      paymentIds.length > 0
        ? supabase
            .from("finance_payment_allocations")
            .select("payment_id, obligation_id, amount_cents")
            .in("payment_id", paymentIds)
        : Promise.resolve({ data: [], error: null }),
      loadBasicUsersByIds(
        Array.from(
          new Set(
            payments.flatMap((row) =>
              typeof row.user_id === "string" ? [row.user_id] : [],
            ),
          ),
        ),
      ),
    ]);

    if (allocationRes.error) throw allocationRes.error;

    const allocationsByPaymentId = new Map<
      string,
      Array<{ obligationId: string; amountCents: number }>
    >();

    for (const row of (allocationRes.data ?? []) as FinanceAllocationRow[]) {
      if (
        typeof row.payment_id !== "string" ||
        typeof row.obligation_id !== "string" ||
        typeof row.amount_cents !== "number"
      ) {
        continue;
      }

      const entries = allocationsByPaymentId.get(row.payment_id) ?? [];
      entries.push({
        obligationId: row.obligation_id,
        amountCents: row.amount_cents,
      });
      allocationsByPaymentId.set(row.payment_id, entries);
    }

    const response = payments.flatMap((payment) => {
      if (
        typeof payment.id !== "string" ||
        typeof payment.user_id !== "string" ||
        typeof payment.amount_cents !== "number" ||
        typeof payment.source !== "string" ||
        typeof payment.status !== "string" ||
        typeof payment.allocation_mode !== "string" ||
        typeof payment.created_at !== "string"
      ) {
        return [];
      }

      const user = usersById.get(payment.user_id);
      const allocations = allocationsByPaymentId.get(payment.id) ?? [];
      const allocatedCents = allocations.reduce((sum, entry) => sum + entry.amountCents, 0);

      return [
        {
          id: payment.id,
          userId: payment.user_id,
          userName: user?.name ?? "Unknown User",
          userEmail: user?.email ?? "",
          customerId:
            typeof payment.customer_id === "string" ? payment.customer_id : null,
          source: payment.source,
          status: payment.status,
          amountCents: payment.amount_cents,
          allocatedCents,
          currency: typeof payment.currency === "string" ? payment.currency : "usd",
          stripePaymentIntentId:
            typeof payment.stripe_payment_intent_id === "string"
              ? payment.stripe_payment_intent_id
              : null,
          paymentMethodLabel:
            typeof payment.payment_method_label === "string"
              ? payment.payment_method_label
              : null,
          allocationMode: payment.allocation_mode,
          notes: typeof payment.notes === "string" ? payment.notes : null,
          createdAt: payment.created_at,
          allocations,
        },
      ];
    });

    return NextResponse.json({ payments: response }, { status: 200 });
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load finance payments.",
      },
      { status: 500 },
    );
  }
}
