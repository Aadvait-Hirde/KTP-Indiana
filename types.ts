import type { RoleType } from "@/lib/supabase";

export type { RoleType };

export const ROLE_TYPE_OPTIONS: ReadonlyArray<{
  value: RoleType;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General",
    description: "Positions, committees, distinctions, and other groupings.",
  },
  {
    value: "pledge_class",
    label: "Pledge Class",
    description:
      "Identifies which pledge class a member joined with. Members holding a pledge-class role appear on the public members page.",
  },
];

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  hidden: boolean;
  priority: number;
  type: RoleType;
};

export type PermissionRecord = {
  id?: string;
  key: string;
  description: string;
};

export type RolePermissionRow = {
  role_id: string | null;
  permission_id?: string | null;
  permission_key?: string | null;
  permission?: string | null;
  key?: string | null;
};

export type CreateRoleFormState = {
  name: string;
  description: string;
  hidden: boolean;
  type: RoleType;
};

export type DropIndicator = {
  roleId: string;
  position: "before" | "after";
};
