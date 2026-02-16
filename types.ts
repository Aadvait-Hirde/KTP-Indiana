export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  hidden: boolean;
  priority: number;
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
};

export type DropIndicator = {
  roleId: string;
  position: "before" | "after";
};
