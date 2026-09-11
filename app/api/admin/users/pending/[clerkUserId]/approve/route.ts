import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  assertUsersEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { provisionAppUser } from "@/lib/app-user";

type ApproveBody = { name?: unknown; roleIds?: unknown };

function isClerkNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}

/**
 * Approves a pending Clerk sign-up: creates (or links) its public.users
 * profile, assigns any requested roles and clears a previous denial. The
 * email and fallback name always come from Clerk, never from the request.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clerkUserId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertUsersEditPermission(authContext);

    const { clerkUserId } = await context.params;

    const body = ((await req.json().catch(() => ({}))) ?? {}) as ApproveBody;
    const requestedName =
      typeof body.name === "string" && body.name.trim().length > 0
        ? body.name.trim()
        : null;
    const roleIds = Array.isArray(body.roleIds)
      ? body.roleIds.filter(
          (roleId): roleId is string =>
            typeof roleId === "string" && roleId.length > 0,
        )
      : [];

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

    const clerkName =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

    const { user } = await provisionAppUser({
      clerkUserId,
      email,
      name: requestedName ?? clerkName,
      roleIds,
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json(error.toResponseBody(), { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to approve this account.",
      },
      { status: 500 },
    );
  }
}
