import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

type AppError = Error & {
  statusCode?: number;
  details?: unknown;
};

export function errorMiddleware(
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      statusCode: 400,
      message: "Validation failed",
      error: error.flatten()
    });
  }

  const statusCode = error.statusCode ?? 500;

  return response.status(statusCode).json({
    statusCode,
    message: error.message || "Internal server error"
  });
}
