import { NextRequest, NextResponse } from "next/server";
import {
  assertFinanceEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { supabase } from "@/lib/supabase";
import { ensureFinanceCustomerForUser } from "@/lib/finance-server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertFinanceEditPermission(authContext);

    const { userId } = await context.params;

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || typeof data.id !== "string" || typeof data.email !== "string") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const ensured = await ensureFinanceCustomerForUser({
      id: data.id,
      name: typeof data.name === "string" ? data.name : "",
      email: data.email,
    });

    return NextResponse.json(
      {
        userId: data.id,
        customerId: ensured.customerId,
        stripeCustomerId: ensured.stripeCustomerId,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to enable finance.",
      },
      { status: 500 },
    );
  }
}
