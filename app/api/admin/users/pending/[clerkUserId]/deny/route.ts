import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  assertUsersEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { clearAppUserDenial, denyAppUserAccess } from "@/lib/app-user";

type DenyBody = { note?: unknown };

function isClerkNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof RouteAuthError) {
    return NextResponse.json(error.toResponseBody(), { status: error.status });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 },
  );
}

/** Records a denial for a pending Clerk sign-up. */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clerkUserId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertUsersEditPermission(authContext);

    const { clerkUserId } = await context.params;
    const body = ((await req.json().catch(() => ({}))) ?? {}) as DenyBody;
    const note = typeof body.note === "string" ? body.note : null;

    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { error: "CLERK_SECRET_KEY is not configured." },
        { status: 503 },
      );
    }

    const client = await clerkClient();
    let clerkUser;
    try {
      clerkUser = await client.users.getUser(clerkUserId);
    } catch (error) {
      if (isClerkNotFound(error)) {
        return NextResponse.json(
          { error: "Clerk account not found." },
          { status: 404 },
        );
      }
      throw error;
    }

    const primary = clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    );
    const email =
      primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json(
        { error: "This Clerk account has no email address." },
        { status: 400 },
      );
    }

    const name =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

    const review = await denyAppUserAccess({
      clerkUserId,
      email,
      name,
      note,
      reviewedBy: authContext.appUser.id,
    });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error) {
    return errorResponse(error, "Failed to deny this account.");
  }
}

/** Clears a recorded denial so the account returns to the pending list. */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ clerkUserId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertUsersEditPermission(authContext);

    const { clerkUserId } = await context.params;
    await clearAppUserDenial(clerkUserId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return errorResponse(error, "Failed to clear this denial.");
  }
}
