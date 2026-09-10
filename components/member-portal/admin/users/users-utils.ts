import { supabase, User as SupabaseUser } from "@/lib/supabase";

export type EditableFields = Pick<
  SupabaseUser,
  | "name"
  | "email"
  | "major"
  | "avatar"
  | "socials"
  | "graduation_year"
  | "is_alumni"
>;

export type SocialPlatform = "insta" | "linkedin";

export type SocialEntry = {
  platform: SocialPlatform;
  url: string;
};

export type EditState = Partial<
  Omit<EditableFields, "graduation_year" | "is_alumni">
> & {
  linkedinUrl?: string;
  instagramUrl?: string;
  /** Raw text from the input; parsed to a number (or null) on save. */
  graduationYear?: string;
  isAlumni?: boolean;
};

export type RoleOption = {
  id: string;
  name: string;
  priority: number;
};

export type SortKey =
  | "name"
  | "email"
  | "major"
  | "graduation_year"
  | "created_at";

type UserRoleJoinRow = {
  user_id: string | null;
  role_id: string | null;
  roles?:
    | { id?: string | null; name?: string | null }
    | Array<{ id?: string | null; name?: string | null }>
    | null;
};

type LoadUsersDataResult = {
  users: SupabaseUser[];
  roles: RoleOption[];
  userRoleIds: Record<string, string[]>;
};

export const userTableColumns: Array<{
  label: string;
  sortKey?: SortKey;
}> = [
  { label: "User", sortKey: "name" },
  { label: "Roles", sortKey: undefined },
  { label: "Major", sortKey: "major" },
  { label: "Year", sortKey: "graduation_year" },
  { label: "Created", sortKey: "created_at" },
  { label: "", sortKey: undefined },
];

export async function loadUsersData(): Promise<LoadUsersDataResult> {
  const [usersRes, rolesRes, userRolesRes] = await Promise.all([
    supabase.from("users").select("*").order("name", { ascending: true }),
    supabase
      .from("roles")
      .select("id, name, priority")
      .order("priority", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("user_roles").select("user_id, role_id, roles(id, name)"),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (rolesRes.error) throw rolesRes.error;
  if (userRolesRes.error) throw userRolesRes.error;

  const roles = (rolesRes.data ?? []).flatMap((role) => {
    if (typeof role.id !== "string" || typeof role.name !== "string") {
      return [];
    }

    return [
      {
        id: role.id,
        name: role.name,
        priority: typeof role.priority === "number" ? role.priority : 0,
      },
    ];
  });

  const userRoleIds: Record<string, string[]> = {};
  for (const row of (userRolesRes.data ?? []) as UserRoleJoinRow[]) {
    const userId = row.user_id;
    const joinedRole = Array.isArray(row.roles) ? row.roles[0] : row.roles;
    const roleId =
      row.role_id ??
      (joinedRole && typeof joinedRole.id === "string" ? joinedRole.id : null);

    if (!userId || !roleId) continue;
    userRoleIds[userId] = userRoleIds[userId] ?? [];
    if (!userRoleIds[userId].includes(roleId)) {
      userRoleIds[userId].push(roleId);
    }
  }

  return {
    users: usersRes.data ?? [],
    roles,
    userRoleIds,
  };
}

export function getEditableValue(
  currentUser: SupabaseUser,
  editState: Record<string, EditState>,
  field: Exclude<keyof EditState, "isAlumni">,
) {
  const override = editState[currentUser.id]?.[field];
  if (typeof override === "string") return override;
  if (field === "graduationYear") {
    return typeof currentUser.graduation_year === "number"
      ? String(currentUser.graduation_year)
      : "";
  }
  const value = currentUser[field as keyof SupabaseUser];
  return value ? String(value) : "";
}

export function getEditableIsAlumni(
  currentUser: SupabaseUser,
  editState: Record<string, EditState>,
) {
  const override = editState[currentUser.id]?.isAlumni;
  return typeof override === "boolean" ? override : Boolean(currentUser.is_alumni);
}

/**
 * Parses the graduation-year input. Returns undefined when untouched, null when
 * cleared, or the parsed year. Throws on non-numeric or out-of-range input.
 */
export function parseGraduationYearInput(
  value: string | undefined,
): number | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    throw new Error("Graduation year must be a four-digit year.");
  }
  return parsed;
}

export function getSocialUrl(
  currentUser: Pick<SupabaseUser, "socials">,
  platform: SocialPlatform,
) {
  const socials = currentUser.socials as unknown;
  let entries: SocialEntry[] = [];

  const fromRecord = (record: Record<string, unknown>) => {
    const linkedin = typeof record.linkedin === "string" ? record.linkedin : "";
    const insta =
      typeof record.insta === "string"
        ? record.insta
        : typeof record.instagram === "string"
          ? record.instagram
          : "";
    entries = [
      ...(linkedin ? [{ platform: "linkedin" as const, url: linkedin }] : []),
      ...(insta ? [{ platform: "insta" as const, url: insta }] : []),
    ];
  };

  if (Array.isArray(socials)) {
    entries = socials
      .filter(
        (item): item is { platform: SocialPlatform; url: string } =>
          Boolean(item) &&
          typeof item === "object" &&
          "platform" in item &&
          "url" in item &&
          ((item as { platform?: string }).platform === "insta" ||
            (item as { platform?: string }).platform === "linkedin") &&
          typeof (item as { url?: unknown }).url === "string",
      )
      .map((item) => ({ platform: item.platform, url: item.url }));
  } else if (socials && typeof socials === "object") {
    const record = socials as Record<string, unknown>;
    if (typeof record.platform === "string" && typeof record.url === "string") {
      const normalizedPlatform =
        record.platform === "instagram" ? "insta" : record.platform;
      if (normalizedPlatform === "insta" || normalizedPlatform === "linkedin") {
        entries = [{ platform: normalizedPlatform, url: record.url }];
      }
    } else {
      fromRecord(record);
    }
  } else if (typeof socials === "string") {
    try {
      const parsed = JSON.parse(socials) as unknown;
      if (Array.isArray(parsed)) {
        entries = parsed
          .filter(
            (item): item is { platform: SocialPlatform; url: string } =>
              Boolean(item) &&
              typeof item === "object" &&
              "platform" in item &&
              "url" in item &&
              ((item as { platform?: string }).platform === "insta" ||
                (item as { platform?: string }).platform === "linkedin") &&
              typeof (item as { url?: unknown }).url === "string",
          )
          .map((item) => ({ platform: item.platform, url: item.url }));
      } else if (parsed && typeof parsed === "object") {
        fromRecord(parsed as Record<string, unknown>);
      }
    } catch {
      entries = [];
    }
  }

  return entries.find((entry) => entry.platform === platform)?.url ?? "";
}

export function getRoleNameMap(roles: RoleOption[]) {
  return new Map(roles.map((role) => [role.id, role.name]));
}

export function sortRoles(roles: RoleOption[]) {
  return [...roles].sort(
    (a, b) => b.priority - a.priority || a.name.localeCompare(b.name),
  );
}

export function sortUsers(
  users: SupabaseUser[],
  sortKey: SortKey,
  sortDirection: "asc" | "desc",
) {
  return [...users].sort((a, b) => {
    const key = sortKey;
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    if (key === "created_at") {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (key === "graduation_year") {
      const aYear = a.graduation_year ?? Number.POSITIVE_INFINITY;
      const bYear = b.graduation_year ?? Number.POSITIVE_INFINITY;
      return sortDirection === "asc" ? aYear - bYear : bYear - aYear;
    }

    const aText = String(aValue).toLowerCase();
    const bText = String(bValue).toLowerCase();
    if (aText < bText) return sortDirection === "asc" ? -1 : 1;
    if (aText > bText) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

export function toggleRoleIds(
  currentRoleIds: string[],
  roleId: string,
  checked: boolean,
) {
  return checked
    ? Array.from(new Set([...currentRoleIds, roleId]))
    : currentRoleIds.filter((id) => id !== roleId);
}

export function getRoleDiff(currentRoleIds: string[], nextRoleIds: string[]) {
  const currentRoleIdSet = new Set(currentRoleIds);
  const nextRoleIdSet = new Set(nextRoleIds);

  const roleIdsToInsert = nextRoleIds.filter(
    (roleId) => !currentRoleIdSet.has(roleId),
  );
  const roleIdsToDelete = Array.from(currentRoleIdSet).filter(
    (roleId) => !nextRoleIdSet.has(roleId),
  );

  return {
    roleIdsToInsert,
    roleIdsToDelete,
    rolesChanged: roleIdsToInsert.length > 0 || roleIdsToDelete.length > 0,
  };
}

export function buildSocialsUpdate(
  currentUser: SupabaseUser,
  nextState: EditState,
): EditableFields["socials"] | undefined {
  const socialsWereEdited =
    nextState.linkedinUrl !== undefined || nextState.instagramUrl !== undefined;
  if (!socialsWereEdited) return undefined;

  const linkedinUrl = (
    nextState.linkedinUrl ?? getSocialUrl(currentUser, "linkedin")
  ).trim();
  const instagramUrl = (
    nextState.instagramUrl ?? getSocialUrl(currentUser, "insta")
  ).trim();

  return [
    ...(instagramUrl ? [{ platform: "insta", url: instagramUrl }] : []),
    ...(linkedinUrl ? [{ platform: "linkedin", url: linkedinUrl }] : []),
  ] as unknown as EditableFields["socials"];
}

export async function updateUserRecord(
  userId: string,
  updates: Partial<EditableFields>,
) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as SupabaseUser;
}

export async function syncUserRoles(
  userId: string,
  roleIdsToInsert: string[],
  roleIdsToDelete: string[],
) {
  if (roleIdsToDelete.length > 0) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .in("role_id", roleIdsToDelete);

    if (error) throw error;
  }

  if (roleIdsToInsert.length > 0) {
    const { error } = await supabase.from("user_roles").insert(
      roleIdsToInsert.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
      })),
    );

    if (error) throw error;
  }
}

export async function deleteUserRecord(userId: string) {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
}

export async function uploadUserAvatar(userId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}/avatar`,
    { method: "POST", body: formData },
  );

  const payload = (await response.json().catch(() => null)) as
    | { user?: SupabaseUser; error?: string }
    | null;

  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error ?? "Failed to upload profile picture.");
  }

  return payload.user;
}
