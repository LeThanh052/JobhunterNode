import { Response } from "express";

export function sendSuccess(response: Response, data: unknown, message = "") {
  return response.status(response.statusCode || 200).json({
    statusCode: response.statusCode || 200,
    message,
    data
  });
}
