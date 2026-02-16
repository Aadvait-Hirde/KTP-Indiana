"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { supabase, User as SupabaseUser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { MoreHorizontal, Trash2, UserCog } from "lucide-react";

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

type EditState = Partial<EditableFields> & { socialsText?: string };

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveUserId, setSaveUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Record<string, EditState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (field === "socialsText") {
      return JSON.stringify(currentUser.socials ?? {}, null, 2);
    }
    const value = currentUser[field as keyof SupabaseUser];
    return value ? String(value) : "";
  };

  const handleSave = async (currentUser: SupabaseUser) => {
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

      if (nextState.socialsText !== undefined) {
        try {
          updates.socials = JSON.parse(nextState.socialsText);
        } catch (err) {
          setErrors((prev) => ({
            ...prev,
            [currentUser.id]: "Socials must be valid JSON.",
          }));
          return;
        }
      }

      if (Object.keys(updates).length === 0) {
        return;
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
    } catch (err) {
      console.error("Failed to update user:", err);
      setErrors((prev) => ({
        ...prev,
        [currentUser.id]: "Failed to update user. Please try again.",
      }));
    } finally {
      setSaveUserId(null);
    }
  };

  const handleDelete = async (currentUser: SupabaseUser) => {
    if (
      !confirm(
        `Delete ${currentUser.name}'s account? This action cannot be undone.`,
      )
    ) {
      return;
    }

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
      <Card>
        <CardContent>
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
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback>
                            {currentUser.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {currentUser.name}
                          </div>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 space-y-3">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold">Manage User</p>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Name"
                              value={getEditableValue(currentUser, "name")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Email"
                              value={getEditableValue(currentUser, "email")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "email",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Role"
                              value={getEditableValue(currentUser, "role")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "role",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Title"
                              value={getEditableValue(currentUser, "title")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "title",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Major"
                              value={getEditableValue(currentUser, "major")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "major",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Class"
                              value={getEditableValue(currentUser, "class")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "class",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Pledge Class"
                              value={getEditableValue(
                                currentUser,
                                "pledgeClass",
                              )}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "pledgeClass",
                                  event.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Avatar URL"
                              value={getEditableValue(currentUser, "avatar")}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "avatar",
                                  event.target.value,
                                )
                              }
                            />
                            <Textarea
                              rows={4}
                              placeholder='Socials JSON (e.g. {"linkedin":"..."} )'
                              value={getEditableValue(
                                currentUser,
                                "socialsText",
                              )}
                              onChange={(event) =>
                                handleEditChange(
                                  currentUser.id,
                                  "socialsText",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          {errors[currentUser.id] && (
                            <p className="text-xs text-red-600">
                              {errors[currentUser.id]}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSave(currentUser)}
                              disabled={saveUserId === currentUser.id}
                            >
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(currentUser)}
                              disabled={deleteUserId === currentUser.id}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
