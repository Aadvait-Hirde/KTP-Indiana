"use client";

import { DragEvent } from "react";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropIndicator, RoleRecord } from "@/types";

type RolesListPanelProps = {
  roles: RoleRecord[];
  selectedRoleId: string | null;
  hasUnsavedChanges: boolean;
  dropIndicator: DropIndicator | null;
  onSelectRole: (roleId: string) => void;
  onBlockedSelect: () => void;
  onDragStartRole: (
    roleId: string,
    event: DragEvent<HTMLButtonElement>,
  ) => void;
  onDragOverRole: (roleId: string, event: DragEvent<HTMLButtonElement>) => void;
  onDragLeaveRole: (roleId: string) => void;
  onDropRole: (roleId: string, event: DragEvent<HTMLButtonElement>) => void;
  onDragEndRole: () => void;
};

export function RolesListPanel({
  roles,
  selectedRoleId,
  hasUnsavedChanges,
  dropIndicator,
  onSelectRole,
  onBlockedSelect,
  onDragStartRole,
  onDragOverRole,
  onDragLeaveRole,
  onDropRole,
  onDragEndRole,
}: RolesListPanelProps) {
  return (
    <div className="w-full shrink-0 md:w-[280px]">
      <p className="mb-2 text-sm font-medium text-muted-foreground">Roles</p>
      <div className="max-h-[calc(100dvh-14rem)] space-y-1 overflow-y-auto pr-1">
        {roles.map((role) => {
          const isSelected = role.id === selectedRoleId;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                if (
                  hasUnsavedChanges &&
                  selectedRoleId &&
                  role.id !== selectedRoleId
                ) {
                  onBlockedSelect();
                  return;
                }
                onSelectRole(role.id);
              }}
              className={cn(
                "relative w-full rounded-md px-3 py-2 text-left transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "bg-transparent text-foreground hover:bg-accent/60",
              )}
              draggable
              onDragStart={(event) => onDragStartRole(role.id, event)}
              onDragOver={(event) => onDragOverRole(role.id, event)}
              onDragLeave={() => onDragLeaveRole(role.id)}
              onDrop={(event) => onDropRole(role.id, event)}
              onDragEnd={onDragEndRole}
            >
              {dropIndicator?.roleId === role.id &&
              dropIndicator.position === "before" ? (
                <div className="pointer-events-none absolute top-0 right-2 left-2 border-t-2 border-primary" />
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {role.name}
                  </span>
                  {role.hidden ? (
                    <EyeOff
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-label="Hidden role"
                    />
                  ) : null}
                </span>
              </div>

              {dropIndicator?.roleId === role.id &&
              dropIndicator.position === "after" ? (
                <div className="pointer-events-none absolute right-2 bottom-0 left-2 border-t-2 border-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
