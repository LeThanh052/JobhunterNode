import type { Request } from "express";

export type PermissionPayload = {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
};

export type RequestUser = {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: PermissionPayload[];
};

declare module "express-serve-static-core" {
  interface Request {
    user?: RequestUser;
    routeMeta?: {
      isPublic?: boolean;
      skipPermission?: boolean;
      message?: string;
      permissionPath?: string;
    };
  }
}

export type AppRequest = Request;
