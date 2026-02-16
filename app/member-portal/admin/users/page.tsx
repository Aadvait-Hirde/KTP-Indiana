"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { User as SupabaseUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  EditDialogSection,
  EditUserDialog,
} from "@/components/member-portal/admin/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/member-portal/admin/users/delete-user-dialog";
import {
  EditState,
  EditableFields,
  RoleOption,
  SortKey,
  buildSocialsUpdate,
  deleteUserRecord,
  getEditableValue,
  getRoleDiff,
  getRoleNameMap,
  getSocialUrl,
  loadUsersData,
  sortRoles,
  sortUsers,
  syncUserRoles,
  toggleRoleIds,
  updateUserRecord,
  userTableColumns,
} from "@/components/member-portal/admin/users/users-utils";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [userRoleIds, setUserRoleIds] = useState<Record<string, string[]>>({});
  const [editRoleIds, setEditRoleIds] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveUserId, setSaveUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] =
    useState<SupabaseUser | null>(null);
  const [editState, setEditState] = useState<Record<string, EditState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editDialogSection, setEditDialogSection] =
    useState<EditDialogSection>("profile");

  const isExec = user?.role === "exec";

  useEffect(() => {
    if (!isExec) return;

    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        const { users, roles, userRoleIds } = await loadUsersData();

        if (isMounted) {
          setUsers(users);
          setRoles(roles);
          setUserRoleIds(userRoleIds);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [isExec]);

  const handleEditChange = (
    userId: string,
    field: keyof EditState,
    value: string,
  ) => {
    setEditState((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] ?? {}),
        [field]: value,
      },
    }));
  };

  const getEditableRoleIds = (currentUserId: string) =>
    editRoleIds[currentUserId] ?? userRoleIds[currentUserId] ?? [];

  const handleRoleToggle = (
    currentUserId: string,
    roleId: string,
    checked: boolean,
  ) => {
    setEditRoleIds((prev) => {
      const current = prev[currentUserId] ?? userRoleIds[currentUserId] ?? [];
      const next = toggleRoleIds(current, roleId, checked);

      return { ...prev, [currentUserId]: next };
    });
  };

  const handleSave = async (
    currentUser: SupabaseUser,
    forcedUpdates?: Partial<EditableFields>,
  ) => {
    setErrors((prev) => ({ ...prev, [currentUser.id]: "" }));
    setSaveUserId(currentUser.id);

    try {
      const updates: Partial<EditableFields> = {};
      const nextState = editState[currentUser.id] ?? {};

      if (nextState.name !== undefined) updates.name = nextState.name;
      if (nextState.email !== undefined) updates.email = nextState.email;
      if (nextState.major !== undefined) updates.major = nextState.major;
      if (nextState.avatar !== undefined) updates.avatar = nextState.avatar;
      if (forcedUpdates) Object.assign(updates, forcedUpdates);
      const socialsUpdate = buildSocialsUpdate(currentUser, nextState);
      if (socialsUpdate !== undefined) updates.socials = socialsUpdate;

      const nextRoleIds = getEditableRoleIds(currentUser.id);
      const { roleIdsToInsert, roleIdsToDelete, rolesChanged } = getRoleDiff(
        userRoleIds[currentUser.id] ?? [],
        nextRoleIds,
      );
      const userFieldsChanged = Object.keys(updates).length > 0;

      if (!userFieldsChanged && !rolesChanged) {
        return true;
      }

      if (userFieldsChanged) {
        const data = await updateUserRecord(currentUser.id, updates);

        setUsers((prev) =>
          prev.map((userItem) =>
            userItem.id === currentUser.id ? data : userItem,
          ),
        );
      }

      await syncUserRoles(currentUser.id, roleIdsToInsert, roleIdsToDelete);

      if (rolesChanged) {
        setUserRoleIds((prev) => ({
          ...prev,
          [currentUser.id]: nextRoleIds,
        }));
        setEditRoleIds((prev) => {
          const next = { ...prev };
          delete next[currentUser.id];
          return next;
        });
      }
      return true;
    } catch (err) {
      console.error("Failed to update user:", err);
      setErrors((prev) => ({
        ...prev,
        [currentUser.id]: "Failed to update user. Please try again.",
      }));
      return false;
    } finally {
      setSaveUserId(null);
    }
  };

  const handleDelete = async (currentUser: SupabaseUser) => {
    setDeleteUserId(currentUser.id);
    try {
      await deleteUserRecord(currentUser.id);

      setUsers((prev) =>
        prev.filter((userItem) => userItem.id !== currentUser.id),
      );
    } catch (err) {
      console.error("Failed to delete user:", err);
      setErrors((prev) => ({
        ...prev,
        [currentUser.id]: "Failed to delete user.",
      }));
    } finally {
      setDeleteUserId(null);
    }
  };

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const roleNameById = useMemo(() => getRoleNameMap(roles), [roles]);
  const sortedRoles = useMemo(() => sortRoles(roles), [roles]);
  const sortedUsers = useMemo(
    () => sortUsers(users, sortKey, sortDirection),
    [users, sortKey, sortDirection],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  if (!isExec) {
    return (
      <div className="p-4 md:p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Review member profiles, update details, or remove accounts.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {userTableColumns.map((column) => (
              <TableHead key={column.label || "actions"}>
                {column.sortKey ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-0 hover:bg-transparent hover:underline"
                    onClick={() => handleSort(column.sortKey!)}
                  >
                    {column.label}
                    {sortKey === column.sortKey
                      ? sortDirection === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </Button>
                ) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={userTableColumns.length}
                className="py-8 text-center text-muted-foreground"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={userTableColumns.length}
                className="py-8 text-center text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((currentUser) => (
              <TableRow key={currentUser.id}>
                <TableCell className="min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="h-10 w-10 rounded-lg">
                        {currentUser.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(userRoleIds[currentUser.id] ?? []).length > 0 ? (
                      (userRoleIds[currentUser.id] ?? []).map((roleId) => (
                        <Badge key={roleId} variant="secondary">
                          {roleNameById.get(roleId) ?? "Unknown Role"}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">NO ROLES</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{currentUser.major || "—"}</TableCell>
                <TableCell>
                  {currentUser.created_at
                    ? format(new Date(currentUser.created_at), "PPP")
                    : "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditDialogSection("profile");
                          setEditRoleIds((prev) => ({
                            ...prev,
                            [currentUser.id]: [
                              ...(userRoleIds[currentUser.id] ?? []),
                            ],
                          }));
                          setEditingUserId(currentUser.id);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setPendingDeleteUser(currentUser)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <EditUserDialog
                    currentUser={currentUser}
                    open={editingUserId === currentUser.id}
                    section={editDialogSection}
                    values={{
                      name: getEditableValue(currentUser, editState, "name"),
                      email: getEditableValue(currentUser, editState, "email"),
                      major: getEditableValue(currentUser, editState, "major"),
                      instagramUrl:
                        getEditableValue(
                          currentUser,
                          editState,
                          "instagramUrl",
                        ) || getSocialUrl(currentUser, "insta"),
                      linkedinUrl:
                        getEditableValue(
                          currentUser,
                          editState,
                          "linkedinUrl",
                        ) || getSocialUrl(currentUser, "linkedin"),
                    }}
                    roles={sortedRoles}
                    selectedRoleIds={getEditableRoleIds(currentUser.id)}
                    error={errors[currentUser.id]}
                    isSaving={saveUserId === currentUser.id}
                    onOpenChange={(isOpen) => {
                      setEditingUserId(isOpen ? currentUser.id : null);
                      if (isOpen) {
                        setEditDialogSection("profile");
                        setEditRoleIds((prev) => ({
                          ...prev,
                          [currentUser.id]: [
                            ...(userRoleIds[currentUser.id] ?? []),
                          ],
                        }));
                      } else {
                        setEditRoleIds((prev) => {
                          const next = { ...prev };
                          delete next[currentUser.id];
                          return next;
                        });
                      }
                    }}
                    onSectionChange={setEditDialogSection}
                    onFieldChange={(field, value) =>
                      handleEditChange(currentUser.id, field, value)
                    }
                    onRoleToggle={(roleId, checked) =>
                      handleRoleToggle(currentUser.id, roleId, checked)
                    }
                    onSave={async () => {
                      const saved = await handleSave(currentUser);
                      if (saved) setEditingUserId(null);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <DeleteUserDialog
        open={Boolean(pendingDeleteUser)}
        userName={pendingDeleteUser?.name}
        isDeleting={Boolean(
          pendingDeleteUser && deleteUserId === pendingDeleteUser.id,
        )}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDeleteUser(null);
        }}
        onCancel={() => setPendingDeleteUser(null)}
        onConfirm={async () => {
          if (!pendingDeleteUser) return;
          await handleDelete(pendingDeleteUser);
          setPendingDeleteUser(null);
        }}
      />
    </div>
  );
}
