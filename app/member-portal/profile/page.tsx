"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Instagram, Linkedin, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { supabase, type Role } from "@/lib/supabase";
import { getGradeLabel, getPledgeClassRole } from "@/lib/members";
import { AVATAR_ACCEPT, validateAvatarFile } from "@/lib/avatar-upload";
import { uploadMyAvatar } from "@/lib/profile-client";
import { getSocialUrl } from "@/components/member-portal/admin/users/users-utils";
import { AvatarCropDialog } from "@/components/avatar-crop-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

type PledgeClassRole = Pick<Role, "id" | "name" | "type" | "priority">;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const record = error as { code?: unknown; message?: unknown };
    if (record.code === "42501") {
      return "You can only change your name and photo. Contact an administrator for anything else.";
    }
    if (typeof record.message === "string" && record.message) {
      return record.message;
    }
  }
  return fallback;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pledgeClass, setPledgeClass] = useState<PledgeClassRole | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Keep the editable name in sync with the stored profile (initial load,
  // and after an admin/self update refreshes the store).
  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const loadRoles = async () => {
      setIsLoadingRoles(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("roles(id,name,type,priority)")
        .eq("user_id", user.id);

      if (cancelled) return;
      if (error) {
        console.error("Failed to load roles for profile:", error);
        setPledgeClass(null);
      } else {
        const roles = (data ?? [])
          .flatMap((row) => {
            const value = (row as { roles?: unknown }).roles;
            return Array.isArray(value) ? value : value ? [value] : [];
          })
          .filter(
            (role): role is PledgeClassRole =>
              Boolean(role) &&
              typeof role === "object" &&
              typeof (role as { name?: unknown }).name === "string" &&
              typeof (role as { type?: unknown }).type === "string",
          );
        setPledgeClass(getPledgeClassRole(roles));
      }
      setIsLoadingRoles(false);
    };

    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const trimmedName = name.trim();
  const canSaveName =
    Boolean(user) &&
    trimmedName.length > 0 &&
    trimmedName !== (user?.name ?? "") &&
    !isSavingName;

  const gradeLabel = useMemo(
    () => (user ? getGradeLabel(user.graduation_year, user.is_alumni) : null),
    [user],
  );
  const instagramUrl = user ? getSocialUrl(user, "insta") : "";
  const linkedinUrl = user ? getSocialUrl(user, "linkedin") : "";

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again re-triggers onChange.
    event.target.value = "";
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setPendingAvatarFile(file);
  };

  const handleAvatarConfirm = async (croppedFile: File) => {
    setIsUploadingAvatar(true);
    try {
      const updated = await uploadMyAvatar(croppedFile);
      updateUser(updated);
      setPendingAvatarFile(null);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload profile picture."));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!user || !canSaveName) return;
    setIsSavingName(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name: trimmedName })
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      updateUser(data);
      toast.success("Name updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update your name."));
    } finally {
      setIsSavingName(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-3xl space-y-4 md:space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold md:text-3xl">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update your name and photo. Contact an administrator to change
            anything else.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>
              Shown on the members page and throughout the portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="h-24 w-24 rounded-lg text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, or GIF up to 4MB. You can crop it before
                  saving.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Your name is how other members see you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveName();
              }}
            >
              <Label htmlFor="profile-name">Name</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="profile-name"
                  value={name}
                  maxLength={120}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="sm:h-9"
                  disabled={!canSaveName}
                >
                  {isSavingName ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                <span>Managed by admins</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-major">Major</Label>
                  <Input
                    id="profile-major"
                    value={user.major ?? ""}
                    placeholder="Not set"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-grad-year">Graduation Year</Label>
                  <Input
                    id="profile-grad-year"
                    value={user.graduation_year ?? ""}
                    placeholder="Not set"
                    disabled
                  />
                  {gradeLabel ? (
                    <p className="text-xs text-muted-foreground">{gradeLabel}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-pledge-class">Pledge Class</Label>
                  {isLoadingRoles ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Input
                      id="profile-pledge-class"
                      value={pledgeClass?.name ?? ""}
                      placeholder="Not assigned"
                      disabled
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="profile-instagram"
                      className="pl-9"
                      value={instagramUrl}
                      placeholder="Not set"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="profile-linkedin"
                      className="pl-9"
                      value={linkedinUrl}
                      placeholder="Not set"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Alumni</p>
                  <p className="text-xs text-muted-foreground">
                    Set by an administrator once you graduate.
                  </p>
                </div>
                <Switch checked={Boolean(user.is_alumni)} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AvatarCropDialog
        open={pendingAvatarFile !== null}
        file={pendingAvatarFile}
        isUploading={isUploadingAvatar}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingAvatarFile(null);
        }}
        onConfirm={handleAvatarConfirm}
      />
    </div>
  );
}
