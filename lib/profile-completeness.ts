import type { RoleType, User } from "@/lib/supabase";

export type ProfileField = "avatar" | "pledge_class" | "major";

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  avatar: "Profile photo",
  pledge_class: "Pledge class",
  major: "Major",
};

/**
 * Returns the profile fields a member is still missing. A profile is
 * considered complete when it has a photo, a major, and at least one
 * pledge-class role.
 */
export function getMissingProfileFields(
  user: Pick<User, "avatar" | "major">,
  roles: Array<{ type: RoleType }>,
): ProfileField[] {
  const missing: ProfileField[] = [];

  if (!user.avatar || user.avatar.trim() === "") missing.push("avatar");
  if (!roles.some((role) => role.type === "pledge_class")) {
    missing.push("pledge_class");
  }
  if (!user.major || user.major.trim() === "") missing.push("major");

  return missing;
}

export function isProfileIncomplete(
  user: Pick<User, "avatar" | "major">,
  roles: Array<{ type: RoleType }>,
): boolean {
  return getMissingProfileFields(user, roles).length > 0;
}
