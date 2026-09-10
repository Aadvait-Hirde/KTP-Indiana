import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User as SupabaseUser } from "@/lib/supabase";

/**
 * Server-only. Resolves a verified Clerk identity to a public.users profile,
 * creating the profile or linking a pre-existing (email-matched) profile to
 * the Clerk account on first sign-in. RLS policies resolve the current user
 * through users.clerk_user_id, so every signed-in member must be linked here.
 */

type EnsureAppUserParams = {
  clerkUserId: string;
  email: string;
  name?: string | null;
};

type EnsureAppUserResult = {
  user: SupabaseUser;
  created: boolean;
  linked: boolean;
};

const UNIQUE_VIOLATION = "23505";

function buildFallbackName(email: string) {
  const localPart = email.split("@")[0] ?? "Member";
  const tokens = localPart
    .split(/[._-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return "Member";

  return tokens
    .map((token) => token[0].toUpperCase() + token.slice(1))
    .join(" ");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeName(name: string | null | undefined, email: string) {
  const value = name?.trim();
  return value && value.length > 0 ? value : buildFallbackName(email);
}

function buildNewUserPayload({
  clerkUserId,
  email,
  name,
}: {
  clerkUserId: string;
  email: string;
  name: string;
}): Record<string, unknown> {
  return {
    clerk_user_id: clerkUserId,
    email,
    name,
    role: "newmember",
    avatar: "",
    major: "",
    graduation_year: null,
    is_alumni: false,
    title: "",
    socials: [],
  };
}

export async function findAppUserByClerkId(clerkUserId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) throw error;

  return (data as SupabaseUser | null) ?? null;
}

export async function findAppUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;

  return (data as SupabaseUser | null) ?? null;
}

async function linkAppUserToClerk(userId: string, clerkUserId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ clerk_user_id: clerkUserId })
    .eq("id", userId)
    .is("clerk_user_id", null)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return (data as SupabaseUser | null) ?? null;
}

export async function ensureAppUser({
  clerkUserId,
  email,
  name,
}: EnsureAppUserParams): Promise<EnsureAppUserResult> {
  const normalizedEmail = normalizeEmail(email);

  const linkedUser = await findAppUserByClerkId(clerkUserId);
  if (linkedUser) {
    return { user: linkedUser, created: false, linked: false };
  }

  const existingByEmail = await findAppUserByEmail(normalizedEmail);
  if (existingByEmail) {
    if (
      existingByEmail.clerk_user_id &&
      existingByEmail.clerk_user_id !== clerkUserId
    ) {
      throw new Error(
        `The profile for ${normalizedEmail} is already linked to a different sign-in account.`,
      );
    }

    const linked = await linkAppUserToClerk(existingByEmail.id, clerkUserId);
    if (linked) {
      return { user: linked, created: false, linked: true };
    }

    // Lost a race with a concurrent link; re-read the row.
    const raced = await findAppUserByClerkId(clerkUserId);
    if (raced) {
      return { user: raced, created: false, linked: false };
    }

    throw new Error(`Failed to link profile for ${normalizedEmail}.`);
  }

  const payload = buildNewUserPayload({
    clerkUserId,
    email: normalizedEmail,
    name: normalizeName(name, normalizedEmail),
  });

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert(payload)
    .select("*")
    .single();

  if (!error && data) {
    return { user: data as SupabaseUser, created: true, linked: true };
  }

  if (error?.code === UNIQUE_VIOLATION) {
    const raced =
      (await findAppUserByClerkId(clerkUserId)) ??
      (await findAppUserByEmail(normalizedEmail));
    if (raced) {
      return { user: raced, created: false, linked: false };
    }
  }

  throw error ?? new Error("Failed to provision app user.");
}
