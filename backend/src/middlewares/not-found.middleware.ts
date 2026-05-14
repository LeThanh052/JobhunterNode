import { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(request: Request, _response: Response, next: NextFunction) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`) as Error & {
    statusCode?: number;
  };
  error.statusCode = 404;
  next(error);
}
