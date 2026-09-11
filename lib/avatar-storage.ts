import "server-only";
import { randomUUID } from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { AVATAR_ALLOWED_TYPES } from "@/lib/avatar-upload";
import type { User as SupabaseUser } from "@/lib/supabase";

const AVATARS_BUCKET = process.env.SUPABASE_AVATARS_BUCKET ?? "avatars";

/**
 * Given a previously stored avatar URL, returns the object path inside the
 * avatars bucket, or null when the URL points somewhere else (external image,
 * different bucket, empty). Used to clean up the replaced file.
 */
function getAvatarObjectPath(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`;
  const index = avatarUrl.indexOf(marker);
  if (index === -1) return null;
  const path = avatarUrl.slice(index + marker.length).split("?")[0];
  return path.length > 0 ? decodeURIComponent(path) : null;
}

function toError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return new Error(message);
  }
  return new Error(fallback);
}

/**
 * Uploads a new profile picture for `userId`, points `users.avatar` at it, and
 * removes the previously stored file. Stored as
 * `<userId>/<timestamp>-<uuid>.<ext>` in the avatars bucket. Storage has no
 * end-user policies, so this runs with the secret key; callers are responsible
 * for authorization (admin permission, or the member's own row).
 *
 * The caller should already have run `validateAvatarFile`. Throws an Error
 * with a readable message on failure; an upload whose DB update fails is
 * rolled back so the bucket stays tidy.
 */
export async function replaceUserAvatar(
  userId: string,
  file: File,
): Promise<SupabaseUser> {
  const extension = AVATAR_ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error("Profile pictures must be a JPEG, PNG, WebP, or GIF image.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id, avatar")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) throw toError(lookupError, "Failed to look up user.");
  if (!existing) throw new Error("User not found.");

  const objectPath = `${userId}/${Date.now()}-${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(objectPath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw toError(uploadError, "Failed to upload profile picture.");

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(objectPath);

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ avatar: publicUrl })
    .eq("id", userId)
    .select("*")
    .single();

  if (updateError || !updated) {
    // Roll back the orphaned upload so the bucket stays tidy.
    await supabase.storage.from(AVATARS_BUCKET).remove([objectPath]);
    throw toError(updateError, "Failed to save profile picture.");
  }

  const previousPath = getAvatarObjectPath(
    typeof existing.avatar === "string" ? existing.avatar : null,
  );
  if (previousPath && previousPath !== objectPath) {
    const { error: removeError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .remove([previousPath]);
    if (removeError) {
      // Not fatal: the new picture is live. Log so it can be cleaned up.
      console.error("Failed to remove replaced avatar:", removeError);
    }
  }

  return updated as SupabaseUser;
}
