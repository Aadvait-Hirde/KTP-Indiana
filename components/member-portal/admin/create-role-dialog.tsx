"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { CreateRoleFormState } from "@/types";

type CreateRoleDialogProps = {
  open: boolean;
  form: CreateRoleFormState;
  error: string;
  isCreatingRole: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (next: CreateRoleFormState) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

export function CreateRoleDialog({
  open,
  form,
  error,
  isCreatingRole,
  onOpenChange,
  onFormChange,
  onSubmit,
  onCancel,
}: CreateRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Add a role. Permissions can be configured after creation.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Role Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  onFormChange({ ...form, name: event.target.value })
                }
                placeholder="e.g. Events Director"
              />
              <p className="text-xs text-muted-foreground">
                This field is required.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  onFormChange({ ...form, description: event.target.value })
                }
                placeholder="Explain what this role can do."
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Hidden Role</p>
                <p className="text-xs text-muted-foreground">
                  Hidden roles can be used internally without being listed in
                  standard views.
                </p>
              </div>
              <Switch
                checked={form.hidden}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, hidden: checked })
                }
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="mt-4">
            <div className="mr-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              Press
              <Kbd>Enter</Kbd>
              to create
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreatingRole}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingRole}>
              {isCreatingRole ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
