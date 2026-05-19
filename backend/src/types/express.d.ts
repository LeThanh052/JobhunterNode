import type { Request } from "express";

export type PermissionPayload = {
  id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
};

export type RequestUser = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  permissions?: PermissionPayload[];
};

declare module "express-serve-static-core" {
  interface Request {
    user?: RequestUser;
  }
}

export type AppRequest = Request;
