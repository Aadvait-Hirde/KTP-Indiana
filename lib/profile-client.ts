import type { User as SupabaseUser } from "@/lib/supabase";

/**
 * Browser helper: uploads a (pre-cropped, pre-validated) image as the
 * signed-in member's own profile picture and returns the refreshed profile.
 */
export async function uploadMyAvatar(file: File): Promise<SupabaseUser> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/me/avatar", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { user?: SupabaseUser; error?: string }
    | null;

  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error ?? "Failed to upload profile picture.");
  }

  return payload.user;
}
