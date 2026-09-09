import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  assertUsersEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { AVATAR_ALLOWED_TYPES, validateAvatarFile } from "@/lib/avatar-upload";
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

/**
 * Uploads a new profile picture for a user and points users.avatar at it.
 * Stored as `<userId>/<timestamp>-<uuid>.<ext>` in the avatars bucket, which
 * matches the existing profile pictures. Storage has no end-user policies, so
 * this runs with the secret key behind the admin.users.edit permission.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertUsersEditPermission(authContext);

    const { userId } = await context.params;

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Attach the image as the `file` form field." },
        { status: 400 },
      );
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id, avatar")
      .eq("id", userId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const extension = AVATAR_ALLOWED_TYPES[file.type];
    const objectPath = `${userId}/${Date.now()}-${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(objectPath);

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ avatar: publicUrl })
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError) {
      // Roll back the orphaned upload so the bucket stays tidy.
      await supabase.storage.from(AVATARS_BUCKET).remove([objectPath]);
      throw updateError;
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

    return NextResponse.json({ user: updated as SupabaseUser }, { status: 200 });
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload profile picture.",
      },
      { status: 500 },
    );
  }
}
