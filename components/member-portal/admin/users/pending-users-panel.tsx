"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Clock,
  Link2,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import type { User as SupabaseUser } from "@/lib/supabase";
import type { RoleOption } from "@/components/member-portal/admin/users/users-utils";
import {
  approvePendingUser,
  clearDenial,
  denyPendingUser,
  fetchPendingUsers,
  getDisplayName,
  getInitials,
  type DeniedClerkUser,
  type PendingClerkUser,
} from "@/components/member-portal/admin/users/pending-users-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type PendingUsersPanelProps = {
  /** admin.users.edit; when false the panel is read-only. */
  canEdit: boolean;
  /** From users-utils, already sorted by priority. */
  roles: RoleOption[];
  /** The page appends the new profile to its members list. */
  onApproved?: (user: SupabaseUser) => void;
  /** The page shows a count badge on the tab. */
  onCountChange?: (pendingCount: number) => void;
};

type ApproveTarget = PendingClerkUser | DeniedClerkUser;

function formatRelative(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

function AccountIdentity({ user }: { user: PendingClerkUser }) {
  const displayName = getDisplayName(user);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-10 w-10 rounded-lg">
        <AvatarImage
          src={user.imageUrl ?? undefined}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="h-10 w-10 rounded-lg text-sm">
          {getInitials(user.name, user.email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        {user.email ? (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        ) : null}
      </div>
    </div>
  );
}

type ApproveUserDialogProps = {
  target: ApproveTarget | null;
  roles: RoleOption[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: { name: string; roleIds: string[] }) => Promise<void>;
};

function ApproveUserDialog({
  target,
  roles,
  isSaving,
  onOpenChange,
  onConfirm,
}: ApproveUserDialogProps) {
  const [name, setName] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset the form whenever a different account is opened.
  useEffect(() => {
    if (!target) return;
    setName(target.matchingProfile?.name ?? target.name ?? "");
    setSelectedRoleIds([]);
    setError(null);
  }, [target]);

  const isLinking = Boolean(target?.matchingProfile);

  const groupedRoles = useMemo(() => {
    const pledgeClasses = roles.filter((role) => role.type === "pledge_class");
    const others = roles.filter((role) => role.type !== "pledge_class");
    return [
      { label: "Pledge classes", roles: pledgeClasses },
      { label: "Other roles", roles: others },
    ].filter((group) => group.roles.length > 0);
  }, [roles]);

  const toggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((current) =>
      checked
        ? Array.from(new Set([...current, roleId]))
        : current.filter((id) => id !== roleId),
    );
  };

  const handleConfirm = async () => {
    if (!isLinking && name.trim().length === 0) {
      setError("Enter a name for the new profile.");
      return;
    }
    setError(null);
    try {
      await onConfirm({ name: name.trim(), roleIds: selectedRoleIds });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    }
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve Account</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Grant portal access to{" "}
                <span className="font-medium text-foreground">
                  {target.email ?? getDisplayName(target)}
                </span>
                .
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <Input
              value={name}
              disabled={isLinking || isSaving}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
            {isLinking && target?.matchingProfile ? (
              <p className="text-xs text-muted-foreground">
                An existing profile for{" "}
                <span className="font-medium">{target.matchingProfile.name}</span>{" "}
                shares this email. Approving links the sign-in to that profile
                and keeps its name.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Prefilled from the sign-in account. You can change it later.
              </p>
            )}
          </div>

          <div className="flex min-h-0 flex-col space-y-2">
            <div>
              <p className="text-sm font-medium">Roles</p>
              <p className="text-xs text-muted-foreground">
                Optional. Pick a pledge class or any other roles to assign now.
              </p>
            </div>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles available.</p>
            ) : (
              <ScrollArea className="max-h-64 rounded-md border p-2">
                <div className="space-y-3">
                  {groupedRoles.map((group) => (
                    <div key={group.label ?? "all"} className="space-y-2">
                      {group.label ? (
                        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {group.label}
                        </p>
                      ) : null}
                      {group.roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                        >
                          <span className="text-sm">{role.name}</span>
                          <Switch
                            checked={selectedRoleIds.includes(role.id)}
                            disabled={isSaving}
                            onCheckedChange={(checked) =>
                              toggleRole(role.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
            {isSaving
              ? "Approving..."
              : isLinking
                ? "Approve & Link Profile"
                : "Approve & Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DenyUserDialogProps = {
  target: PendingClerkUser | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => Promise<void>;
};

function DenyUserDialog({
  target,
  isSaving,
  onOpenChange,
  onConfirm,
}: DenyUserDialogProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setNote("");
    setError(null);
  }, [target]);

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm(note.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deny.");
    }
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deny Access</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                <span className="font-medium text-foreground">
                  {target.email ?? getDisplayName(target)}
                </span>{" "}
                will see a message that access was declined. You can approve
                them later from the Denied list.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <p className="text-sm font-medium">Note (optional)</p>
          <Textarea
            value={note}
            disabled={isSaving}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why this account was denied, for other admins."
            rows={3}
          />
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
          >
            <UserX className="h-4 w-4" />
            {isSaving ? "Denying..." : "Deny Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type BulkLinkStatus = "pending" | "linking" | "linked" | "error";

type BulkLinkDialogProps = {
  open: boolean;
  accounts: PendingClerkUser[];
  statuses: Record<string, BulkLinkStatus>;
  errors: Record<string, string>;
  isRunning: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function BulkLinkDialog({
  open,
  accounts,
  statuses,
  errors,
  isRunning,
  onOpenChange,
  onConfirm,
}: BulkLinkDialogProps) {
  const isDone =
    !isRunning &&
    accounts.length > 0 &&
    accounts.every((account) => statuses[account.clerkUserId] === "linked" || statuses[account.clerkUserId] === "error");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isRunning) onOpenChange(next);
      }}
    >
      <DialogContent className="grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Matched Accounts</DialogTitle>
          <DialogDescription>
            Each account below shares its email with an existing profile that has
            no sign-in linked. Linking attaches the sign-in and leaves the
            profile&apos;s name and roles as they are.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-full min-h-0 rounded-md border p-2">
          <ul className="space-y-2">
            {accounts.map((user) => {
              const status = statuses[user.clerkUserId] ?? "pending";
              return (
                <li
                  key={user.clerkUserId}
                  className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {getDisplayName(user)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      → {user.matchingProfile?.name}
                    </p>
                    {status === "error" && errors[user.clerkUserId] ? (
                      <p className="text-xs text-destructive">
                        {errors[user.clerkUserId]}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {status === "linking" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : null}
                    {status === "linked" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : null}
                    {status === "error" ? (
                      <UserX className="h-4 w-4 text-destructive" />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:justify-end">
          {isDone ? (
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isRunning}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onConfirm}
                disabled={isRunning || accounts.length === 0}
              >
                <Link2 className="h-4 w-4" />
                {isRunning
                  ? "Linking..."
                  : `Link ${accounts.length} account${accounts.length === 1 ? "" : "s"}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PendingUsersPanel({
  canEdit,
  roles,
  onApproved,
  onCountChange,
}: PendingUsersPanelProps) {
  const [pending, setPending] = useState<PendingClerkUser[]>([]);
  const [denied, setDenied] = useState<DeniedClerkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deniedOpen, setDeniedOpen] = useState(false);

  const [approveTarget, setApproveTarget] = useState<ApproveTarget | null>(null);
  const [denyTarget, setDenyTarget] = useState<PendingClerkUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTargets, setBulkTargets] = useState<PendingClerkUser[]>([]);
  const [bulkStatuses, setBulkStatuses] = useState<
    Record<string, BulkLinkStatus>
  >({});
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});
  const [bulkRunning, setBulkRunning] = useState(false);

  const matchedPending = useMemo(
    () => pending.filter((user) => user.matchingProfile),
    [pending],
  );

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    onCountChangeRef.current?.(pending.length);
  }, [pending]);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setIsLoading(true);
    else setIsRefreshing(true);
    setLoadError(null);
    try {
      const result = await fetchPendingUsers();
      setPending(result.pending);
      setDenied(result.denied);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load pending sign-ups.";
      setLoadError(message);
      if (mode === "refresh") toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  const removeEverywhere = (clerkUserId: string) => {
    setPending((current) => current.filter((u) => u.clerkUserId !== clerkUserId));
    setDenied((current) => current.filter((u) => u.clerkUserId !== clerkUserId));
  };

  const handleApprove = async (input: { name: string; roleIds: string[] }) => {
    if (!approveTarget) return;
    const target = approveTarget;
    setBusyId(target.clerkUserId);
    try {
      const user = await approvePendingUser(target.clerkUserId, {
        name: target.matchingProfile ? undefined : input.name,
        roleIds: input.roleIds,
      });
      removeEverywhere(target.clerkUserId);
      setApproveTarget(null);
      onApproved?.(user);
      toast.success(
        target.matchingProfile
          ? `Linked ${getDisplayName(target)} to the existing profile.`
          : `Approved ${getDisplayName(target)}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to approve this account.";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const openBulkLink = () => {
    const targets = matchedPending;
    const initialStatuses: Record<string, BulkLinkStatus> = {};
    targets.forEach((user) => {
      initialStatuses[user.clerkUserId] = "pending";
    });
    setBulkTargets(targets);
    setBulkStatuses(initialStatuses);
    setBulkErrors({});
    setBulkOpen(true);
  };

  const handleBulkLink = async () => {
    setBulkRunning(true);
    let successCount = 0;
    let failCount = 0;

    for (const target of bulkTargets) {
      setBulkStatuses((current) => ({
        ...current,
        [target.clerkUserId]: "linking",
      }));
      try {
        const user = await approvePendingUser(target.clerkUserId, {});
        successCount += 1;
        setBulkStatuses((current) => ({
          ...current,
          [target.clerkUserId]: "linked",
        }));
        removeEverywhere(target.clerkUserId);
        onApproved?.(user);
      } catch (error) {
        failCount += 1;
        const message =
          error instanceof Error ? error.message : "Failed to link this account.";
        setBulkStatuses((current) => ({
          ...current,
          [target.clerkUserId]: "error",
        }));
        setBulkErrors((current) => ({
          ...current,
          [target.clerkUserId]: message,
        }));
      }
    }

    setBulkRunning(false);
    if (successCount > 0) {
      toast.success(
        `Linked ${successCount} account${successCount === 1 ? "" : "s"}.`,
      );
    }
    if (failCount > 0) {
      toast.error(
        `${failCount} account${failCount === 1 ? "" : "s"} failed to link.`,
      );
    }
  };

  const handleDeny = async (note: string) => {
    if (!denyTarget) return;
    const target = denyTarget;
    setBusyId(target.clerkUserId);
    try {
      const review = await denyPendingUser(target.clerkUserId, note || undefined);
      setPending((current) =>
        current.filter((u) => u.clerkUserId !== target.clerkUserId),
      );
      setDenied((current) => [
        {
          ...target,
          note: review.note,
          reviewedAt: review.reviewed_at,
          reviewedBy: null,
        },
        ...current.filter((u) => u.clerkUserId !== target.clerkUserId),
      ]);
      setDenyTarget(null);
      setDeniedOpen(true);
      toast.success(`Denied ${getDisplayName(target)}.`);
      // Pull the reviewer name and any server-side normalisation.
      void load("refresh");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to deny this account.";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const handleClearDenial = async (target: DeniedClerkUser) => {
    setBusyId(target.clerkUserId);
    try {
      await clearDenial(target.clerkUserId);
      setDenied((current) =>
        current.filter((u) => u.clerkUserId !== target.clerkUserId),
      );
      setPending((current) => {
        const rest = current.filter((u) => u.clerkUserId !== target.clerkUserId);
        const base: PendingClerkUser = {
          clerkUserId: target.clerkUserId,
          email: target.email,
          name: target.name,
          imageUrl: target.imageUrl,
          createdAt: target.createdAt,
          lastSignInAt: target.lastSignInAt,
          matchingProfile: target.matchingProfile,
        };
        return [...rest, base].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
      });
      toast.success(`${getDisplayName(target)} moved back to pending.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear this denial.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Pending approval</h2>
          <p className="text-sm text-muted-foreground">
            Accounts that signed in but do not have a member profile yet.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canEdit && matchedPending.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || isRefreshing || bulkRunning}
              onClick={openBulkLink}
            >
              <Link2 className="h-4 w-4" />
              Link matched ({matchedPending.length})
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Refresh pending accounts"
            disabled={isLoading || isRefreshing}
            onClick={() => void load("refresh")}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load("refresh")}
          >
            Try again
          </Button>
        </div>
      ) : pending.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCheck />
            </EmptyMedia>
            <EmptyTitle>No accounts waiting for approval</EmptyTitle>
            <EmptyDescription>
              New sign-ups will show up here until an admin approves or denies
              them.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-2">
          {pending.map((user) => {
            const isBusy = busyId === user.clerkUserId;
            return (
              <li
                key={user.clerkUserId}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <AccountIdentity user={user} />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Signed up {formatRelative(user.createdAt)}
                    </span>
                    {user.matchingProfile ? (
                      <Badge variant="secondary">
                        Matches existing profile: {user.matchingProfile.name}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {canEdit ? (
                  <div className="flex shrink-0 gap-2 sm:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      disabled={isBusy || bulkRunning}
                      onClick={() => setApproveTarget(user)}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      disabled={isBusy || bulkRunning}
                      onClick={() => setDenyTarget(user)}
                    >
                      <UserX className="h-4 w-4" />
                      Deny
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && denied.length > 0 ? (
        <Collapsible open={deniedOpen} onOpenChange={setDeniedOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
            >
              <span>Denied ({denied.length})</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${deniedOpen ? "rotate-180" : ""}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 space-y-2">
              {denied.map((user) => {
                const isBusy = busyId === user.clerkUserId;
                return (
                  <li
                    key={user.clerkUserId}
                    className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-2">
                      <AccountIdentity user={user} />
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          Denied {formatRelative(user.reviewedAt)}
                          {user.reviewedBy?.name
                            ? ` by ${user.reviewedBy.name}`
                            : ""}
                          {" · "}Signed up {formatRelative(user.createdAt)}
                        </p>
                        {user.note ? (
                          <p className="whitespace-pre-wrap text-foreground/80">
                            {user.note}
                          </p>
                        ) : null}
                        {user.matchingProfile ? (
                          <Badge variant="secondary">
                            Matches existing profile: {user.matchingProfile.name}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {canEdit ? (
                      <div className="flex shrink-0 gap-2 sm:justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1 sm:flex-none"
                          disabled={isBusy}
                          onClick={() => setApproveTarget(user)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          disabled={isBusy}
                          onClick={() => void handleClearDenial(user)}
                        >
                          {isBusy ? "Clearing..." : "Clear denial"}
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      <ApproveUserDialog
        target={approveTarget}
        roles={roles}
        isSaving={Boolean(approveTarget && busyId === approveTarget.clerkUserId)}
        onOpenChange={(open) => {
          if (!open && !busyId) setApproveTarget(null);
        }}
        onConfirm={handleApprove}
      />
      <DenyUserDialog
        target={denyTarget}
        isSaving={Boolean(denyTarget && busyId === denyTarget.clerkUserId)}
        onOpenChange={(open) => {
          if (!open && !busyId) setDenyTarget(null);
        }}
        onConfirm={handleDeny}
      />
      <BulkLinkDialog
        open={bulkOpen}
        accounts={bulkTargets}
        statuses={bulkStatuses}
        errors={bulkErrors}
        isRunning={bulkRunning}
        onOpenChange={setBulkOpen}
        onConfirm={() => void handleBulkLink()}
      />
    </div>
  );
}
