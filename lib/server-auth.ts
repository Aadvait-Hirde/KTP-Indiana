import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import {
  ADMIN_FINANCE_EDIT,
  ADMIN_FINANCE_VIEW,
  fetchUserPermissionKeys,
} from "@/lib/permissions";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
};

export type AppAuthContext = {
  appUser: AppUser;
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

async function getSignedInEmail() {
  const authState = await auth();

  if (!authState.userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
  if (typeof primaryEmail === "string" && primaryEmail.length > 0) {
    return primaryEmail;
  }

  const firstEmail = clerkUser.emailAddresses[0]?.emailAddress;
  if (typeof firstEmail === "string" && firstEmail.length > 0) {
    return firstEmail;
  }

  return null;
}

export async function requireAppAuthContext(): Promise<AppAuthContext> {
  const email = await getSignedInEmail();
  if (!email) {
    throw new RouteAuthError(401, "Unauthorized.");
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new RouteAuthError(500, error.message || "Failed to load user context.");
  }

  const appUser = parseAppUser(data);
  if (!appUser) {
    throw new RouteAuthError(403, "Not authorized for this application.");
  }

  const permissionKeys = await fetchUserPermissionKeys(appUser.id);

  return {
    appUser,
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
