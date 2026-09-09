import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ADMIN_FINANCE_EDIT,
  ADMIN_FINANCE_VIEW,
  fetchUserPermissionKeys,
} from "@/lib/permissions";
import { ensureAppUser } from "@/lib/app-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User as SupabaseUser } from "@/lib/supabase";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
};

export type AppAuthContext = {
  appUser: AppUser;
  profile: SupabaseUser;
  permissions: Set<string>;
};

export class RouteAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseAppUser(row: unknown): AppUser | null {
  if (!row || typeof row !== "object") return null;

  const value = row as {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    role?: unknown;
  };

  if (typeof value.id !== "string") return null;
  if (typeof value.email !== "string") return null;

  return {
    id: value.id,
    name: typeof value.name === "string" ? value.name : "",
    email: value.email,
    role: typeof value.role === "string" ? value.role : null,
  };
}

async function getSignedInIdentity() {
  const authState = await auth();

  if (!authState.userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
  const firstEmail = clerkUser.emailAddresses[0]?.emailAddress;
  const email =
    typeof primaryEmail === "string" && primaryEmail.length > 0
      ? primaryEmail
      : typeof firstEmail === "string" && firstEmail.length > 0
        ? firstEmail
        : null;

  if (!email) {
    return null;
  }

  const fullName =
    clerkUser.fullName ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  return {
    clerkUserId: authState.userId,
    email,
    name: fullName,
  };
}

/**
 * Verifies the Clerk session, links it to a public.users profile (creating one
 * on first sign-in), and loads the user's permission keys. Runs with the
 * Supabase secret key, so it is the trusted path for provisioning.
 */
export async function requireAppAuthContext(): Promise<AppAuthContext> {
  const identity = await getSignedInIdentity();
  if (!identity) {
    throw new RouteAuthError(401, "Unauthorized.");
  }

  let profile: SupabaseUser;
  try {
    ({ user: profile } = await ensureAppUser(identity));
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to load user context.";
    throw new RouteAuthError(500, message);
  }

  const appUser = parseAppUser(profile);
  if (!appUser) {
    throw new RouteAuthError(403, "Not authorized for this application.");
  }

  const permissionKeys = await fetchUserPermissionKeys(appUser.id, supabaseAdmin);

  return {
    appUser,
    profile,
    permissions: new Set(permissionKeys),
  };
}

export function assertFinanceViewPermission(context: AppAuthContext) {
  if (
    !context.permissions.has(ADMIN_FINANCE_VIEW) &&
    !context.permissions.has(ADMIN_FINANCE_EDIT)
  ) {
    throw new RouteAuthError(403, "Missing finance admin view permission.");
  }
}

export function assertFinanceEditPermission(context: AppAuthContext) {
  if (!context.permissions.has(ADMIN_FINANCE_EDIT)) {
    throw new RouteAuthError(403, "Missing finance admin edit permission.");
  }
}
