import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

async function getCurrentUserProfile() {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
  const name = clerkUser.fullName?.trim();
  const phone = clerkUser.phoneNumbers[0]?.phoneNumber?.trim();

  if (!email) {
    return {
      error: NextResponse.json(
        { error: "Email is required to manage Stripe customer." },
        { status: 400 },
      ),
    };
  }

  return { userId, email, name, phone };
}

async function getMemberByEmail(email: string) {
  const { data: existingUser, error: findUserError } = await supabase
    .from("users")
    .select("id, stripe_customer_id")
    .eq("email", email)
    .single();

  if (findUserError || !existingUser) {
    return {
      error: NextResponse.json(
        { error: "Could not find a matching member record." },
        { status: 404 },
      ),
    };
  }

  return { existingUser };
}

async function validateExistingStripeCustomer(
  userId: string,
  stripeCustomerId: string | null,
) {
  if (!stripeCustomerId) {
    return { customerId: null as string | null, invalidCleared: false };
  }

  try {
    const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
    if (!("deleted" in existingCustomer) || !existingCustomer.deleted) {
      return { customerId: stripeCustomerId, invalidCleared: false };
    }
  } catch (error) {
    const stripeError = error as { code?: string; type?: string };
    const customerMissing =
      stripeError.code === "resource_missing" ||
      stripeError.type === "StripeInvalidRequestError";

    if (!customerMissing) {
      throw error;
    }
  }

  const { error: clearIdError } = await supabase
    .from("users")
    .update({ stripe_customer_id: null })
    .eq("id", userId);

  if (clearIdError) {
    return {
      error: NextResponse.json(
        { error: "Stored Stripe customer id is invalid and could not be cleared." },
        { status: 500 },
      ),
    };
  }

  return { customerId: null as string | null, invalidCleared: true };
}

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    if ("error" in profile) return profile.error;

    const member = await getMemberByEmail(profile.email);
    if ("error" in member) return member.error;

    const validated = await validateExistingStripeCustomer(
      member.existingUser.id,
      member.existingUser.stripe_customer_id,
    );

    if ("error" in validated) return validated.error;

    return NextResponse.json({
      customerId: validated.customerId,
      clearedInvalidCustomerId: validated.invalidCleared,
    });
  } catch (error) {
    console.error("Failed to fetch Stripe customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch Stripe customer." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const profile = await getCurrentUserProfile();
    if ("error" in profile) return profile.error;

    const member = await getMemberByEmail(profile.email);
    if ("error" in member) return member.error;

    const validated = await validateExistingStripeCustomer(
      member.existingUser.id,
      member.existingUser.stripe_customer_id,
    );

    if ("error" in validated) return validated.error;

    if (validated.customerId) {
      return NextResponse.json({
        customerId: validated.customerId,
        alreadyExists: true,
      });
    }

    if (validated.invalidCleared) {
      return NextResponse.json({
        customerId: null,
        alreadyExists: false,
        requiresInitialization: true,
      });
    }

    const customer = await stripe.customers.create({
      email: profile.email,
      ...(profile.name ? { name: profile.name } : {}),
      ...(profile.phone ? { phone: profile.phone } : {}),
      metadata: {
        source: "member-portal",
        clerk_user_id: profile.userId,
      },
    });

    const { error: updateError } = await supabase
      .from("users")
      .update({ stripe_customer_id: customer.id })
      .eq("id", member.existingUser.id);

    if (updateError) {
      return NextResponse.json(
        {
          error:
            "Stripe customer was created, but saving the customer id failed.",
          customerId: customer.id,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ customerId: customer.id, alreadyExists: false });
  } catch (error) {
    console.error("Failed to create Stripe customer:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe customer." },
      { status: 500 },
    );
  }
}
