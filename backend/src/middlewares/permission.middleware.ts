import { NextFunction, Request, Response } from "express";
function unauthorized() {
  const error = new Error("Unauthorized") as Error & { statusCode?: number };
  error.statusCode = 401;
  return error;
}

function forbidden() {
  const error = new Error("Bạn không có quyền để truy cập endpoint này!") as Error & {
    statusCode?: number;
  };
  error.statusCode = 403;
  return error;
}

export function requirePermission(method: string, apiPath: string) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(unauthorized());
    }

    const permissions = request.user.permissions ?? [];
    const hasPermission = permissions.some((permission) => {
      return permission.method === method && permission.apiPath === apiPath;
    });

    if (!hasPermission) {
      return next(forbidden());
    }

    return next();
  };
}
