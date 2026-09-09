import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client authenticated with the project secret key.
 * It bypasses RLS, so it must never be imported from client components.
 * Use it for trusted work such as provisioning and linking profiles.
 */
if (typeof window !== "undefined") {
  throw new Error("lib/supabase-admin must only be imported on the server.");
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. The server needs it to provision and link profiles.",
    );
  }

  cachedClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
