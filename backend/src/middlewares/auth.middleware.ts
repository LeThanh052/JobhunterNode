import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt";
import { authService } from "../modules/auth/auth.service";

type TokenPayload = JwtPayload & {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
};

function unauthorized() {
  const error = new Error("Token không hợp lệ or không có token ở Bearer Token ở Header request!") as Error & {
    statusCode?: number;
  };
  error.statusCode = 401;
  return error;
}

export function requireAuth() {
  return async (request: Request, _response: Response, next: NextFunction) => {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

    if (!token) {
      return next(unauthorized());
    }

    try {
      const payload = verifyAccessToken(token) as TokenPayload;
      const hydratedUser = await authService.loadUserPermissions(payload.id);

      if (!hydratedUser) {
        return next(unauthorized());
      }

      request.user = hydratedUser;
      return next();
    } catch {
      return next(unauthorized());
    }
  };
}
