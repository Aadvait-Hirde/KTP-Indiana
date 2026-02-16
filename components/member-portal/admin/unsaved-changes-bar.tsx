"use client";

import { Button } from "@/components/ui/button";

type UnsavedChangesBarProps = {
  isSaving: boolean;
  onCancelChanges: () => void;
  onSaveChanges: () => void;
};

export function UnsavedChangesBar({
  isSaving,
  onCancelChanges,
  onSaveChanges,
}: UnsavedChangesBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 mt-4 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
        <p className="mr-3 text-sm text-muted-foreground">
          You have unsaved role changes.
        </p>
        <Button
          variant="outline"
          onClick={onCancelChanges}
          disabled={isSaving}
          size="sm"
        >
          Cancel Changes
        </Button>
        <Button onClick={onSaveChanges} disabled={isSaving} size="sm">
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
