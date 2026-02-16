"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";
import { supabase, User as SupabaseUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Instagram,
  Linkedin,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

type EditableFields = Pick<
  SupabaseUser,
  | "name"
  | "email"
  | "role"
  | "title"
  | "major"
  | "class"
  | "pledgeClass"
  | "avatar"
  | "socials"
>;

type SocialPlatform = "insta" | "linkedin";

type SocialEntry = {
  platform: SocialPlatform;
  url: string;
};

type EditState = Partial<EditableFields> & {
  linkedinUrl?: string;
  instagramUrl?: string;
};

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveUserId, setSaveUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [uploadingAvatarUserId, setUploadingAvatarUserId] = useState<
    string | null
  >(null);
  const [removingAvatarUserId, setRemovingAvatarUserId] = useState<
    string | null
  >(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] =
    useState<SupabaseUser | null>(null);
  const [editState, setEditState] = useState<Record<string, EditState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarDialogUserId, setAvatarDialogUserId] = useState<string | null>(
    null,
  );
  const [avatarSourceUrl, setAvatarSourceUrl] = useState<string | null>(null);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarOffset, setAvatarOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    anchorX: number;
    anchorY: number;
  } | null>(null);

  const isExec = user?.role === "exec";

  useEffect(() => {
    if (!isExec) return;

    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        if (isMounted) {
          setUsers(data || []);
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

  useEffect(() => {
    return () => {
      if (avatarSourceUrl) URL.revokeObjectURL(avatarSourceUrl);
    };
  }, [avatarSourceUrl]);

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

  const getEditableValue = (
    currentUser: SupabaseUser,
    field: keyof EditState,
  ) => {
    const override = editState[currentUser.id]?.[field];
    if (typeof override === "string") return override;
    const value = currentUser[field as keyof SupabaseUser];
    return value ? String(value) : "";
  };

  const getSocialUrl = (
    currentUser: SupabaseUser,
    platform: SocialPlatform,
  ) => {
    const socials = currentUser.socials as unknown;
    let entries: SocialEntry[] = [];

    const fromRecord = (record: Record<string, unknown>) => {
      const linkedin =
        typeof record.linkedin === "string" ? record.linkedin : "";
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
      if (
        typeof record.platform === "string" &&
        typeof record.url === "string"
      ) {
        const normalizedPlatform =
          record.platform === "instagram" ? "insta" : record.platform;
        if (
          normalizedPlatform === "insta" ||
          normalizedPlatform === "linkedin"
        ) {
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
      if (nextState.role !== undefined)
        updates.role = nextState.role as SupabaseUser["role"];
      if (nextState.title !== undefined) updates.title = nextState.title;
      if (nextState.major !== undefined) updates.major = nextState.major;
      if (nextState.class !== undefined)
        updates.class = nextState.class as SupabaseUser["class"];
      if (nextState.pledgeClass !== undefined)
        updates.pledgeClass =
          nextState.pledgeClass as SupabaseUser["pledgeClass"];
      if (nextState.avatar !== undefined) updates.avatar = nextState.avatar;
      if (forcedUpdates) Object.assign(updates, forcedUpdates);

      const socialsWereEdited =
        nextState.linkedinUrl !== undefined ||
        nextState.instagramUrl !== undefined;
      if (socialsWereEdited) {
        const linkedinUrl = (
          nextState.linkedinUrl ?? getSocialUrl(currentUser, "linkedin")
        ).trim();
        const instagramUrl = (
          nextState.instagramUrl ?? getSocialUrl(currentUser, "insta")
        ).trim();

        updates.socials = [
          ...(instagramUrl ? [{ platform: "insta", url: instagramUrl }] : []),
          ...(linkedinUrl ? [{ platform: "linkedin", url: linkedinUrl }] : []),
        ] as unknown as EditableFields["socials"];
      }

      if (Object.keys(updates).length === 0) {
        return true;
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", currentUser.id)
        .select("*")
        .single();

      if (error) throw error;

      setUsers((prev) =>
        prev.map((userItem) =>
          userItem.id === currentUser.id ? data : userItem,
        ),
      );
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
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", currentUser.id);

      if (error) throw error;

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

  type SortKey =
    | "name"
    | "email"
    | "role"
    | "title"
    | "major"
    | "class"
    | "pledgeClass"
    | "created_at";

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const tableColumns: Array<{
    label: string;
    sortKey?: SortKey;
  }> = [
    { label: "User", sortKey: "name" },
    { label: "Role", sortKey: "role" },
    { label: "Title", sortKey: "title" },
    { label: "Major", sortKey: "major" },
    { label: "Class", sortKey: "class" },
    { label: "Pledge Class", sortKey: "pledgeClass" },
    { label: "Created", sortKey: "created_at" },
    { label: "", sortKey: undefined },
  ];

  const sortedUsers = [...users].sort((a, b) => {
    const key = sortKey;
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    if (key === "created_at") {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    const aText = String(aValue).toLowerCase();
    const bText = String(bValue).toLowerCase();
    if (aText < bText) return sortDirection === "asc" ? -1 : 1;
    if (aText > bText) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const avatarDialogUser = avatarDialogUserId
    ? (users.find((item) => item.id === avatarDialogUserId) ?? null)
    : null;
  const isAvatarUploading =
    Boolean(avatarDialogUser) && uploadingAvatarUserId === avatarDialogUser?.id;
  const isAvatarRemoving =
    Boolean(avatarDialogUser) && removingAvatarUserId === avatarDialogUser?.id;
  const isAvatarBusy = isAvatarUploading || isAvatarRemoving;

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
            {tableColumns.map((column) => (
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
                colSpan={tableColumns.length}
                className="py-8 text-center text-muted-foreground"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
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
                  <Badge variant="secondary">
                    {currentUser.role
                      ? currentUser.role.toUpperCase()
                      : "NO ROLE"}
                  </Badge>
                </TableCell>
                <TableCell>{currentUser.title || "—"}</TableCell>
                <TableCell>{currentUser.major || "—"}</TableCell>
                <TableCell>{currentUser.class || "—"}</TableCell>
                <TableCell>{currentUser.pledgeClass || "—"}</TableCell>
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
                        onClick={() => setEditingUserId(currentUser.id)}
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
                  <Dialog
                    open={editingUserId === currentUser.id}
                    onOpenChange={(isOpen) => {
                      setEditingUserId(isOpen ? currentUser.id : null);
                    }}
                  >
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Update profile information for {currentUser.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Name</p>
                          <Input
                            value={getEditableValue(currentUser, "name")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "name",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Email</p>
                          <Input
                            value={getEditableValue(currentUser, "email")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "email",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Role</p>
                          <Input
                            value={getEditableValue(currentUser, "role")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "role",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Title</p>
                          <Input
                            value={getEditableValue(currentUser, "title")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "title",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Major</p>
                          <Input
                            value={getEditableValue(currentUser, "major")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "major",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Class</p>
                          <Input
                            value={getEditableValue(currentUser, "class")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "class",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Pledge Class</p>
                          <Input
                            value={getEditableValue(currentUser, "pledgeClass")}
                            onChange={(event) =>
                              handleEditChange(
                                currentUser.id,
                                "pledgeClass",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Instagram URL</p>
                          <div className="relative">
                            <Instagram className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                              className="pl-9"
                              placeholder="https://instagram.com/username"
                              value={
                                getEditableValue(currentUser, "instagramUrl") ||
                                getSocialUrl(currentUser, "insta")
                              }
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "instagramUrl",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">LinkedIn URL</p>
                          <div className="relative">
                            <Linkedin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                              className="pl-9"
                              placeholder="https://linkedin.com/in/username"
                              value={
                                getEditableValue(currentUser, "linkedinUrl") ||
                                getSocialUrl(currentUser, "linkedin")
                              }
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "linkedinUrl",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                      {errors[currentUser.id] && (
                        <p className="text-xs text-red-600">
                          {errors[currentUser.id]}
                        </p>
                      )}
                      <DialogFooter className="gap-2 sm:justify-between">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const saved = await handleSave(currentUser);
                            if (saved) setEditingUserId(null);
                          }}
                          disabled={
                            saveUserId === currentUser.id ||
                            uploadingAvatarUserId === currentUser.id ||
                            removingAvatarUserId === currentUser.id
                          }
                        >
                          {saveUserId === currentUser.id
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={Boolean(pendingDeleteUser)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDeleteUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              {pendingDeleteUser
                ? `Delete ${pendingDeleteUser.name}'s account? This action cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteUser(null)}
              disabled={Boolean(deleteUserId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                !pendingDeleteUser || deleteUserId === pendingDeleteUser.id
              }
              onClick={async () => {
                if (!pendingDeleteUser) return;
                await handleDelete(pendingDeleteUser);
                setPendingDeleteUser(null);
              }}
            >
              {pendingDeleteUser && deleteUserId === pendingDeleteUser.id
                ? "Deleting..."
                : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
