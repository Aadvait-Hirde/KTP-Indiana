import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { valid: false, error: "Missing customer ID" },
        { status: 400 },
      );
    }

    const customer = await stripe.customers.retrieve(id);

    if (!("deleted" in customer && customer.deleted)) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch (error) {
    console.error("Stripe customer validation error:", error);
    return NextResponse.json(
      { valid: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
