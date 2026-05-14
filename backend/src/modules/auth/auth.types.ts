import { PermissionPayload } from "../../types/express";

export type AuthenticatedUser = {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  permissions: PermissionPayload[];
};
