import { PermissionPayload } from "../../types/express";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  permissions: PermissionPayload[];
};
