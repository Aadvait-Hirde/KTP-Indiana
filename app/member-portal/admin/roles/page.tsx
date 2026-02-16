"use client";

import { DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Shield } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CreateRoleFormState,
  DropIndicator,
  PermissionRecord,
  RolePermissionRow,
  RoleRecord,
} from "@/types";
import {
  areSetsEqual,
  clonePermissionMap,
  compareRoles,
  EMPTY_CREATE_FORM,
  getPermissionId,
  getPermissionKey,
  getPermissionSection,
  normalizeRole,
  withSequentialPriorities,
} from "@/lib/utils";
import { RolesListPanel } from "@/components/member-portal/admin/roles-list-panel";
import { RoleDetailsPanel } from "@/components/member-portal/admin/role-details-panel";
import { CreateRoleDialog } from "@/components/member-portal/admin/create-role-dialog";
import { DeleteRoleDialog } from "@/components/member-portal/admin/delete-role-dialog";
import { UnsavedChangesBar } from "@/components/member-portal/admin/unsaved-changes-bar";

export default function AdminRolesPage() {
  const { user } = useAuthStore();
  const isExec = user?.role === "exec";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  const [baseRoles, setBaseRoles] = useState<RoleRecord[]>([]);
  const [draftRoles, setDraftRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [baseRolePermissions, setBaseRolePermissions] = useState<
    Record<string, Set<string>>
  >({});
  const [draftRolePermissions, setDraftRolePermissions] = useState<
    Record<string, Set<string>>
  >({});

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draggedRoleId, setDraggedRoleId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(
    null,
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateRoleFormState>(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const groupedPermissions = useMemo(() => {
    const grouped = new Map<string, PermissionRecord[]>();

    for (const permission of permissions) {
      const section = getPermissionSection(permission.key);
      const current = grouped.get(section) ?? [];
      current.push(permission);
      grouped.set(section, current);
    }

    return Array.from(grouped.entries())
      .map(
        ([section, items]) =>
          [
            section,
            [...items].sort((a, b) => a.key.localeCompare(b.key)),
          ] as const,
      )
      .sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const permissionIdByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const permission of permissions) {
      if (permission.id) {
        map.set(permission.key, permission.id);
      }
    }
    return map;
  }, [permissions]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
        supabase
          .from("roles")
          .select("id, name, description, hidden, priority")
          .order("priority", { ascending: false })
          .order("name", { ascending: true }),
        supabase
          .from("permissions")
          .select("*")
          .order("key", { ascending: true }),
        supabase.from("role_permissions").select("*"),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (permissionsRes.error) throw permissionsRes.error;
      if (rolePermissionsRes.error) throw rolePermissionsRes.error;

      const nextRoles = (rolesRes.data ?? [])
        .map((role) => normalizeRole(role))
        .sort(compareRoles);

      const nextPermissions = (permissionsRes.data ?? [])
        .map((permission) => ({
          id: typeof permission.id === "string" ? permission.id : undefined,
          key:
            typeof permission.key === "string"
              ? permission.key
              : typeof permission.permission_key === "string"
                ? permission.permission_key
                : "",
          description:
            typeof permission.description === "string"
              ? permission.description
              : "",
        }))
        .filter((permission) => permission.key.length > 0);

      const permissionKeyById = new Map<string, string>();
      for (const permission of nextPermissions) {
        if (permission.id) {
          permissionKeyById.set(permission.id, permission.key);
        }
      }

      const permissionMap: Record<string, Set<string>> = {};
      for (const role of nextRoles) {
        permissionMap[role.id] = new Set();
      }

      for (const row of (rolePermissionsRes.data ??
        []) as RolePermissionRow[]) {
        const roleId = row.role_id;
        const permissionKey =
          getPermissionKey(row) ??
          (() => {
            const permissionId = getPermissionId(row);
            if (!permissionId) return null;
            return permissionKeyById.get(permissionId) ?? null;
          })();

        if (!roleId || !permissionKey) continue;
        permissionMap[roleId] = permissionMap[roleId] ?? new Set();
        permissionMap[roleId].add(permissionKey);
      }

      setBaseRoles(nextRoles);
      setDraftRoles(nextRoles);
      setPermissions(nextPermissions);
      setBaseRolePermissions(permissionMap);
      setDraftRolePermissions(clonePermissionMap(permissionMap));
    } catch (error) {
      console.error("Failed to load role management data:", error);
      toast.error("Failed to load roles and permissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isExec) return;
    loadData();
  }, [isExec, loadData]);

  useEffect(() => {
    if (draftRoles.length === 0) {
      setSelectedRoleId(null);
      return;
    }

    if (!selectedRoleId) return;

    if (!draftRoles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(null);
    }
  }, [draftRoles, selectedRoleId]);

  const selectedRole = useMemo(
    () => draftRoles.find((role) => role.id === selectedRoleId) ?? null,
    [draftRoles, selectedRoleId],
  );

  const hasUnsavedChanges = useMemo(() => {
    const baseById = new Map(baseRoles.map((role) => [role.id, role]));
    const draftById = new Map(draftRoles.map((role) => [role.id, role]));

    if (baseById.size !== draftById.size) return true;

    for (const [roleId, draftRole] of draftById) {
      const baseRole = baseById.get(roleId);
      if (!baseRole) return true;
      if (
        baseRole.name !== draftRole.name ||
        baseRole.description !== draftRole.description ||
        baseRole.hidden !== draftRole.hidden ||
        baseRole.priority !== draftRole.priority
      ) {
        return true;
      }
    }

    const roleIds = new Set([
      ...Object.keys(baseRolePermissions),
      ...Object.keys(draftRolePermissions),
    ]);

    for (const roleId of roleIds) {
      const baseSet = baseRolePermissions[roleId] ?? new Set<string>();
      const draftSet = draftRolePermissions[roleId] ?? new Set<string>();
      if (!areSetsEqual(baseSet, draftSet)) return true;
    }

    return false;
  }, [baseRoles, baseRolePermissions, draftRoles, draftRolePermissions]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const warnMessage = "Save or cancel role changes before leaving this page.";

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);
      const sameLocation =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (sameLocation) return;

      event.preventDefault();
      event.stopPropagation();
      toast.warning(warnMessage);
    };

    history.pushState({ unsavedGuard: true }, "", window.location.href);

    const handlePopState = () => {
      history.pushState({ unsavedGuard: true }, "", window.location.href);
      toast.warning(warnMessage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasUnsavedChanges]);

  const openCreateDialog = () => {
    setCreateError("");
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateDialogOpen(true);
  };

  const handleCreateRole = async () => {
    const normalizedName = createForm.name.trim();
    if (!normalizedName) {
      setCreateError("Role name is required.");
      return;
    }

    setIsCreatingRole(true);
    try {
      const { data, error } = await supabase
        .from("roles")
        .insert({
          name: normalizedName,
          description: createForm.description.trim(),
          hidden: createForm.hidden,
          priority: 0,
        })
        .select("id, name, description, hidden, priority")
        .single();

      if (error) throw error;

      const createdRole = normalizeRole(data);

      setBaseRoles((prev) => [...prev, createdRole].sort(compareRoles));
      setDraftRoles((prev) => [...prev, createdRole].sort(compareRoles));
      setBaseRolePermissions((prev) => {
        const next = clonePermissionMap(prev);
        next[createdRole.id] = new Set();
        return next;
      });
      setDraftRolePermissions((prev) => {
        const next = clonePermissionMap(prev);
        next[createdRole.id] = new Set();
        return next;
      });
      setSelectedRoleId(createdRole.id);
      setCreateDialogOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateError("");
      toast.success("Role created.");
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error("Failed to create role.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const updateSelectedRole = (updates: Partial<RoleRecord>) => {
    if (!selectedRoleId) return;
    setDraftRoles((prev) =>
      prev
        .map((role) =>
          role.id === selectedRoleId ? { ...role, ...updates } : role,
        )
        .sort(compareRoles),
    );
  };

  const handleLiveReorderRoles = (
    sourceRoleId: string,
    targetRoleId: string,
    position: "before" | "after",
  ) => {
    if (sourceRoleId === targetRoleId && position === "before") return;

    setDraftRoles((prev) => {
      const sourceIndex = prev.findIndex((role) => role.id === sourceRoleId);
      const targetIndex = prev.findIndex((role) => role.id === targetRoleId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;

      let insertIndex = targetIndex + (position === "after" ? 1 : 0);

      const next = [...prev];
      const [movedRole] = next.splice(sourceIndex, 1);

      if (sourceIndex < insertIndex) insertIndex -= 1;
      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > next.length) insertIndex = next.length;
      if (insertIndex === sourceIndex) return prev;

      next.splice(insertIndex, 0, movedRole);
      return withSequentialPriorities(next);
    });
  };

  const handleDragStartRole = (
    roleId: string,
    event: DragEvent<HTMLButtonElement>,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", roleId);
    setDraggedRoleId(roleId);
  };

  const handleDragOverRole = (
    roleId: string,
    event: DragEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const rect = (
      event.currentTarget as HTMLButtonElement
    ).getBoundingClientRect();
    const position: "before" | "after" =
      event.clientY < rect.top + rect.height / 2 ? "before" : "after";

    setDropIndicator({ roleId, position });

    if (draggedRoleId) {
      handleLiveReorderRoles(draggedRoleId, roleId, position);
    }
  };

  const handleDragLeaveRole = (roleId: string) => {
    setDropIndicator((prev) => (prev?.roleId === roleId ? null : prev));
  };

  const handleDropRole = (
    _roleId: string,
    event: DragEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setDropIndicator(null);
  };

  const handleDragEndRole = () => {
    setDraggedRoleId(null);
    setDropIndicator(null);
  };

  const handleTogglePermission = (permissionKey: string, checked: boolean) => {
    if (!selectedRoleId) return;

    setDraftRolePermissions((prev) => {
      const next = clonePermissionMap(prev);
      const current = new Set(next[selectedRoleId] ?? []);
      if (checked) {
        current.add(permissionKey);
      } else {
        current.delete(permissionKey);
      }
      next[selectedRoleId] = current;
      return next;
    });
  };

  const handleToggleAllPermissions = (checked: boolean) => {
    if (!selectedRoleId) return;

    setDraftRolePermissions((prev) => {
      const next = clonePermissionMap(prev);
      next[selectedRoleId] = checked
        ? new Set(permissions.map((permission) => permission.key))
        : new Set();
      return next;
    });
  };

  const handleTogglePermissionSection = (
    sectionPermissions: PermissionRecord[],
    checked: boolean,
  ) => {
    if (!selectedRoleId) return;

    setDraftRolePermissions((prev) => {
      const next = clonePermissionMap(prev);
      const current = new Set(next[selectedRoleId] ?? []);
      for (const permission of sectionPermissions) {
        if (checked) {
          current.add(permission.key);
        } else {
          current.delete(permission.key);
        }
      }
      next[selectedRoleId] = current;
      return next;
    });
  };

  const handleCancelDraft = () => {
    setDraftRoles([...baseRoles].sort(compareRoles));
    setDraftRolePermissions(clonePermissionMap(baseRolePermissions));
    toast.info("Unsaved role changes were discarded.");
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const baseById = new Map(baseRoles.map((role) => [role.id, role]));

      for (const role of draftRoles) {
        const baseRole = baseById.get(role.id);
        if (!baseRole) continue;

        const changed =
          baseRole.name !== role.name ||
          baseRole.description !== role.description ||
          baseRole.hidden !== role.hidden ||
          baseRole.priority !== role.priority;
        if (!changed) continue;

        const { error } = await supabase
          .from("roles")
          .update({
            name: role.name,
            description: role.description,
            hidden: role.hidden,
            priority: role.priority,
          })
          .eq("id", role.id);

        if (error) throw error;
      }

      const permissionSyncRoleIds = new Set([
        ...draftRoles.map((role) => role.id),
        ...Object.keys(baseRolePermissions),
      ]);

      for (const roleId of permissionSyncRoleIds) {
        const baseSet = baseRolePermissions[roleId] ?? new Set<string>();
        const draftSet = draftRolePermissions[roleId] ?? new Set<string>();
        if (areSetsEqual(baseSet, draftSet)) continue;

        const deleteRes = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", roleId);
        if (deleteRes.error) throw deleteRes.error;

        if (draftSet.size > 0) {
          const permissionKeys = [...draftSet];
          const payloads: Array<Record<string, string>[]> = [];

          const canUsePermissionId = permissionKeys.every((permissionKey) =>
            permissionIdByKey.has(permissionKey),
          );

          if (canUsePermissionId) {
            payloads.push(
              permissionKeys.map((permissionKey) => ({
                role_id: roleId,
                permission_id: permissionIdByKey.get(permissionKey)!,
              })),
            );
          }

          payloads.push(
            permissionKeys.map((permissionKey) => ({
              role_id: roleId,
              permission_key: permissionKey,
            })),
          );
          payloads.push(
            permissionKeys.map((permissionKey) => ({
              role_id: roleId,
              permission: permissionKey,
            })),
          );
          payloads.push(
            permissionKeys.map((permissionKey) => ({
              role_id: roleId,
              key: permissionKey,
            })),
          );

          let inserted = false;
          let lastError: unknown = null;

          for (const payload of payloads) {
            const insertRes = await supabase
              .from("role_permissions")
              .insert(payload);
            if (!insertRes.error) {
              inserted = true;
              break;
            }
            lastError = insertRes.error;
          }

          if (!inserted && lastError) throw lastError;
        }
      }

      toast.success("Roles updated.");
      await loadData();
    } catch (error) {
      console.error("Failed to save role changes:", error);
      toast.error("Failed to save role changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (hasUnsavedChanges) {
      toast.warning("Save or cancel changes before deleting a role.");
      return;
    }

    setIsDeletingRole(true);
    try {
      const deleteJoinRes = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", selectedRole.id);
      if (deleteJoinRes.error) throw deleteJoinRes.error;

      const deleteRoleRes = await supabase
        .from("roles")
        .delete()
        .eq("id", selectedRole.id);
      if (deleteRoleRes.error) throw deleteRoleRes.error;

      setBaseRoles((prev) =>
        prev.filter((role) => role.id !== selectedRole.id),
      );
      setDraftRoles((prev) =>
        prev.filter((role) => role.id !== selectedRole.id),
      );
      setBaseRolePermissions((prev) => {
        const next = clonePermissionMap(prev);
        delete next[selectedRole.id];
        return next;
      });
      setDraftRolePermissions((prev) => {
        const next = clonePermissionMap(prev);
        delete next[selectedRole.id];
        return next;
      });

      setSelectedRoleId(null);
      setDeleteDialogOpen(false);
      toast.success("Role deleted.");
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role.");
    } finally {
      setIsDeletingRole(false);
    }
  };

  if (!isExec) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-xl rounded-lg border bg-background p-4 md:p-6">
          <h2 className="text-lg font-semibold">Admin Access Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-20 md:gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold md:text-3xl">Role Management</h1>
          <p className="text-sm text-muted-foreground">
            Select a role to edit details and permissions.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Create Role
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      ) : draftRoles.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Shield className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No roles found</EmptyTitle>
            <EmptyDescription>
              Create a role to start managing access controls.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" />
              Create Role
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="relative flex-1 min-h-0">
          <div className="flex min-h-full flex-col gap-4 md:flex-row md:gap-6">
            <RolesListPanel
              roles={draftRoles}
              selectedRoleId={selectedRoleId}
              hasUnsavedChanges={hasUnsavedChanges}
              dropIndicator={dropIndicator}
              onSelectRole={setSelectedRoleId}
              onBlockedSelect={() =>
                toast.warning("Save or cancel changes before switching roles.")
              }
              onDragStartRole={handleDragStartRole}
              onDragOverRole={handleDragOverRole}
              onDragLeaveRole={handleDragLeaveRole}
              onDropRole={handleDropRole}
              onDragEndRole={handleDragEndRole}
            />

            <Separator orientation="vertical" className="hidden md:block" />
            <Separator orientation="horizontal" className="md:hidden" />

            <div className="min-w-0 flex-1 self-stretch">
              <RoleDetailsPanel
                selectedRole={selectedRole}
                groupedPermissions={groupedPermissions}
                permissions={permissions}
                draftRolePermissions={draftRolePermissions}
                isDeletingRole={isDeletingRole}
                onUpdateRole={updateSelectedRole}
                onToggleAllPermissions={handleToggleAllPermissions}
                onTogglePermissionSection={handleTogglePermissionSection}
                onTogglePermission={handleTogglePermission}
                onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
              />
            </div>
          </div>

          {hasUnsavedChanges ? (
            <UnsavedChangesBar
              isSaving={isSaving}
              onCancelChanges={handleCancelDraft}
              onSaveChanges={handleSaveDraft}
            />
          ) : null}
        </div>
      )}

      <CreateRoleDialog
        open={createDialogOpen}
        form={createForm}
        error={createError}
        isCreatingRole={isCreatingRole}
        onOpenChange={setCreateDialogOpen}
        onFormChange={setCreateForm}
        onSubmit={handleCreateRole}
        onCancel={() => {
          setCreateDialogOpen(false);
          setCreateError("");
        }}
      />

      <DeleteRoleDialog
        open={deleteDialogOpen}
        roleName={selectedRole?.name}
        isDeletingRole={isDeletingRole}
        onOpenChange={setDeleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteRole}
      />
    </div>
  );
}
