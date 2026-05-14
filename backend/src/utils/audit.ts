import { RequestUser } from "../types/express";

export function buildAuditUser(user: RequestUser) {
  return {
    _id: user._id,
    email: user.email
  };
}
