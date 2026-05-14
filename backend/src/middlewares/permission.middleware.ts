import { NextFunction, Request, Response } from "express";
import { AUTH_WHITELIST_PREFIX } from "../constants/auth";

export function permissionMiddleware(request: Request, _response: Response, next: NextFunction) {
  if (request.routeMeta?.isPublic || request.routeMeta?.skipPermission) {
    return next();
  }

  if (!request.user) {
    const error = new Error("Unauthorized") as Error & { statusCode?: number };
    error.statusCode = 401;
    return next(error);
  }

  if (request.originalUrl.startsWith(AUTH_WHITELIST_PREFIX)) {
    return next();
  }

  const targetMethod = request.method;
  const targetPath = request.routeMeta?.permissionPath;
  const permissions = request.user.permissions ?? [];

  const hasPermission = permissions.some((permission) => {
    return permission.method === targetMethod && permission.apiPath === targetPath;
  });

  if (!hasPermission) {
    const error = new Error("Bạn không có quyền để truy cập endpoint này!") as Error & {
      statusCode?: number;
    };
    error.statusCode = 403;
    return next(error);
  }

  return next();
}
