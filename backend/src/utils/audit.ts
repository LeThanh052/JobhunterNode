import { RequestUser } from "../types/express";

export function buildAuditUser(user: RequestUser) {
  return {
    id: user.id,
    email: user.email
  };
}
