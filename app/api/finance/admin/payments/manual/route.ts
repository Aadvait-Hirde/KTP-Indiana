import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  assertFinanceEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import {
  ensureFinanceCustomerForUser,
  loadObligationBalancesForUser,
} from "@/lib/finance-server";
import {
  allocateByFifo,
  getAllocationsTotal,
  normalizeManualAllocations,
} from "@/lib/finance-utils";
import type {
  FinanceAllocationInput,
  FinanceAllocationMode,
} from "@/lib/finance-types";

function parsePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireAppAuthContext();
    assertFinanceEditPermission(authContext);

    const body = (await req.json()) as {
      userId?: unknown;
      amountCents?: unknown;
      notes?: unknown;
      allocationMode?: unknown;
      allocations?: unknown;
    };

    if (typeof body.userId !== "string" || body.userId.length === 0) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    const amountCents = parsePositiveInt(body.amountCents);
    if (!amountCents) {
      return NextResponse.json(
        { error: "Amount must be a positive integer in cents." },
        { status: 400 },
      );
    }

    const allocationMode: FinanceAllocationMode =
      body.allocationMode === "manual_selection" ? "manual_selection" : "auto_fifo";

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", body.userId)
      .maybeSingle();

    if (userError) throw userError;

    if (
      !userData ||
      typeof userData.id !== "string" ||
      typeof userData.email !== "string"
    ) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const [ensured, obligations] = await Promise.all([
      ensureFinanceCustomerForUser({
        id: userData.id,
        name: typeof userData.name === "string" ? userData.name : "",
        email: userData.email,
      }),
      loadObligationBalancesForUser(userData.id),
    ]);

    const unpaidObligations = obligations.filter(
      (obligation) => obligation.remaining_cents > 0,
    );

    if (unpaidObligations.length === 0) {
      return NextResponse.json(
        { error: "User has no unpaid obligations." },
        { status: 400 },
      );
    }

    const allocations =
      allocationMode === "manual_selection"
        ? normalizeManualAllocations({
            allocations: Array.isArray(body.allocations)
              ? (body.allocations as FinanceAllocationInput[])
              : [],
            obligationById: new Map(
              unpaidObligations.map((obligation) => [obligation.id, obligation]),
            ),
            amountCents,
          })
        : allocateByFifo({
            obligations: unpaidObligations,
            amountCents,
          });

    const allocatedCents = getAllocationsTotal(allocations);

    if (allocatedCents <= 0) {
      return NextResponse.json(
        { error: "No valid allocations were generated for this payment." },
        { status: 400 },
      );
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from("finance_payments")
      .insert({
        user_id: userData.id,
        customer_id: ensured.customerId,
        source: "manual",
        status: "completed",
        amount_cents: allocatedCents,
        currency: "usd",
        payment_method_label: "Manual payment",
        allocation_mode: allocationMode,
        created_by_user_id: authContext.appUser.id,
        notes: typeof body.notes === "string" ? body.notes.trim() : null,
        pending_allocations_json: null,
      })
      .select("id")
      .single();

    if (paymentError) throw paymentError;

    if (!paymentData || typeof paymentData.id !== "string") {
      throw new Error("Failed to create manual payment record.");
    }

    const allocationPayload = allocations.map((allocation) => ({
      payment_id: paymentData.id,
      obligation_id: allocation.obligationId,
      amount_cents: allocation.amountCents,
    }));

    const { error: allocationError } = await supabase
      .from("finance_payment_allocations")
      .insert(allocationPayload);

    if (allocationError) throw allocationError;

    return NextResponse.json(
      {
        paymentId: paymentData.id,
        userId: userData.id,
        amountCents: allocatedCents,
        allocations,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to record manual finance payment.",
      },
      { status: 500 },
    );
  }
}
