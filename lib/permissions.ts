import { getPermissionId, getPermissionKey } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const ADMIN_FINANCE_VIEW = "admin.finance.view";
export const ADMIN_FINANCE_EDIT = "admin.finance.edit";

type RolePermissionRowLike = {
  role_id?: string | null;
  permission_id?: string | null;
  permission_key?: string | null;
  permission?: string | null;
  key?: string | null;
};

type PermissionRowLike = {
  id?: string | null;
  key?: string | null;
  permission_key?: string | null;
  permission?: string | null;
};

function extractRoleIds(rows: Array<{ role_id?: string | null }> | null) {
  if (!rows) return [];
  const roleIds = new Set<string>();

  for (const row of rows) {
    if (typeof row.role_id === "string" && row.role_id.length > 0) {
      roleIds.add(row.role_id);
    }
  }

  return Array.from(roleIds);
}

function extractPermissionKeyFromPermissionRow(row: PermissionRowLike) {
  if (typeof row.key === "string" && row.key.length > 0) return row.key;
  if (typeof row.permission_key === "string" && row.permission_key.length > 0) {
    return row.permission_key;
  }
  if (typeof row.permission === "string" && row.permission.length > 0) {
    return row.permission;
  }
  return null;
}

export function hasPermission(
  permissions: Iterable<string> | null | undefined,
  permissionKey: string,
) {
  if (!permissions) return false;
  for (const key of permissions) {
    if (key === permissionKey) return true;
  }
  return false;
}

export function hasAnyPermission(
  permissions: Iterable<string> | null | undefined,
  permissionKeys: readonly string[],
) {
  if (!permissions || permissionKeys.length === 0) return false;
  const permissionSet = new Set(permissions);
  return permissionKeys.some((key) => permissionSet.has(key));
}

export function canViewFinanceAdmin(permissions: Iterable<string> | null | undefined) {
  return hasAnyPermission(permissions, [ADMIN_FINANCE_VIEW, ADMIN_FINANCE_EDIT]);
}

export function canEditFinanceAdmin(permissions: Iterable<string> | null | undefined) {
  return hasPermission(permissions, ADMIN_FINANCE_EDIT);
}

export async function fetchUserPermissionKeys(userId: string): Promise<string[]> {
  const { data: userRoleRows, error: userRoleError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (userRoleError) {
    throw userRoleError;
  }

  const roleIds = extractRoleIds(userRoleRows as Array<{ role_id?: string | null }>);
  if (roleIds.length === 0) return [];

  const { data: rolePermissionRows, error: rolePermissionError } = await supabase
    .from("role_permissions")
    .select("*")
    .in("role_id", roleIds);

  if (rolePermissionError) {
    throw rolePermissionError;
  }

  const permissionKeys = new Set<string>();
  const permissionIds = new Set<string>();

  for (const row of (rolePermissionRows ?? []) as RolePermissionRowLike[]) {
    const key = getPermissionKey(row);
    if (key) {
      permissionKeys.add(key);
      continue;
    }

    const permissionId = getPermissionId(row);
    if (permissionId) {
      permissionIds.add(permissionId);
    }
  }

  if (permissionIds.size > 0) {
    const { data: permissionRows, error: permissionError } = await supabase
      .from("permissions")
      .select("*");

    if (permissionError) {
      throw permissionError;
    }

    const permissionKeyById = new Map<string, string>();

    for (const row of (permissionRows ?? []) as PermissionRowLike[]) {
      if (typeof row.id !== "string" || row.id.length === 0) continue;
      const key = extractPermissionKeyFromPermissionRow(row);
      if (!key) continue;
      permissionKeyById.set(row.id, key);
    }

    for (const permissionId of permissionIds) {
      const key = permissionKeyById.get(permissionId);
      if (key) {
        permissionKeys.add(key);
      }
    }
  }

  return Array.from(permissionKeys).sort((a, b) => a.localeCompare(b));
}
