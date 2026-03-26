import { NextResponse } from "next/server";

const PUBLISHABLE_KEY_CANDIDATES = [
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  process.env.STRIPE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_STRIPE_API_TEST,
];

function getPublishableKey(): string | null {
  const candidate = PUBLISHABLE_KEY_CANDIDATES.find((key): key is string =>
    Boolean(key),
  );

  if (!candidate || !candidate.startsWith("pk_")) {
    return null;
  }

  return candidate;
}

export async function GET() {
  const publishableKey = getPublishableKey();

  if (!publishableKey) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe publishable key. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (recommended) or STRIPE_PUBLISHABLE_KEY to a pk_ value.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ publishableKey });
}
