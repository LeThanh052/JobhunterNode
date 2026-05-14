import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt";
import { authService } from "../modules/auth/auth.service";

type TokenPayload = JwtPayload & {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
};

export async function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  if (request.routeMeta?.isPublic) {
    return next();
  }

  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    const error = new Error("Token không hợp lệ or không có token ở Bearer Token ở Header request!") as Error & {
      statusCode?: number;
    };
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = verifyAccessToken(token) as TokenPayload;
    const hydratedUser = await authService.loadUserPermissions(payload._id);

    if (!hydratedUser) {
      const error = new Error("Token không hợp lệ or không có token ở Bearer Token ở Header request!") as Error & {
        statusCode?: number;
      };
      error.statusCode = 401;
      return next(error);
    }

    request.user = hydratedUser;
    return next();
  } catch {
    const error = new Error("Token không hợp lệ or không có token ở Bearer Token ở Header request!") as Error & {
      statusCode?: number;
    };
    error.statusCode = 401;
    return next(error);
  }
}
