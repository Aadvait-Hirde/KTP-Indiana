import type { User as SupabaseUser } from "@/lib/supabase";
import type { AccessReview } from "@/lib/app-user";

export type PendingClerkUser = {
  clerkUserId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  /** An unlinked profile with the same email exists: approving links instead of creating. */
  matchingProfile: { id: string; name: string } | null;
};

export type DeniedClerkUser = PendingClerkUser & {
  note: string | null;
  reviewedAt: string;
  reviewedBy: { id: string; name: string } | null;
};

export type PendingUsersResponse = {
  pending: PendingClerkUser[];
  denied: DeniedClerkUser[];
};

const PENDING_BASE = "/api/admin/users/pending";

async function parseJson<T>(response: Response): Promise<(T & { error?: string }) | null> {
  return (await response.json().catch(() => null)) as (T & { error?: string }) | null;
}

export async function fetchPendingUsers(): Promise<PendingUsersResponse> {
  const response = await fetch(PENDING_BASE, { cache: "no-store" });
  const payload = await parseJson<Partial<PendingUsersResponse>>(response);

  if (!response.ok || !payload || !Array.isArray(payload.pending)) {
    throw new Error(payload?.error ?? "Failed to load pending sign-ups.");
  }

  return {
    pending: payload.pending,
    denied: Array.isArray(payload.denied) ? payload.denied : [],
  };
}

export async function approvePendingUser(
  clerkUserId: string,
  input: { name?: string; roleIds?: string[] } = {},
): Promise<SupabaseUser> {
  const response = await fetch(
    `${PENDING_BASE}/${encodeURIComponent(clerkUserId)}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const payload = await parseJson<{ user?: SupabaseUser }>(response);

  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error ?? "Failed to approve this account.");
  }

  return payload.user;
}

export async function denyPendingUser(
  clerkUserId: string,
  note?: string,
): Promise<AccessReview> {
  const response = await fetch(
    `${PENDING_BASE}/${encodeURIComponent(clerkUserId)}/deny`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note ?? null }),
    },
  );
  const payload = await parseJson<{ review?: AccessReview }>(response);

  if (!response.ok || !payload?.review) {
    throw new Error(payload?.error ?? "Failed to deny this account.");
  }

  return payload.review;
}

export async function clearDenial(clerkUserId: string): Promise<void> {
  const response = await fetch(
    `${PENDING_BASE}/${encodeURIComponent(clerkUserId)}/deny`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    const payload = await parseJson<Record<string, never>>(response);
    throw new Error(payload?.error ?? "Failed to clear this denial.");
  }
}

export function getInitials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "?";
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getDisplayName(user: Pick<PendingClerkUser, "name" | "email">) {
  return user.name?.trim() || user.email || "Unknown account";
}
